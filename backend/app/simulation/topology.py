import networkx as nx
from typing import Dict, Any, List
from sqlmodel import Session, select
from app.db.models import Asset, AssetStatus


def generate_network_topology(session: Session) -> Dict[str, Any]:
    """Queries registered assets and calculates connection graph using NetworkX."""
    assets = session.exec(select(Asset)).all()
    
    G = nx.Graph()
    
    # Add nodes from Postgres assets
    for asset in assets:
        G.add_node(
            asset.id,
            label=asset.hostname,
            ip=asset.ip_address,
            type=asset.asset_type,
            zone=asset.zone,
            status=asset.status,
            vulnerability_score=asset.vulnerability_score
        )
    
    # Establish dynamic edges (e.g., assets in the same zone or connected to Gateway)
    nodes = list(G.nodes(data=True))
    edges = []
    
    for i in range(len(nodes)):
        for j in range(i + 1, len(nodes)):
            node_a_id, data_a = nodes[i]
            node_b_id, data_b = nodes[j]
            
            # Connect assets if they belong to the same zone or connect through DMZ
            if data_a["zone"] == data_b["zone"] or data_a["zone"] == "DMZ" or data_b["zone"] == "DMZ":
                # Don't draw connections to isolated assets
                if data_a["status"] != AssetStatus.ISOLATED and data_b["status"] != AssetStatus.ISOLATED:
                    G.add_edge(node_a_id, node_b_id)
                    edges.append({
                        "from": node_a_id,
                        "to": node_b_id,
                        "label": "Authorized Flow"
                    })
    
    # Format graph for Vis.js / Cytoscape frontend
    formatted_nodes = [
        {"id": node_id, **data} for node_id, data in G.nodes(data=True)
    ]
    
    return {
        "nodes": formatted_nodes,
        "edges": edges
    }