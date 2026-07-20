from fastapi import APIRouter, HTTPException, Depends
from typing import Dict, Any
from app.ai_intelligence.anomaly_math import BehavioralAnomalyEngine
from app.ai_intelligence.vector_store import SecurityIntelStore
from app.ai_intelligence.agents.manager import MultiAgentOrchestrator
from app.ai_intelligence.schemas import ThreatIncidentSchema
from pydantic import BaseModel

# Schema for the incoming raw data stream 
class TelemetryInput(BaseModel):
    current_frequency: float
    is_cross_zone: bool
    structural_context: str

router = APIRouter()

# Instantiate engines locally 
anomaly_engine = BehavioralAnomalyEngine()
intel_store = SecurityIntelStore()
orchestrator = MultiAgentOrchestrator(intel_store)

# Seed a couple of dummy vulnerabilities in memory on start for the presentation
intel_store.ingest_vulnerability("CVE-2026-3482", "Unauthorized cross-zone privilege escalation via broken access control", [0.1, 0.8, 0.85])

@router.post("/process", response_model=Dict[str, Any])
async def process_telemetry_stream(payload: TelemetryInput):
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
            # Convert Pydantic object to dictionary safely for response payload
            response["incident_data"] = agent_report.dict()
            
        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Intelligence Layer Error: {str(e)}")