from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from schemas import Summary
from status import get_agent_status
import storage
import time

router = APIRouter()

@router.get("/summary")
def get_summary():
    if not storage.summary:
        raise HTTPException(status_code=404, detail="No summary found.")
    else:
        return {
            "agent": get_agent_status(),
            "summary": storage.summary
        }

@router.post("/summary")
def make_summary(inputted_summary: Summary):
    storage.summary = inputted_summary
    storage.last_seen = time.time()
    return {"status": "ok"}