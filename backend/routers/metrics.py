from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from storage import metrics_buffer
from schemas import Metric

router = APIRouter()

@router.get("/metrics")
def dump():
    return metrics_buffer

@router.get("/metrics/latest")
def return_latest():
    try:
        return metrics_buffer[-1]
    except IndexError:
        raise HTTPException(status_code=404, detail="No data has been captured yet.")

@router.post("/metrics")
def ingest(metric: Metric):
    metrics_buffer.append(metric.model_dump())
    return {"status": "ok"}