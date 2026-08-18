"""Tenant graph and insight projections built from CockroachDB memory relations."""

from __future__ import annotations

from typing import Any

from src import telemetry
from src.memory.store import get_memory_store


class GraphService:
    async def get_subgraph(self, tenant_id: str, *, cap: int = 150) -> dict[str, Any]:
        snapshot = await get_memory_store().graph_snapshot(tenant_id, cap)
        nodes: list[dict[str, Any]] = []
        edges: list[dict[str, str]] = []
        areas: set[str] = set()
        buyer_ids: dict[str, str] = {}

        for listing in snapshot["listings"]:
            node_id = f"listing:{listing['id']}"
            nodes.append(
                {
                    "id": node_id,
                    "label": listing["address"],
                    "type": "Listing",
                    "props": listing,
                }
            )
            area = listing.get("area")
            if area:
                area_id = f"area:{str(area).lower()}"
                if area_id not in areas:
                    nodes.append(
                        {
                            "id": area_id,
                            "label": area,
                            "type": "Neighbourhood",
                            "props": {"name": area},
                        }
                    )
                    areas.add(area_id)
                edges.append(
                    {"source": node_id, "target": area_id, "rel": "located_in"}
                )
        for buyer in snapshot["buyers"]:
            node_id = f"buyer:{buyer['id']}"
            buyer_ids[buyer["phone_key"]] = node_id
            nodes.append(
                {
                    "id": node_id,
                    "label": buyer.get("name") or buyer["phone"],
                    "type": "Buyer",
                    "props": buyer,
                }
            )
            area = (buyer.get("criteria") or {}).get("area")
            if area:
                area_id = f"area:{str(area).lower()}"
                if area_id not in areas:
                    nodes.append(
                        {
                            "id": area_id,
                            "label": area,
                            "type": "Neighbourhood",
                            "props": {"name": area},
                        }
                    )
                    areas.add(area_id)
                edges.append({"source": node_id, "target": area_id, "rel": "wants_in"})
        for interaction in snapshot["interactions"]:
            node_id = f"interaction:{interaction['id']}"
            nodes.append(
                {
                    "id": node_id,
                    "label": interaction["kind"].title(),
                    "type": "Interaction",
                    "props": interaction,
                }
            )
            buyer_id = buyer_ids.get(interaction.get("buyer_phone_key"))
            if buyer_id:
                edges.append({"source": buyer_id, "target": node_id, "rel": "had"})
        return {"nodes": nodes[:cap], "edges": edges}

    @telemetry.track("cockroach.memory.insights")
    async def insights(self, tenant_id: str) -> list[dict[str, Any]]:
        buyers = await get_memory_store().list_buyers(tenant_id)
        areas: dict[str, int] = {}
        beds: dict[int, int] = {}
        for buyer in buyers:
            criteria = buyer.get("criteria") or {}
            if criteria.get("area"):
                areas[str(criteria["area"])] = areas.get(str(criteria["area"]), 0) + 1
            if criteria.get("minBeds"):
                value = int(criteria["minBeds"])
                beds[value] = beds.get(value, 0) + 1
        cards: list[dict[str, Any]] = []
        if beds:
            popular = max(beds, key=beds.get)  # type: ignore[arg-type]
            cards.append(
                {
                    "title": "What buyers want",
                    "body": f"The most common request is at least {popular} bedrooms.",
                }
            )
        if areas:
            popular_area = max(areas, key=areas.get)  # type: ignore[arg-type]
            cards.append(
                {
                    "title": "Hot neighbourhoods",
                    "body": f"{popular_area} has the strongest remembered buyer demand.",
                }
            )
        return cards

    async def match_report(
        self, tenant_id: str, listing: dict[str, Any]
    ) -> dict[str, Any]:
        store = get_memory_store()
        narrative = await store.match_buyers(tenant_id, listing)
        buyers = await store.list_buyers(tenant_id)
        named = [
            {"name": buyer.get("name"), "phone": buyer.get("phone")}
            for buyer in buyers
            if buyer.get("name") and str(buyer["name"]).lower() in narrative.lower()
        ]
        return {"narrative": narrative, "buyers": named, "count": len(named)}


_service: GraphService | None = None


def get_graph_service() -> GraphService:
    global _service
    if _service is None:
        _service = GraphService()
    return _service
