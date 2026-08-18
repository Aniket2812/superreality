from types import SimpleNamespace

from pydantic import SecretStr

from src.services import booking_service


async def test_book_showing_persists_catalog_grounded_address(monkeypatch):
    captured: dict = {}

    class Memory:
        async def list_listings(self, tenant_id):
            assert tenant_id == "demo"
            return [{"code": "S1", "address": "123 Maple Street, Sarnia"}]

        async def add_showing(self, **values):
            captured["memory"] = values

    memory = Memory()
    row = SimpleNamespace(
        id=1,
        idempotency_key="idem-1",
        status="pending",
        cal_uid=None,
        synced=False,
        address="123 Maple Street, Sarnia",
        start_utc=None,
    )

    async def get_existing(_key):
        return None

    async def insert_pending(values):
        captured["row"] = values
        return row

    async def set_result(_booking_id, *, cal_uid, status, synced):
        row.cal_uid = cal_uid
        row.status = status
        row.synced = synced
        return row

    async def create_cal(**values):
        captured["cal"] = values
        return {
            "uid": "cal-1",
            "status": "accepted",
            "start": values["start_utc_iso"],
            "end": None,
            "synced": True,
        }

    monkeypatch.setattr(booking_service, "get_memory_store", lambda: memory)
    monkeypatch.setattr(
        booking_service.booking_repository, "get_by_idempotency_key", get_existing
    )
    monkeypatch.setattr(
        booking_service.booking_repository, "insert_pending", insert_pending
    )
    monkeypatch.setattr(booking_service.booking_repository, "set_result", set_result)
    monkeypatch.setattr(booking_service.cal_service, "create_showing_booking", create_cal)
    monkeypatch.setattr(booking_service.config, "CAL_API_KEY", SecretStr("cal_test"))
    monkeypatch.setattr(booking_service.config, "RR_CAL_EVENT_TYPE_ID", 123)

    result = await booking_service.book_showing(
        {
            "idempotency_key": "idem-1",
            "property_code": "S1",
            "address": "incorrect caller address",
            "start": "2026-08-20T10:00:00Z",
            "timezone": "America/Toronto",
            "name": "Demo Buyer",
            "email": "demo@example.com",
            "phone": "+15195550100",
        },
        "demo",
    )

    assert result["status"] == "accepted"
    assert captured["row"]["address"] == "123 Maple Street, Sarnia"
    assert captured["cal"]["property_address"] == "123 Maple Street, Sarnia"
    assert captured["memory"]["address"] == "123 Maple Street, Sarnia"
