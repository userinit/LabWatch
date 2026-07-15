from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware
from routers import metrics, summary
from os import getenv
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="LabWatch API", version="1.0")
router = APIRouter()

raw_origins = getenv("ALLOWED_ORIGINS", default="http://localhost:5173")
allowed_origins = [origin.strip() for origin in raw_origins.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["*"]
)

app.include_router(metrics.router)
app.include_router(summary.router)