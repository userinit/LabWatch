# This file will contain the logic for collecting the data from the system of the home lab
import asyncio
import psutil
import time
from sender import send_metrics

prev_net = None
prev_time = None
first_run = True

psutil.cpu_percent(interval=None)
    
def get_network():
    global prev_net
    global prev_time
    net = psutil.net_io_counters()
    now = time.time()

    if prev_net is None:
        prev_net = net
        prev_time = now
        return None
    
    delta_sent = net.bytes_sent - prev_net.bytes_sent
    delta_recv = net.bytes_recv - prev_net.bytes_recv

    dt = now - prev_time # Change in time

    prev_net = net
    prev_time = now

    return {
        "net_send_mbps": (delta_sent / 1024 ** 2 * 8 / dt), # Rate in Mbps
        "net_recv_mbps": (delta_recv / 1024 ** 2 * 8 / dt) # Rate in Mbps
    }

async def collect_metrics():
    global first_run
    while True:
        cpu = psutil.cpu_percent()
        ram = psutil.virtual_memory().percent
        network = get_network()
        if first_run:
            first_run = False
            time.sleep(2)
            continue
        metrics = {
            "timestamp": time.time(), 
            "cpu": cpu,
            "ram": ram,
            "net_send_mbps": network["net_send_mbps"],
            "net_recv_mbps": network["net_recv_mbps"]
        }
        await send_metrics(metrics)
        time.sleep(2)

asyncio.run(collect_metrics())
