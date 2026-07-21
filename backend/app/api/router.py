from fastapi import APIRouter
from app.api.endpoints import assets, control, alerts

api_router = APIRouter()

# Include the alerts routes under a dedicated prefix
api_router.include_router(alerts.router, prefix="/alerts", tags=["Intelligence Alerts"])
api_router.include_router(assets.router, prefix="/assets", tags=["Assets & Topology"])
api_router.include_router(control.router, prefix="/control", tags=["Simulation Control"])