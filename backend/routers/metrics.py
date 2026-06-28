from fastapi import APIRouter
from storage import metrics_buffer
from schemas import Metric

router = APIRouter()

@router.get("/metrics")
def dump():
    return metrics_buffer

@router.get("/metrics/latest")
def return_latest():
    return metrics_buffer[-1]

@router.post("/metrics")
def ingest(metric: Metric):
    metrics_buffer.append(metric.model_dump())
    return {"status": "ok"}