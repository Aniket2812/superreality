from sqlalchemy import UniqueConstraint
from sqlmodel import Field

from src.models.base_model import BaseModel


class BuyerProfile(BaseModel, table=True):
    """Fast, structured snapshot of a returning buyer, read at call start so the
    assistant recognizes them without waiting for semantic recall. CockroachDB is the
    system of record for both this hot path and deeper vector memory.
    """

    __tablename__ = "buyer_profiles"
    __table_args__ = (
        UniqueConstraint("tenant_id", "phone", name="uq_buyer_profiles_tenant_phone"),
    )

    tenant_id: str = Field(index=True, nullable=False)
    phone: str = Field(index=True, nullable=False)
    name: str | None = Field(default=None)
    budget: str | None = Field(default=None)
    area: str | None = Field(default=None)
    prefs_summary: str | None = Field(default=None)
