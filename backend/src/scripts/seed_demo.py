"""Seed reproducible Sarnia demo data into CockroachDB memory.

Run inside the backend image (WORKDIR /app, so `src` is importable):

    python -m src.scripts.seed_demo

Or from a host with the backend environment active:

    cd backend && uv run python -m src.scripts.seed_demo

OpenAI creates the memory embeddings, so seeding is skipped with a
friendly note when OPENAI_API_KEY is unset. That keeps an empty-.env `make up`
green instead of failing on the seed step.
"""

import asyncio
import os
from typing import Any

# The demo data is scoped to this tenant. Reach it in a local call at
# http://localhost:5173/call/demo (the room name carries the tenant to the agent).
TENANT_ID = "demo"

REALTOR: dict[str, Any] = {"name": "Riley", "email": "riley@example.com"}

LISTINGS: list[dict[str, Any]] = [
    {
        "code": "S1",
        "address": "123 Maple Street, Sarnia",
        "price": 450000,
        "beds": 3,
        "baths": 2,
        "sqft": 1500,
        "description": "Charming 3 bed bungalow near the park",
        "area": "Sarnia",
    },
    {
        "code": "S2",
        "address": "88 Lakeshore Road, Sarnia",
        "price": 625000,
        "beds": 4,
        "baths": 3,
        "sqft": 2400,
        "description": "Waterfront family home with a large yard",
        "area": "Sarnia",
    },
    {
        "code": "S3",
        "address": "12 Front Street, Sarnia",
        "price": 320000,
        "beds": 2,
        "baths": 1,
        "sqft": 1050,
        "description": "Updated downtown condo, walk to everything",
        "area": "Sarnia",
    },
]

BUYER: dict[str, Any] = {
    "phone": "+1-519-555-0100",
    "name": "Dana",
    "criteria": {"area": "Sarnia", "minBeds": 3, "maxPrice": 500000},
}


def openai_configured() -> bool:
    """True when semantic memory can create OpenAI embeddings."""
    return bool(os.getenv("OPENAI_API_KEY", "").strip())


async def seed() -> str:
    """Write the demo tenant, realtor, listings, and returning buyer."""
    # Imported lazily so the module (and its data constants) can be imported for
    # tests without opening a database connection.
    from src.memory.store import get_memory_store
    from src.repository import tenant_repository

    # The public token endpoint validates tenant slugs against the operational
    # tenant table before creating a LiveKit room. Keep that row and the agent's
    # CockroachDB memory in one idempotent seed transaction flow.
    await tenant_repository.upsert(TENANT_ID, REALTOR["name"])
    store = get_memory_store()
    await store.add_listings(TENANT_ID, REALTOR, LISTINGS)
    await store.upsert_buyer(TENANT_ID, BUYER)
    return (
        f"Seeded {len(LISTINGS)} Sarnia listings and 1 buyer for realtor "
        f"{REALTOR['name']} under tenant '{TENANT_ID}' (try /call/{TENANT_ID})."
    )


async def main() -> None:
    if not openai_configured():
        print(
            "Skipping demo seed: OPENAI_API_KEY is not set. Set it in .env "
            "and run `make seed` to create CockroachDB vector memories."
        )
        return
    print(await seed())


if __name__ == "__main__":
    asyncio.run(main())
