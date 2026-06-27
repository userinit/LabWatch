# This file will send the data to the main server via HTTP POST
import httpx

url = "http://localhost:8000"

client = httpx.AsyncClient()

async def send_metrics(metrics):
    await client.post(f"{url}/metrics", json=metrics)