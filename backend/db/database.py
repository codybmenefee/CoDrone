"""
Database connections and initialization
"""

import motor.motor_asyncio
import asyncpg
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import MetaData
import logging

from utils.config import settings

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# MongoDB connection
mongo_client = None
mongo_db = None

# PostgreSQL connection
pg_engine = None
pg_session = None


async def init_mongodb():
    """Initialize MongoDB connection"""
    global mongo_client, mongo_db
    
    try:
        mongo_client = motor.motor_asyncio.AsyncIOMotorClient(settings.MONGODB_URL)
        mongo_db = mongo_client[settings.MONGODB_DB]
        
        # Test connection
        await mongo_client.admin.command('ping')
        logger.info("✅ MongoDB connected successfully")
        
    except Exception as e:
        logger.error(f"❌ MongoDB connection failed: {e}")
        raise


async def init_postgresql():
    """Initialize PostgreSQL connection"""
    global pg_engine, pg_session
    
    try:
        # Convert sync URL to async
        async_url = settings.POSTGRES_URL.replace('postgresql://', 'postgresql+asyncpg://')
        pg_engine = create_async_engine(async_url, echo=settings.DEBUG)
        
        # Create session factory
        pg_session = sessionmaker(
            pg_engine, 
            class_=AsyncSession, 
            expire_on_commit=False
        )
        
        # Test connection
        async with pg_engine.begin() as conn:
            await conn.execute("SELECT 1")
        
        logger.info("✅ PostgreSQL connected successfully")
        
    except Exception as e:
        logger.error(f"❌ PostgreSQL connection failed: {e}")
        raise


async def init_db():
    """Initialize all database connections"""
    await init_mongodb()
    await init_postgresql()


async def close_db():
    """Close all database connections"""
    global mongo_client, pg_engine
    
    if mongo_client:
        mongo_client.close()
        logger.info("MongoDB connection closed")
    
    if pg_engine:
        await pg_engine.dispose()
        logger.info("PostgreSQL connection closed")


def get_mongo_db():
    """Get MongoDB database instance"""
    return mongo_db


def get_pg_session():
    """Get PostgreSQL session factory"""
    return pg_session