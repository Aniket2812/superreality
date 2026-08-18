import src.memory.store as store_mod


class FakeConnection:
    def __init__(self):
        self.executions: list[tuple[str, tuple]] = []
        self.rows: list[dict] = []

    async def execute(self, query, *args):
        self.executions.append((query, args))
        return "DELETE 1" if query.lstrip().startswith("DELETE") else "INSERT 0 1"

    async def fetch(self, query, *args):
        self.executions.append((query, args))
        return self.rows

    async def fetchrow(self, query, *args):
        self.executions.append((query, args))
        return self.rows[0] if self.rows else None


class FakeAcquire:
    def __init__(self, connection):
        self.connection = connection

    async def __aenter__(self):
        return self.connection

    async def __aexit__(self, *args):
        return None


class FakePool:
    def __init__(self, connection):
        self.connection = connection

    def acquire(self):
        return FakeAcquire(self.connection)


async def test_add_listing_is_tenant_scoped_and_vectorized(monkeypatch):
    connection = FakeConnection()

    async def fake_embed(text, *, tenant_id):
        assert tenant_id == "org_abc"
        assert "Sarnia" in text
        return [0.1, 0.2]

    async def fake_transaction(operation):
        return await operation(connection)

    monkeypatch.setattr(store_mod, "_embed", fake_embed)
    monkeypatch.setattr(store_mod, "_retry_transaction", fake_transaction)
    item = {"code": "RR-201", "address": "9 Marina View", "area": "Sarnia"}
    assert await store_mod.MemoryStore().add_single_listing("org_abc", item) == item
    query, args = connection.executions[0]
    assert "ON CONFLICT (tenant_id, code)" in query
    assert args[0] == "org_abc"
    assert args[-1] == "[0.1,0.2]"


async def test_upsert_buyer_normalizes_phone_and_uses_jsonb(monkeypatch):
    connection = FakeConnection()

    async def fake_embed(text, *, tenant_id):
        return None

    async def fake_transaction(operation):
        return await operation(connection)

    monkeypatch.setattr(store_mod, "_embed", fake_embed)
    monkeypatch.setattr(store_mod, "_retry_transaction", fake_transaction)
    buyer = {"phone": "+1 (519) 555-0142", "criteria": {"area": "Sarnia"}}
    await store_mod.MemoryStore().upsert_buyer("org_abc", buyer)
    query, args = connection.executions[0]
    assert "ON CONFLICT (tenant_id,phone_key)" in query
    assert args[1] == "15195550142"
    assert '"area": "Sarnia"' in args[5]


async def test_recall_nearby_is_best_effort(monkeypatch):
    store = store_mod.MemoryStore()

    async def fake_recall(*args, **kwargs):
        return [{"code": "RR-3", "address": "3 Lake Road", "description": "waterfront"}]

    monkeypatch.setattr(store, "recall", fake_recall)
    result = await store.recall_nearby("org_abc", "likes water")
    assert result and "3 Lake Road" in result

    async def broken_recall(*args, **kwargs):
        raise RuntimeError("database unavailable")

    monkeypatch.setattr(store, "recall", broken_recall)
    assert await store.recall_nearby("org_abc", "likes water") is None


async def test_reset_tenant_uses_only_tenant_predicates(monkeypatch):
    connection = FakeConnection()

    async def fake_transaction(operation):
        return await operation(connection)

    monkeypatch.setattr(store_mod, "_retry_transaction", fake_transaction)
    assert await store_mod.MemoryStore().reset_tenant("org_abc") == 4
    assert len(connection.executions) == 4
    assert all("WHERE tenant_id=$1" in query for query, _ in connection.executions)
    assert all(args == ("org_abc",) for _, args in connection.executions)


def test_buyer_memory_key_is_stable_and_tenant_isolated():
    assert (
        store_mod.buyer_dataset("a", "+1 (519) 555-0142")
        == "tenant_a_buyer_15195550142"
    )
    assert store_mod.buyer_dataset("b", "+1 (519) 555-0142") != store_mod.buyer_dataset(
        "a", "+1 (519) 555-0142"
    )
