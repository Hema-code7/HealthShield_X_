import json
import networkx as nx
from typing import Dict, Any, List

def build_attack_graph(nodes_data: List[Dict[str, Any]], edges_data: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Constructs a NetworkX directed graph representing the attack path
    and returns a structured node-edge representation formatted for React Flow.
    """
    G = nx.DiGraph()

    for node in nodes_data:
        G.add_node(
            node["id"],
            label=node.get("label", node["id"]),
            node_type=node.get("node_type", "Workstation"),
            ip=node.get("ip", ""),
            risk_state=node.get("risk_state", "normal"),
            evidence_count=node.get("evidence_count", 0),
            missing_evidence=node.get("missing_evidence", "")
        )

    for edge in edges_data:
        supporting = edge.get("supporting_events", "[]")
        if isinstance(supporting, str):
            try:
                supporting = json.loads(supporting)
            except Exception:
                supporting = []
                
        G.add_edge(
            edge["source"],
            edge["target"],
            id=edge.get("id", f"{edge['source']}-{edge['target']}"),
            relationship_label=edge.get("relationship_label", "connects"),
            supporting_events=supporting
        )

    # Format output for frontend React Flow & REST API
    react_nodes = []
    react_edges = []

    # Layout offsets for visual presentation
    layout_positions = {
        "ATTACKER": {"x": 50, "y": 150},
        "WORKSTATION-14": {"x": 280, "y": 150},
        "HOSPITAL-API": {"x": 510, "y": 150},
        "PATIENT-DB": {"x": 740, "y": 150},
        "FILE-STORE": {"x": 970, "y": 150},
    }

    for n, data in G.nodes(data=True):
        pos = layout_positions.get(n, {"x": 200, "y": 200})
        react_nodes.append({
            "id": n,
            "type": "cyberNode",
            "position": pos,
            "data": {
                "id": n,
                "label": data["label"],
                "node_type": data["node_type"],
                "ip": data["ip"],
                "risk_state": data["risk_state"],
                "evidence_count": data["evidence_count"],
                "missing_evidence": data["missing_evidence"],
            }
        })

    for u, v, data in G.edges(data=True):
        react_edges.append({
            "id": data["id"],
            "source": u,
            "target": v,
            "label": data["relationship_label"],
            "animated": True,
            "style": {"stroke": "#ef4444" if G.nodes[u].get("risk_state") == "compromised" else "#6366f1"},
            "data": {
                "relationship_label": data["relationship_label"],
                "supporting_events": data["supporting_events"]
            }
        })

    return {
        "nodes": react_nodes,
        "edges": react_edges,
        "summary": {
            "total_nodes": G.number_of_nodes(),
            "total_edges": G.number_of_edges(),
            "compromised_nodes": [n for n, d in G.nodes(data=True) if d.get("risk_state") == "compromised"],
            "suspicious_nodes": [n for n, d in G.nodes(data=True) if d.get("risk_state") == "suspicious"]
        }
    }
