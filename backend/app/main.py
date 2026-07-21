from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.db.session import init_db
from app.api.router import api_router
from app.simulation.generator import seed_initial_data


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Try initializing database tables
    try:
        init_db()
        seed_initial_data()
        print("Database tables verified/created successfully.")
    except Exception as e:
        print(f"Could not connect to DB on startup: {e}")
        print("Make sure your DATABASE_URL in backend/.env is set up!")
    yield


app = FastAPI(
    title="KritiShield Cyber Resilience Core",
    description="AI-powered Anomaly Detection & Threat Mapping Engine ",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix="/api")

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "KritiShield AI Backend",
        "docs": "/docs",
    }