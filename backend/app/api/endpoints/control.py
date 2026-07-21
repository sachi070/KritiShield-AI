from fastapi import APIRouter, Depends, BackgroundTasks
from pydantic import BaseModel
from sqlmodel import Session

from app.db.session import get_session
from app.simulation.generator import run_attack_scenario

router = APIRouter()


class AttackScenarioRequest(BaseModel):
    scenario_type: str  # e.g., "LATERAL_MOVEMENT", "CREDENTIAL_MISUSE", "BRUTE_FORCE"
    target_zone: str = "Internal Subnet"


@router.post("/trigger")
async def trigger_simulation_scenario(
    payload: AttackScenarioRequest,
    background_tasks: BackgroundTasks,
    session: Session = Depends(get_session)
):
    """Triggers an attack simulation scenario in the background."""
    # Run the scenario generator without blocking the main thread
    background_tasks.add_task(run_attack_scenario, payload.scenario_type, payload.target_zone)
    
    return {
        "status": "triggered",
        "scenario": payload.scenario_type,
        "target_zone": payload.target_zone,
        "message": f"Simulation script for '{payload.scenario_type}' is executing."
    }