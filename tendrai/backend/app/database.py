import logging
from motor.motor_asyncio import AsyncIOMotorClient
from beanie import init_beanie
from app.config import get_settings

logger = logging.getLogger(__name__)
settings = get_settings()

_client: AsyncIOMotorClient = None


async def connect_db():
    global _client
    logger.info("Connecting to MongoDB Atlas...")
    _client = AsyncIOMotorClient(settings.MONGODB_URL)

    # Import models here to avoid circular imports
    from app.models.user import User
    from app.models.tender import Tender
    from app.models.payment import Payment

    await init_beanie(
        database=_client[settings.MONGODB_DB_NAME],
        document_models=[User, Tender, Payment],
    )
    logger.info(f"Connected to MongoDB — DB: {settings.MONGODB_DB_NAME}")


async def close_db():
    global _client
    if _client:
        _client.close()
        logger.info("MongoDB connection closed")
