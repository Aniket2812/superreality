import asyncio

from src.scripts import seed_demo


def test_openai_configured_reflects_env(monkeypatch):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    assert seed_demo.openai_configured() is False

    monkeypatch.setenv("OPENAI_API_KEY", "sk-test")
    assert seed_demo.openai_configured() is True

    # Whitespace-only is treated as unset.
    monkeypatch.setenv("OPENAI_API_KEY", "   ")
    assert seed_demo.openai_configured() is False


def test_demo_data_is_wellformed():
    assert len(seed_demo.LISTINGS) == 3
    codes = [listing["code"] for listing in seed_demo.LISTINGS]
    assert len(set(codes)) == 3  # unique codes
    for listing in seed_demo.LISTINGS:
        assert listing["address"]
        assert listing["price"] > 0
    assert seed_demo.BUYER["phone"]
    assert seed_demo.BUYER["criteria"]["minBeds"] == 3


def test_main_skips_and_never_touches_store_without_openai(monkeypatch, capsys):
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)

    async def _must_not_run() -> str:
        raise AssertionError("seed() must not run when OPENAI_API_KEY is unset")

    monkeypatch.setattr(seed_demo, "seed", _must_not_run)

    asyncio.run(seed_demo.main())

    out = capsys.readouterr().out
    assert "Skipping demo seed" in out


def test_seed_creates_token_tenant_and_agent_memory(monkeypatch):
    calls: list[tuple] = []

    class FakeStore:
        async def add_listings(self, tenant_id, realtor, listings):
            calls.append(("listings", tenant_id, realtor, listings))

        async def upsert_buyer(self, tenant_id, buyer):
            calls.append(("buyer", tenant_id, buyer))

    async def fake_upsert(tenant_id, name):
        calls.append(("tenant", tenant_id, name))

    monkeypatch.setattr("src.memory.store.get_memory_store", lambda: FakeStore())
    monkeypatch.setattr("src.repository.tenant_repository.upsert", fake_upsert)

    result = asyncio.run(seed_demo.seed())

    assert calls[0] == ("tenant", "demo", "Riley")
    assert [call[0] for call in calls] == ["tenant", "listings", "buyer"]
    assert "try /call/demo" in result
