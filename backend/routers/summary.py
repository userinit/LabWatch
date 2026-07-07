from fastapi import APIRouter
from fastapi.exceptions import HTTPException
from storage import summary
from schemas import Summary

router = APIRouter()

@router.get("/summary")
def get_summary():
    if not summary:
        raise HTTPException(status_code=404, detail="No summary found.")
    else:
        return summary

@router.post("/summary")
def make_summary(inputted_summary: Summary):
    global summary
    summary = inputted_summary
    print(summary)
    return {"status": "ok"}