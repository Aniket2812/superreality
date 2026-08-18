# Super Realty

An always-on OpenAI voice receptionist for real-estate agents. It qualifies buyers,
finds grounded listings, books showings, and remembers each caller across conversations.

## Why CockroachDB is central

CockroachDB is the application's persistent agent memory—not an auxiliary log store.
Listings, buyer profiles, call-derived facts, showing events, and their OpenAI embeddings
are committed together. Every recall is tenant-scoped and combines structured property
filters with nearest-neighbour vector ranking.

This submission uses two challenge products:

1. **CockroachDB Distributed Vector Indexing** for listing, buyer, and interaction
   embeddings, with `tenant_id` as the vector-index prefix.
2. **ccloud CLI** for repeatable AWS-region cluster provisioning, SQL-user lifecycle,
   connection discovery, and operational inspection.

CockroachDB now powers transactional state, durable long-term memory,
semantic recall, the memory graph projection, and grounded buyer/listing insights.

## Run locally

```bash
git clone https://github.com/Aniket2812/superreality.git
cd superreality
cp .env.example .env
# Add OPENAI_API_KEY to .env
make up
```

The stack starts CockroachDB, LiveKit, FastAPI, the voice worker, and React:

- App: http://localhost:5173
- API: http://localhost:8000/docs
- CockroachDB Console: http://localhost:8081
- LiveKit: ws://localhost:7880

OpenAI handles all voice AI work: `gpt-4o-mini-transcribe` for speech recognition,
`gpt-4.1-mini` for reasoning, `gpt-4o-mini-tts` for speech, and
`text-embedding-3-small` for memory embeddings.

## Verify

```bash
cd backend
uv sync --dev
uv run ruff check src tests migrations
uv run pytest -q tests/unit
```

See [docs/HACKATHON.md](docs/HACKATHON.md) for memory architecture, vector-index
queries, ccloud evidence, AWS deployment, and the demo narrative.

## Stack

CockroachDB 25.4+, OpenAI, LiveKit, FastAPI, React 19, Cal.com, Telnyx, Docker, AWS.

## License

MIT.
