"""CockroachDB-backed persistent memory for listings, buyers, and interactions.

Structured facts and OpenAI embeddings live in the same serializable database. Every
query is tenant-prefixed; semantic recall uses CockroachDB's distributed vector index.
"""

from __future__ import annotations

import asyncio
import hashlib
import json
import os
import random
import re
from collections import OrderedDict
from collections.abc import Awaitable, Callable
from typing import Any, TypeVar
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

import asyncpg
from openai import AsyncOpenAI

from src import telemetry
from src.core.config import config

T = TypeVar("T")
_pool: asyncpg.Pool | None = None
_pool_lock = asyncio.Lock()
_EMBEDDING_MODEL = os.getenv("MEMORY_EMBEDDING_MODEL", "text-embedding-3-small")
_EMBEDDING_DIMENSIONS = int(os.getenv("MEMORY_EMBEDDING_DIMENSIONS", "1536"))
_embed_cache: OrderedDict[str, list[float]] = OrderedDict()
_embed_lock = asyncio.Lock()
_embed_slots = asyncio.Semaphore(int(os.getenv("MEMORY_EMBEDDING_CONCURRENCY", "4")))


def _database_url() -> str:
    """Return an asyncpg-compatible CockroachDB/PostgreSQL wire URL."""
    url = config.DATABASE_URL or config.SQLALCHEMY_DATABASE_URI
    parts = urlsplit(url)
    query = [(k, v) for k, v in parse_qsl(parts.query) if k != "channel_binding"]
    return urlunsplit(("postgresql", parts.netloc, parts.path, urlencode(query), ""))


async def get_memory_pool() -> asyncpg.Pool:
    global _pool
    if _pool is None:
        async with _pool_lock:
            if _pool is None:
                _pool = await asyncpg.create_pool(
                    _database_url(),
                    min_size=int(os.getenv("DB_POOL_MIN_SIZE", "1")),
                    max_size=int(os.getenv("DB_POOL_MAX_SIZE", "8")),
                    max_inactive_connection_lifetime=300,
                    command_timeout=30,
                    server_settings={"application_name": "superreality-memory"},
                )
    return _pool


async def close_memory_pool() -> None:
    global _pool
    if _pool is not None:
        await _pool.close()
        _pool = None


async def _retry_transaction(
    operation: Callable[[asyncpg.Connection], Awaitable[T]],
) -> T:
    """Retry CockroachDB serialization conflicts without duplicating application logic."""
    pool = await get_memory_pool()
    for attempt in range(5):
        try:
            async with pool.acquire() as connection, connection.transaction():
                return await operation(connection)
        except asyncpg.PostgresError as exc:
            if exc.sqlstate != "40001" or attempt == 4:
                raise
        await asyncio.sleep((0.025 * (2**attempt)) + random.random() * 0.025)
    raise RuntimeError("unreachable")


def normalize_phone(phone: str | None) -> str:
    return re.sub(r"\D", "", phone or "")


def buyer_dataset(tenant_id: str, phone: str) -> str:
    """Compatibility key retained for callers; now maps to a CockroachDB memory key."""
    return f"tenant_{tenant_id}_buyer_{normalize_phone(phone)}"


def _listing_text(item: dict[str, Any]) -> str:
    fields = [
        item.get("code"),
        item.get("address"),
        item.get("area") or item.get("neighbourhood"),
        item.get("city"),
        f"{item.get('beds')} bedrooms" if item.get("beds") is not None else None,
        f"{item.get('baths')} bathrooms" if item.get("baths") is not None else None,
        f"price {item.get('price')}" if item.get("price") is not None else None,
        item.get("description"),
    ]
    return ". ".join(str(value) for value in fields if value)


def _buyer_text(buyer: dict[str, Any]) -> str:
    return (
        f"Buyer {buyer.get('name') or 'unknown'}, phone {buyer.get('phone')}. "
        f"Preferences: {json.dumps(buyer.get('criteria') or {}, sort_keys=True)}. "
        f"{buyer.get('summary') or ''}"
    ).strip()


def _vector_literal(vector: list[float]) -> str:
    return "[" + ",".join(f"{value:.8g}" for value in vector) + "]"


async def _embed(text: str, *, tenant_id: str) -> list[float] | None:
    """Embed once, cache repeated catalog text, and meter the OpenAI usage explicitly."""
    if not text.strip() or not os.getenv("OPENAI_API_KEY"):
        return None
    key = hashlib.sha256(f"{_EMBEDDING_MODEL}\0{text}".encode()).hexdigest()
    async with _embed_lock:
        cached = _embed_cache.get(key)
        if cached is not None:
            _embed_cache.move_to_end(key)
            return cached
    async with _embed_slots:
        response = await AsyncOpenAI().embeddings.create(
            model=_EMBEDDING_MODEL,
            input=text,
            dimensions=_EMBEDDING_DIMENSIONS,
        )
    vector = response.data[0].embedding
    async with _embed_lock:
        _embed_cache[key] = vector
        _embed_cache.move_to_end(key)
        while len(_embed_cache) > 1024:
            _embed_cache.popitem(last=False)
    usage = response.usage
    await telemetry.record_llm_usage(
        model=_EMBEDDING_MODEL,
        prompt_tokens=float(usage.prompt_tokens if usage else 0),
        operation="cockroach.memory.embedding",
        kind="embedding",
        tenant_id=tenant_id,
    )
    return vector


