import logging
from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from src import telemetry
from src.core.logging_conf import configure_logging

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncIterator[None]:
    configure_logging()

    # Initialize container resources
    if hasattr(app.state, "container"):
        app.state.container.init_resources()
        logger.info("Container resources initialized")

    # Wire backend AI-cost telemetry. A no-op unless VOICEGW_COLLECTOR_URL is set.
    telemetry.install()

    logger.info("Startup event completed")

    yield

    from src.memory.store import close_memory_pool

    await close_memory_pool()
    # Flush any buffered telemetry before the sink's client is torn down.
    await telemetry.aclose()

    # Shutdown container resources
    if hasattr(app.state, "container"):
        app.state.container.shutdown_resources()
        logger.info("Container resources shutdown")

    logger.info("Shutdown event completed")
