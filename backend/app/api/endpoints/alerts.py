from typing import Dict, Any, List
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from sqlmodel import Session, select, func

from app.db.models import Asset, AssetStatus, ActivityLog, Incident, Vulnerability
from app.db.session import get_session
from app.ai_intelligence.anomaly_math import BehavioralAnomalyEngine
from app.ai_intelligence.vector_store import SecurityIntelStore
from app.ai_intelligence.agents.manager import MultiAgentOrchestrator
from app.ai_intelligence.schemas import ThreatIncidentSchema

router = APIRouter()

# Instantiate AI engines locally 
anomaly_engine = BehavioralAnomalyEngine()
intel_store = SecurityIntelStore()
orchestrator = MultiAgentOrchestrator(intel_store)

# Seed dummy vulnerabilities in memory on start
intel_store.ingest_vulnerability(
    "CVE-2026-3482", 
    "Unauthorized cross-zone privilege escalation via broken access control", 
    [0.1, 0.8, 0.85]
)


class TelemetryInput(BaseModel):
    current_frequency: float
    is_cross_zone: bool
    structural_context: str
    source_ip: str = "192.168.1.100"


# --- PERSON B: AI Telemetry Processing + PERSON A: DB Saving ---
@router.post("/process", response_model=Dict[str, Any])
async def process_telemetry_stream(
    payload: TelemetryInput, 
    session: Session = Depends(get_session)
):
    try:
        # 1. Calculate live mathematical deviation score
        D_s = anomaly_engine.calculate_deviation_score(
            current_frequency=payload.current_frequency,
            is_cross_zone=payload.is_cross_zone
        )
        
        response = {
            "deviation_score": D_s,
            "threshold_crossed": D_s > 0.7,
            "incident_data": None
        }
        
        # 2. Automatically trigger Multi-Agent Routine if threshold is breached (> 0.7)
        if D_s > 0.7:
            agent_report: ThreatIncidentSchema = orchestrator.execute_workflow(
                deviation_score=D_s,
                structural_context=payload.structural_context
            )
            report_dict = agent_report.dict()
            response["incident_data"] = report_dict

            # Person A Enhancement: Persist the AI incident directly to Postgres
            try:
                new_incident = Incident(
                    deviation_score=agent_report.deviation_score,
                    hack_methodology=agent_report.hack_methodology,
                    predicted_target=agent_report.predicted_target,
                    explainable_narrative=agent_report.explainable_narrative,
                    source_asset_ip=payload.source_ip
                )
                session.add(new_incident)
                session.commit()
            except Exception as db_err:
                print(f"⚠️ Could not save incident to DB: {db_err}")

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intelligence Layer Error: {str(e)}")


# --- PERSON A: Dashboard Data Endpoints ---
@router.get("/metrics")
def get_system_metrics(session: Session = Depends(get_session)):
    """Summary metrics for Person C's top dashboard widgets."""
    total_assets = session.exec(select(func.count(Asset.id))).one()
    isolated_assets = session.exec(
        select(func.count(Asset.id)).where(Asset.status == AssetStatus.ISOLATED)
    ).one()
    active_incidents = session.exec(
        select(func.count(Incident.id)).where(Incident.is_resolved == False)
    ).one()
    total_vulnerabilities = session.exec(select(func.count(Vulnerability.id))).one()

    return {
        "total_assets": total_assets,
        "isolated_assets": isolated_assets,
        "active_incidents": active_incidents,
        "total_vulnerabilities": total_vulnerabilities,
        "system_health": "Degraded" if active_incidents > 0 else "Optimal",
    }


@router.get("/logs", response_model=List[ActivityLog])
def get_activity_logs(limit: int = 50, session: Session = Depends(get_session)):
    """Fetch recent activity logs for Person C's ticker."""
    statement = select(ActivityLog).order_by(ActivityLog.timestamp.desc()).limit(limit)
    return session.exec(statement).all()


@router.get("/incidents", response_model=List[Incident])
def get_incidents(session: Session = Depends(get_session)):
    """Fetch security threat incidents for Person C's UI."""
    return session.exec(select(Incident).order_by(Incident.timestamp.desc())).all()