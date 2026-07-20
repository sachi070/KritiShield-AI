from fastapi import APIRouter
from app.api.endpoints import alerts

api_router = APIRouter()

# Include the alerts routes under a dedicated prefix
api_router.include_router(alerts.router, prefix="/alerts", tags=["Intelligence Alerts"])