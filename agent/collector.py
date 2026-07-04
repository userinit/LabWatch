# This file will contain the logic for collecting the data from the system of the home lab
import asyncio
import psutil
import time
from sender import send_metrics

prev_net = None
prev_disk = None
prev_net_time = None
prev_disk_time = None
first_run = True

psutil.cpu_percent(interval=None)
    
def get_network():
    global prev_net
    global prev_net_time
    net = psutil.net_io_counters()
    now = time.time()

    if prev_net is None:
        prev_net = net
        prev_net_time = now
        return None
    
    delta_sent = net.bytes_sent - prev_net.bytes_sent
    delta_recv = net.bytes_recv - prev_net.bytes_recv

    dt = now - prev_net_time # Change in time

    prev_net = net
    prev_net_time = now

    return {
        "net_send": (delta_sent / 1024 ** 2 * 8 / dt), # Send (Upload) rate in Mbps
        "net_recv": (delta_recv / 1024 ** 2 * 8 / dt) # Receive (Download) rate in Mbps
    }

def get_disk():
    global prev_disk
    global prev_disk_time
    disk = psutil.disk_io_counters()
    now = time.time()

    if prev_disk is None:
        prev_disk = disk
        prev_disk_time = now
        return None
    
    write_delta = disk.write_bytes - prev_disk.write_bytes
    read_delta = disk.read_bytes - prev_disk.read_bytes

    dt = now - prev_disk_time

    prev_disk = disk
    prev_disk_time = now

    return {
        "disk_write": (write_delta / 1024 ** 2 / dt), # Write rate in MB/s
        "disk_read": (read_delta / 1024 ** 2 / dt) # Read rate in MB/s
    }

async def collect_metrics():
    global first_run
    while True:
        cpu = psutil.cpu_percent()
        ram = psutil.virtual_memory().percent
        network = get_network()
        disk = get_disk()
        if first_run:
            first_run = False
            time.sleep(2)
            continue
        metrics = {
            "timestamp": time.time(), 
            "cpu": cpu,
            "ram": ram,
            "net_send": network["net_send"],
            "net_recv": network["net_recv"],
            "disk_write": disk["disk_write"],
            "disk_read": disk["disk_read"]
        }
        await send_metrics(metrics)
        time.sleep(2)

asyncio.run(collect_metrics())
