import json
from backend.app.ai_intelligence.schemas import ThreatIncidentSchema

class MultiAgentOrchestrator:
    def __init__(self, intel_store):
        self.intel_store = intel_store

    def execute_workflow(self, deviation_score: float, structural_context: str) -> ThreatIncidentSchema:
        """Runs the automated multi-agent routine for high confidence threats."""
        
        # --- AGENT 1: Threat Mapping Component ---
        # Simulates localized adversarial analysis via the internal knowledge vectors
        threat_matches = self.intel_store.search_threat_context([0.1, 0.8, 0.9])
        cve_context = threat_matches[0]["cve_id"] if threat_matches else "Unknown Exploit Matrix"
        
        hack_methodology = f"Lateral Movement via unauthorized credential manipulation utilizing {cve_context} profiles."
        predicted_target = "Central Data Vault (Zone-OT)"

        # --- AGENT 2: Explainable AI Narrative Component ---
        # Translates structural threat insights into an interface narrative
        explainable_narrative = (
            f"Automated defensive intervention engaged. System observed an active deviation score of {deviation_score:.2f} "
            f"triggered by late-night credential spikes moving cross-zone. The attack pattern indicates "
            f"an attempt to target the {predicted_target}."
        )

        # Enforces a strict, crash-proof Pydantic model format matching the DB expectations
        return ThreatIncidentSchema(
            deviation_score=deviation_score,
            hack_methodology=hack_methodology,
            predicted_target=predicted_target,
            explainable_narrative=explainable_narrative
        )