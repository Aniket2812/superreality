"""add CockroachDB transactional and vector agent memory

Revision ID: f7c8d9e0a1b2
Revises: a1b2c3d4e5f6
Create Date: 2026-08-18 00:00:00.000000
"""

from collections.abc import Sequence

from alembic import op

revision: str = "f7c8d9e0a1b2"
down_revision: str | Sequence[str] | None = "a1b2c3d4e5f6"
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def upgrade() -> None:
    op.execute(
        """
        CREATE TABLE memory_realtors (
            tenant_id STRING PRIMARY KEY,
            name STRING NOT NULL,
            email STRING NULL,
            agency STRING NULL,
            area STRING NULL,
            tagline STRING NULL,
            tone STRING NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        """
        CREATE TABLE memory_listings (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id STRING NOT NULL,
            code STRING NOT NULL,
            address STRING NOT NULL,
            price DECIMAL NULL,
            beds INT NULL,
            baths DECIMAL NULL,
            sqft INT NULL,
            description STRING NULL,
            image_url STRING NULL,
            area STRING NULL,
            city STRING NULL,
            content STRING NOT NULL,
            embedding VECTOR(1536) NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_memory_listings_tenant_code UNIQUE (tenant_id, code)
        )
        """
    )
    op.execute(
        "CREATE INDEX ix_memory_listings_tenant_structured ON memory_listings (tenant_id, area, price, beds)"
    )
    op.execute(
        "CREATE VECTOR INDEX ix_memory_listings_embedding ON memory_listings (tenant_id, embedding)"
    )
    op.execute(
        """
        CREATE TABLE memory_buyers (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id STRING NOT NULL,
            phone_key STRING NOT NULL,
            phone STRING NOT NULL,
            name STRING NULL,
            email STRING NULL,
            criteria JSONB NOT NULL DEFAULT '{}'::JSONB,
            summary STRING NULL,
            content STRING NOT NULL,
            embedding VECTOR(1536) NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
            CONSTRAINT uq_memory_buyers_tenant_phone UNIQUE (tenant_id, phone_key)
        )
        """
    )
    op.execute("CREATE INDEX ix_memory_buyers_tenant ON memory_buyers (tenant_id, updated_at DESC)")
    op.execute(
        "CREATE VECTOR INDEX ix_memory_buyers_embedding ON memory_buyers (tenant_id, embedding)"
    )
    op.execute(
        """
        CREATE TABLE memory_interactions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            tenant_id STRING NOT NULL,
            buyer_phone_key STRING NOT NULL DEFAULT '',
            kind STRING NOT NULL,
            content STRING NOT NULL,
            metadata JSONB NOT NULL DEFAULT '{}'::JSONB,
            embedding VECTOR(1536) NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT now()
        )
        """
    )
    op.execute(
        "CREATE INDEX ix_memory_interactions_buyer ON memory_interactions (tenant_id, buyer_phone_key, created_at DESC)"
    )
    op.execute(
        "CREATE VECTOR INDEX ix_memory_interactions_embedding ON memory_interactions (tenant_id, embedding)"
    )


def downgrade() -> None:
    op.execute("DROP TABLE memory_interactions")
    op.execute("DROP TABLE memory_buyers")
    op.execute("DROP TABLE memory_listings")
    op.execute("DROP TABLE memory_realtors")
