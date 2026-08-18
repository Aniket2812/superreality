import src.memory.graph_service as gs


class FakeStore:
    async def graph_snapshot(self, tenant_id, cap):
        assert tenant_id == "org_abc"
        return {
            "listings": [{"id": "l1", "address": "9 Marina View", "area": "Sarnia"}],
            "buyers": [
                {
                    "id": "b1",
                    "phone_key": "1519",
                    "phone": "+1519",
                    "name": "Dana",
                    "criteria": {"area": "Sarnia"},
                }
            ],
            "interactions": [
                {
                    "id": "i1",
                    "buyer_phone_key": "1519",
                    "kind": "call",
                    "content": "asked for waterfront",
                    "metadata": {},
                }
            ],
        }

    async def list_buyers(self, tenant_id):
        return [
            {
                "name": "Dana",
                "phone": "+1519",
                "criteria": {"area": "Sarnia", "minBeds": 3},
            }
        ]

    async def match_buyers(self, tenant_id, listing):
        return "Dana matches this Sarnia listing"


async def test_get_subgraph_projects_cockroach_relations(monkeypatch):
    monkeypatch.setattr(gs, "get_memory_store", lambda: FakeStore())
    result = await gs.GraphService().get_subgraph("org_abc")
    assert {node["type"] for node in result["nodes"]} == {
        "Listing",
        "Buyer",
        "Neighbourhood",
        "Interaction",
    }
    assert {edge["rel"] for edge in result["edges"]} == {
        "located_in",
        "wants_in",
        "had",
    }


async def test_insights_are_grounded_in_structured_memory(monkeypatch):
    monkeypatch.setattr(gs, "get_memory_store", lambda: FakeStore())
    cards = await gs.GraphService().insights("org_abc")
    assert cards[0]["body"] == "The most common request is at least 3 bedrooms."
    assert "Sarnia" in cards[1]["body"]


async def test_match_report_names_only_grounded_buyers(monkeypatch):
    monkeypatch.setattr(gs, "get_memory_store", lambda: FakeStore())
    result = await gs.GraphService().match_report("org_abc", {"area": "Sarnia"})
    assert result["count"] == 1
    assert result["buyers"] == [{"name": "Dana", "phone": "+1519"}]
