# backend/app/ai_intelligence/vector_store.py
from qdrant_client import QdrantClient
from qdrant_client.models import Distance, VectorParams, PointStruct
import uuid

class SecurityIntelStore:
    def __init__(self):
        self.client = QdrantClient(":memory:")
        self.collection_name = "threat_intel"
        self._init_collection()

    def _init_collection(self):
        self.client.recreate_collection(
            collection_name=self.collection_name,
            vectors_config=VectorParams(size=3, distance=Distance.COSINE)
        )

    def ingest_vulnerability(self, cve_id: str, description: str, vector_mock: list):
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                PointStruct(
                    id=str(uuid.uuid4()),
                    vector=vector_mock,
                    payload={"cve_id": cve_id, "description": description}
                )
            ]
        )

    def search_threat_context(self, log_vector: list) -> list:
        """Cross-references real-time anomalies against known CVE descriptions."""
        search_result = self.client.query_points(
            collection_name=self.collection_name,
            query=log_vector,
            limit=1
        )
        
        return [res.payload for res in search_result.points]