"""
Database engine, session management, and base model class.
Works with SQLite out of the box; swap DATABASE_URL to a Postgres URL
to migrate without any code changes elsewhere in the app.
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

from config import settings

connect_args = {}
if settings.DATABASE_URL.startswith("sqlite"):
    # Needed for SQLite to work with FastAPI's threaded request handling
    connect_args = {"check_same_thread": False}

engine = create_engine(settings.DATABASE_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """FastAPI dependency that yields a DB session and closes it after the request."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
