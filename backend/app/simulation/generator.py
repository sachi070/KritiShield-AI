import random
import time
from sqlmodel import Session, select
from app.db.session import engine
from app.db.models import Asset, AssetStatus, ActivityLog, Vulnerability, ThreatSeverity


def seed_initial_data():
    """Seeds default infrastructure assets into PostgreSQL if table is empty."""
    with Session(engine) as session:
        existing_assets = session.exec(select(Asset)).all()
        if existing_assets:
            return  # Already seeded

        # Create baseline assets
        sample_assets = [
            Asset(hostname="DMZ-Gateway-01", ip_address="10.0.0.1", asset_type="Firewall", zone="DMZ", vulnerability_score=0.1),
            Asset(hostname="Web-Prod-App", ip_address="10.0.1.10", asset_type="Web Server", zone="DMZ", vulnerability_score=0.4),
            Asset(hostname="Core-DB-Primary", ip_address="10.0.2.50", asset_type="Database", zone="Internal Subnet", vulnerability_score=0.8),
            Asset(hostname="Auth-Vault-01", ip_address="10.0.2.99", asset_type="Identity Server", zone="PCI Zone", vulnerability_score=0.2),
            Asset(hostname="Workstation-Admin", ip_address="10.0.3.15", asset_type="Workstation", zone="Internal Subnet", vulnerability_score=0.3),
        ]
        
        session.add_all(sample_assets)
        session.commit()
        
        # Seed dummy vulnerability
        vulnerability = Vulnerability(
            asset_id=3,
            cve_id="CVE-2026-3482",
            severity=ThreatSeverity.CRITICAL,
            description="Unauthorized cross-zone privilege escalation via broken access control"
        )
        session.add(vulnerability)
        session.commit()

        # Seed sample incidents so Incident Response page is pre-populated
        existing_incidents = session.exec(select(Incident)).all()
        if not existing_incidents:
            sample_incidents = [
                Incident(
                    deviation_score=0.92,
                    hack_methodology="Unauthorized Cross-Zone Privilege Escalation",
                    predicted_target="Core-DB-Primary (10.0.2.50)",
                    explainable_narrative="Autonomous AI agent triggered after detecting unauthorized cross-zone access attempt from DMZ Web Server (10.0.1.10) to internal SQL cluster with a live deviation score of 0.92.",
                    source_asset_ip="10.0.1.10",
                    is_resolved=False
                ),
                Incident(
                    deviation_score=0.84,
                    hack_methodology="Privileged Token Misuse & Credential Exploitation",
                    predicted_target="Auth-Vault-01 (10.0.2.99)",
                    explainable_narrative="Late-night administrative token usage detected from workstation 10.0.3.15 attempting access to PCI zone vault. AI threat mapper flagged high likelihood of compromised credential.",
                    source_asset_ip="10.0.3.15",
                    is_resolved=False
                )
            ]
            session.add_all(sample_incidents)
            session.commit()
        print("🌱 Seeded initial network assets, vulnerabilities & AI incidents into database.")


def run_attack_scenario(scenario_type: str, target_zone: str):
    """Generates synthetic attack telemetry logs based on triggered scenario."""
    with Session(engine) as session:
        if scenario_type == "LATERAL_MOVEMENT":
            log = ActivityLog(
                source_ip="10.0.1.10",       # DMZ Web Server
                destination_ip="10.0.2.50",  # Internal DB
                event_type="UNAUTHORIZED_CROSS_ZONE_ACCESS",
                payload=f"ATTACK_SCENARIO_{scenario_type}_TARGET_{target_zone}",
                is_anomaly=True
            )
        elif scenario_type == "CREDENTIAL_MISUSE":
            log = ActivityLog(
                source_ip="10.0.3.15",
                destination_ip="10.0.2.99",
                event_type="LATE_NIGHT_PRIVILEGED_TOKEN_USE",
                payload="ADMIN_KEY_EXPLOIT_ATTEMPT",
                is_anomaly=True
            )
        else:
            log = ActivityLog(
                source_ip="192.168.1.50",
                destination_ip="10.0.0.1",
                event_type="BRUTE_FORCE_BURST",
                payload="500_FAILED_SSH_ATTEMPTS",
                is_anomaly=True
            )
            
        session.add(log)
        session.commit()
        print(f"🚨 Executed scenario log injection: {scenario_type}")