def _record(row: asyncpg.Record) -> dict[str, Any]:
    value = dict(row)
    for key in ("criteria", "metadata"):
        if isinstance(value.get(key), str):
            value[key] = json.loads(value[key])
    return value


class MemoryStore:
    """Tenant-isolated agent memory in CockroachDB."""

    @telemetry.track("cockroach.memory.add_listings")
    async def add_listings(
        self, tenant_id: str, realtor: dict[str, Any], listings: list[dict[str, Any]]
    ) -> list[dict[str, Any]]:
        async def write_realtor(conn: asyncpg.Connection) -> None:
            await conn.execute(
                """INSERT INTO memory_realtors
                   (tenant_id, name, email, agency, area, tagline, tone, updated_at)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,now())
                   ON CONFLICT (tenant_id) DO UPDATE SET name=excluded.name,
                   email=excluded.email, agency=excluded.agency, area=excluded.area,
                   tagline=excluded.tagline, tone=excluded.tone, updated_at=now()""",
                tenant_id,
                realtor["name"],
                realtor.get("email"),
                realtor.get("agency"),
                realtor.get("area"),
                realtor.get("tagline"),
                realtor.get("tone"),
            )

        await _retry_transaction(write_realtor)
        await asyncio.gather(
            *(self.add_single_listing(tenant_id, item) for item in listings)
        )
        return listings

    @telemetry.track("cockroach.memory.add_listing")
    async def add_single_listing(
        self, tenant_id: str, item: dict[str, Any]
    ) -> dict[str, Any]:
        content = _listing_text(item)
        vector = await _embed(content, tenant_id=tenant_id)

        async def write(conn: asyncpg.Connection) -> None:
            await conn.execute(
                """INSERT INTO memory_listings
                   (tenant_id, code, address, price, beds, baths, sqft, description,
                    image_url, area, city, content, embedding, updated_at)
                   VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13::VECTOR,now())
                   ON CONFLICT (tenant_id, code) DO UPDATE SET address=excluded.address,
                   price=excluded.price, beds=excluded.beds, baths=excluded.baths,
                   sqft=excluded.sqft, description=excluded.description,
                   image_url=excluded.image_url, area=excluded.area, city=excluded.city,
                   content=excluded.content, embedding=excluded.embedding, updated_at=now()""",
                tenant_id,
                item["code"],
                item["address"],
                item.get("price"),
                item.get("beds"),
                item.get("baths"),
                item.get("sqft"),
                item.get("description"),
                item.get("image_url"),
                item.get("area") or item.get("neighbourhood"),
                item.get("city"),
                content,
                _vector_literal(vector) if vector else None,
            )

        await _retry_transaction(write)
        return item

    @telemetry.track("cockroach.memory.recall")
    async def recall(
        self, tenant_id: str, criteria: dict[str, Any] | str, top_k: int = 5
    ) -> list[Any]:
        structured = criteria if isinstance(criteria, dict) else {}
        query = criteria if isinstance(criteria, str) else json.dumps(criteria)
        vector = await _embed(query, tenant_id=tenant_id)
        area = structured.get("area")
        max_price = structured.get("maxPrice")
        min_beds = structured.get("minBeds")
        pool = await get_memory_pool()
        async with pool.acquire() as conn:
            if vector:
                rows = await conn.fetch(
                    """SELECT code,address,price,beds,baths,sqft,description,image_url,area,city
                       FROM memory_listings
                       WHERE tenant_id=$1 AND ($2::STRING IS NULL OR lower(area) LIKE '%'||lower($2)||'%')
                         AND ($3::DECIMAL IS NULL OR price <= $3)
                         AND ($4::INT IS NULL OR beds >= $4) AND embedding IS NOT NULL
                       ORDER BY embedding <-> $5::VECTOR LIMIT $6""",
                    tenant_id,
                    area,
                    max_price,
                    min_beds,
                    _vector_literal(vector),
                    top_k,
                )
            else:
                rows = await conn.fetch(
                    """SELECT code,address,price,beds,baths,sqft,description,image_url,area,city
                       FROM memory_listings WHERE tenant_id=$1
                       AND ($2::STRING IS NULL OR lower(area) LIKE '%'||lower($2)||'%')
                       AND ($3::DECIMAL IS NULL OR price <= $3)
                       AND ($4::INT IS NULL OR beds >= $4)
                       ORDER BY updated_at DESC LIMIT $5""",
                    tenant_id,
                    area,
                    max_price,
                    min_beds,
                    top_k,
                )
        return [_record(row) for row in rows]

    async def list_listings(self, tenant_id: str) -> list[dict[str, Any]]:
        pool = await get_memory_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """SELECT code,address,price,beds,baths,sqft,description,image_url,area,city
                   FROM memory_listings WHERE tenant_id=$1 ORDER BY updated_at DESC""",
                tenant_id,
            )
        return [_record(row) for row in rows]

    async def get_realtor(self, tenant_id: str) -> dict[str, Any] | None:
        pool = await get_memory_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT name,agency,area,tagline,tone FROM memory_realtors WHERE tenant_id=$1",
                tenant_id,
            )
        return _record(row) if row else None

    async def list_buyers(self, tenant_id: str) -> list[dict[str, Any]]:
        pool = await get_memory_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """SELECT phone,name,email,criteria,summary FROM memory_buyers
                   WHERE tenant_id=$1 ORDER BY updated_at DESC""",
                tenant_id,
            )
        return [_record(row) for row in rows]

    @telemetry.track("cockroach.memory.match")
    async def match_buyers(self, tenant_id: str, listing: dict[str, Any]) -> str:
        vector = await _embed(_listing_text(listing), tenant_id=tenant_id)
        pool = await get_memory_pool()
        async with pool.acquire() as conn:
            if vector:
                rows = await conn.fetch(
                    """SELECT name,phone,criteria FROM memory_buyers WHERE tenant_id=$1
                       AND embedding IS NOT NULL ORDER BY embedding <-> $2::VECTOR LIMIT 5""",
                    tenant_id,
                    _vector_literal(vector),
                )
            else:
                rows = await conn.fetch(
                    "SELECT name,phone,criteria FROM memory_buyers WHERE tenant_id=$1 LIMIT 5",
                    tenant_id,
                )
        matches = [_record(row) for row in rows]
        return "; ".join(
            f"{buyer.get('name') or buyer['phone']} matches preferences {buyer.get('criteria') or {}}"
            for buyer in matches
        )

    @telemetry.track("cockroach.memory.upsert_buyer")
    async def upsert_buyer(
        self, tenant_id: str, buyer: dict[str, Any]
    ) -> dict[str, Any]:
        phone_key = normalize_phone(buyer["phone"])
        if not phone_key:
            raise ValueError("buyer phone must contain digits")
        content = _buyer_text(buyer)
        vector = await _embed(content, tenant_id=tenant_id)

        async def write(conn: asyncpg.Connection) -> None:
            await conn.execute(
                """INSERT INTO memory_buyers
                   (tenant_id,phone_key,phone,name,email,criteria,summary,content,embedding,updated_at)
                   VALUES ($1,$2,$3,$4,$5,$6::JSONB,$7,$8,$9::VECTOR,now())
                   ON CONFLICT (tenant_id,phone_key) DO UPDATE SET phone=excluded.phone,
                   name=coalesce(excluded.name,memory_buyers.name),
                   email=coalesce(excluded.email,memory_buyers.email),
                   criteria=excluded.criteria, summary=coalesce(excluded.summary,memory_buyers.summary),
                   content=excluded.content, embedding=excluded.embedding, updated_at=now()""",
                tenant_id,
                phone_key,
                buyer["phone"],
                buyer.get("name"),
                buyer.get("email"),
                json.dumps(buyer.get("criteria") or {}),
                buyer.get("summary"),
                content,
                _vector_literal(vector) if vector else None,
            )

        await _retry_transaction(write)
        return buyer

    @telemetry.track("cockroach.memory.get_buyer")
    async def get_buyer(self, tenant_id: str, phone: str) -> dict[str, Any]:
        pool = await get_memory_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                """SELECT phone,name,email,criteria,summary FROM memory_buyers
                   WHERE tenant_id=$1 AND phone_key=$2""",
                tenant_id,
                normalize_phone(phone),
            )
        if not row:
            return {"found": False, "phone": phone}
        data = _record(row)
        summary = data.get("summary") or _buyer_text(data)
        return {"found": True, **data, "summary": summary}

    @telemetry.track("cockroach.memory.recall_nearby")
    async def recall_nearby(self, tenant_id: str, summary: str) -> str | None:
        try:
            rows = await self.recall(tenant_id, summary, top_k=1)
        except Exception:  # best-effort voice enrichment
            return None
        if not rows:
            return None
        row = rows[0]
        return f"A nearby match is {row['address']} ({row.get('code')}), {row.get('description') or 'now available'}."

    @telemetry.track("cockroach.memory.add_showing")
    async def add_showing(
        self,
        *,
        tenant_id: str,
        phone: str | None,
        property_code: str | None,
        address: str | None,
        when_utc: str,
    ) -> None:
        content = f"Showing booked for {address or property_code} on {when_utc}."
        vector = await _embed(content, tenant_id=tenant_id)
        pool = await get_memory_pool()
        async with pool.acquire() as conn:
            await conn.execute(
                """INSERT INTO memory_interactions
                   (tenant_id,buyer_phone_key,kind,content,metadata,embedding)
                   VALUES ($1,$2,'showing',$3,$4::JSONB,$5::VECTOR)""",
                tenant_id,
                normalize_phone(phone),
                content,
                json.dumps(
                    {
                        "property_code": property_code,
                        "address": address,
                        "when_utc": when_utc,
                    }
                ),
                _vector_literal(vector) if vector else None,
            )

    @telemetry.track("cockroach.memory.improve")
    async def improve(
        self,
        tenant_id: str,
        phone: str | None = None,
        *,
        summary: str | None = None,
        transcript: list[dict[str, Any]] | None = None,
    ) -> None:
        content = summary or " ".join(
            str(turn.get("content") or turn.get("text") or "")
            for turn in transcript or []
        )
        if not content.strip():
            return
        vector = await _embed(content, tenant_id=tenant_id)

        async def write(conn: asyncpg.Connection) -> None:
            await conn.execute(
                """INSERT INTO memory_interactions
                   (tenant_id,buyer_phone_key,kind,content,metadata,embedding)
                   VALUES ($1,$2,'call',$3,$4::JSONB,$5::VECTOR)""",
                tenant_id,
                normalize_phone(phone),
                content,
                json.dumps({"transcript": transcript or []}),
                _vector_literal(vector) if vector else None,
            )
            if phone:
                await conn.execute(
                    """UPDATE memory_buyers SET summary=$3,updated_at=now()
                       WHERE tenant_id=$1 AND phone_key=$2""",
                    tenant_id,
                    normalize_phone(phone),
                    content,
                )

        await _retry_transaction(write)

    async def forget_buyer(self, tenant_id: str, phone: str) -> dict[str, Any]:
        phone_key = normalize_phone(phone)

        async def delete(conn: asyncpg.Connection) -> int:
            await conn.execute(
                "DELETE FROM memory_interactions WHERE tenant_id=$1 AND buyer_phone_key=$2",
                tenant_id,
                phone_key,
            )
            result = await conn.execute(
                "DELETE FROM memory_buyers WHERE tenant_id=$1 AND phone_key=$2",
                tenant_id,
                phone_key,
            )
            await conn.execute(
                "DELETE FROM buyer_profiles WHERE tenant_id=$1 AND regexp_replace(phone, '[^0-9]', '', 'g')=$2",
                tenant_id,
                phone_key,
            )
            return int(result.rsplit(" ", 1)[-1])

        deleted = await _retry_transaction(delete)
        return {"deleted": deleted, "phone": phone}

    async def reset_tenant(self, tenant_id: str) -> int:
        async def delete(conn: asyncpg.Connection) -> int:
            total = 0
            for table in (
                "memory_interactions",
                "memory_buyers",
                "memory_listings",
                "memory_realtors",
            ):
                result = await conn.execute(
                    f"DELETE FROM {table} WHERE tenant_id=$1", tenant_id
                )
                total += int(result.rsplit(" ", 1)[-1])
            return total

        return await _retry_transaction(delete)

    async def graph_snapshot(
        self, tenant_id: str, cap: int = 150
    ) -> dict[str, list[dict[str, Any]]]:
        pool = await get_memory_pool()
        async with pool.acquire() as conn:
            listings = await conn.fetch(
                "SELECT id,code,address,area,price,beds,updated_at FROM memory_listings WHERE tenant_id=$1 ORDER BY updated_at DESC LIMIT $2",
                tenant_id,
                cap,
            )
            buyers = await conn.fetch(
                "SELECT id,phone_key,phone,name,criteria,updated_at FROM memory_buyers WHERE tenant_id=$1 ORDER BY updated_at DESC LIMIT $2",
                tenant_id,
                cap,
            )
            interactions = await conn.fetch(
                "SELECT id,buyer_phone_key,kind,content,metadata,created_at FROM memory_interactions WHERE tenant_id=$1 ORDER BY created_at DESC LIMIT $2",
                tenant_id,
                cap,
            )
        return {
            "listings": [_record(row) for row in listings],
            "buyers": [_record(row) for row in buyers],
            "interactions": [_record(row) for row in interactions],
        }


_store: MemoryStore | None = None


def get_memory_store() -> MemoryStore:
    global _store
    if _store is None:
        _store = MemoryStore()
    return _store
