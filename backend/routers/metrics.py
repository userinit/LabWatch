from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from schemas import Metric
import storage
import time

router = APIRouter()

@router.get("/metrics")
def dump():
    return storage.metrics_buffer

@router.get("/metrics/latest")
def return_latest():
    try:
        return storage.metrics_buffer[-1]
    except IndexError:
        raise HTTPException(status_code=404, detail="No data has been captured yet.")

@router.post("/metrics")
def ingest(metric: Metric):
    storage.metrics_buffer.append(metric.model_dump())
    storage.last_seen = time.time()
    return {"status": "ok"}