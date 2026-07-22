from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
import os

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

# --- Frontend Integration ---
# Base directory is backend/app, we need to go up to find frontend/dist
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(os.path.dirname(BASE_DIR), "frontend", "dist")

if os.path.exists(FRONTEND_DIST):
    # Mount assets folder for css/js/images
    assets_dir = os.path.join(FRONTEND_DIST, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")
        
    @app.api_route("/{path_name:path}", methods=["GET"])
    async def catch_all(path_name: str):
        # Serve exact file if it exists (e.g. favicon, manifest)
        file_path = os.path.join(FRONTEND_DIST, path_name)
        if os.path.isfile(file_path) and not path_name.startswith("api/"):
            return FileResponse(file_path)
        
        # Don't intercept API calls
        if path_name.startswith("api/"):
            return {"error": "API route not found"}
            
        # Otherwise fallback to index.html for React Router
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))
else:
    @app.get("/")
    def read_root():
        return {
            "status": "online",
            "service": "KritiShield AI Backend",
            "warning": "Frontend dist folder not found. Run npm build in frontend/",
            "docs": "/docs",
        }