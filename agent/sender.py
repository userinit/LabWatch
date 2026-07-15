# This file will send the data to the main server via HTTP POST
import httpx
from os import getenv
from dotenv import load_dotenv

load_dotenv()

BACKEND_IP = getenv("BACKEND_IP", default="127.0.0.1")
PORT = getenv("PORT", default="8000")
URL = f"http://{BACKEND_IP}:{PORT}"

client = httpx.AsyncClient()

async def send_metrics(metrics):
    await client.post(f"{URL}/metrics", json=metrics)

async def send_summary(summary):
    await client.post(f"{URL}/summary", json=summary)