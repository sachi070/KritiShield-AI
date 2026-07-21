from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlmodel import Session, select

from app.db.models import Asset, AssetStatus
from app.db.session import get_session
from app.simulation.topology import generate_network_topology

router = APIRouter()


@router.get("/", response_model=List[Asset])
def list_assets(session: Session = Depends(get_session)):
    """Fetch all registered network assets."""
    assets = session.exec(select(Asset)).all()
    return assets


@router.post("/{asset_id}/isolate", response_model=Asset)
def isolate_asset(asset_id: int, session: Session = Depends(get_session)):
    """Automated Containment: Mark an asset as ISOLATED."""
    asset = session.get(Asset, asset_id)
    if not asset:
        raise HTTPException(status_code=404, detail="Asset not found")

    asset.status = AssetStatus.ISOLATED
    session.add(asset)
    session.commit()
    session.refresh(asset)
    return asset

@router.get("/topology")
def get_topology_map(session: Session = Depends(get_session)):
    """Generates node and edge graph data for Person C's visual topology map."""
    return generate_network_topology(session)