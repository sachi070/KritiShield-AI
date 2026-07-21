from typing import Optional
from datetime import datetime, timezone
from enum import Enum
from sqlmodel import SQLModel, Field

# --- Enums for Status Tracking ---
class AssetStatus(str, Enum):
    ACTIVE = "active"
    ISOLATED = "isolated"
    COMPROMISED = "compromised"

class ThreatSeverity(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


# --- 1. Asset Model ---
class Asset(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    hostname: str = Field(index=True)
    ip_address: str
    asset_type: str  # e.g., "Web Server", "Database", "Workstation"
    zone: str        # e.g., "DMZ", "Internal Subnet", "PCI Zone"
    status: AssetStatus = Field(default=AssetStatus.ACTIVE)
    vulnerability_score: float = Field(default=0.0)


# --- 2. Activity Log Model (Telemetry Stream) ---
class ActivityLog(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    source_ip: str
    destination_ip: str
    event_type: str  # e.g., "SSH_LOGIN", "HTTP_GET", "CREDENTIAL_USE"
    payload: Optional[str] = None
    is_anomaly: bool = Field(default=False)


# --- 3. Incident Model (Directly Compatible with Person B's Schema) ---
class Incident(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    severity: ThreatSeverity = Field(default=ThreatSeverity.HIGH)
    
    # Fields strictly matching Person B's ThreatIncidentSchema
    deviation_score: float = Field(default=0.0)
    hack_methodology: str = Field(default="Unknown Tactic")
    predicted_target: str = Field(default="Unknown Node")
    explainable_narrative: str = Field(default="")
    
    # Operational tracking
    source_asset_ip: Optional[str] = Field(default=None)
    is_resolved: bool = Field(default=False)


# --- 4. Vulnerability Model ---
class Vulnerability(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    asset_id: int = Field(foreign_key="asset.id")
    cve_id: str  # e.g., "CVE-2024-1234"
    severity: ThreatSeverity = Field(default=ThreatSeverity.HIGH)
    description: str