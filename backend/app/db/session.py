import os
from sqlmodel import SQLModel, create_engine, Session
from dotenv import load_dotenv

# Load environment variables from backend/.env
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise ValueError("DATABASE_URL is not set in environment variables or .env file!")

# Create SQLModel / SQLAlchemy engine for Supabase Postgres
engine = create_engine(
    DATABASE_URL,
    echo=True,          # Logs SQL queries to terminal (helpful for debugging during hackathon)
    pool_pre_ping=True  # Automatically re-connects if Supabase drops an idle connection
)


def init_db():
    """Initializes and creates all database tables defined in models.py."""
    SQLModel.metadata.create_all(engine)


def get_session():
    """FastAPI Dependency: Yields a fresh DB session per request and closes it after."""
    with Session(engine) as session:
        yield session