from pydantic import BaseModel, Field

class ThreatIncidentSchema(BaseModel):
    deviation_score: float = Field(..., description="The mathematical deviation value calculated by the engine")
    hack_methodology: str = Field(..., description="Pinpointed adversarial tactic from the matrix alignment")
    predicted_target: str = Field(..., description="The calculated next logical target network node")
    explainable_narrative: str = Field(..., description="Plain-English explanation detailing why the defensive security action was taken")