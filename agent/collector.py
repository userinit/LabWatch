# This file will contain the logic for collecting the data from the system of the home lab
import asyncio
import psutil
import time
from sender import send_metrics, send_summary

prev_net = None
prev_disk = None
prev_net_time = None
prev_disk_time = None

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

    # statistics just for summary
    disk_info = psutil.disk_usage("/")
    disk_percent = disk_info.percent
    disk_free_bytes = disk_info.free
    disk_used_bytes = disk_info.used
    disk_total_bytes = disk_info.total

    return {
        "disk_write": (write_delta / 1024 ** 2 / dt), # Write rate in MB/s
        "disk_read": (read_delta / 1024 ** 2 / dt), # Read rate in MB/s
        "disk_percent": disk_percent,
        "disk_free_bytes": disk_free_bytes,
        "disk_used_bytes": disk_used_bytes,
        "disk_total_bytes": disk_total_bytes
    }

async def collect_metrics():
    while True:
        cpu_percent = psutil.cpu_percent(percpu=False)
        cpu_frequency_ghz = psutil.cpu_freq(percpu=False).current / 1000
        cpu_physical_cores = psutil.cpu_count(logical=False)
        cpu_logical_cores = psutil.cpu_count(logical=True)

        ram = psutil.virtual_memory()
        ram_used_bytes = ram.used
        ram_available_bytes = ram.available
        ram_total_bytes = ram.total
        ram_percent = ram.percent

        network = get_network()
        disk = get_disk()
        if disk is None or network is None:
            await asyncio.sleep(2)
            continue
        now = time.time()
        metrics = {
            "timestamp": now, 
            "cpu": cpu_percent,
            "ram": ram_percent,
            "net_send": network["net_send"],
            "net_recv": network["net_recv"],
            "disk_write": disk["disk_write"],
            "disk_read": disk["disk_read"]
        }
        summary = {
            "timestamp": now,
            "cpu": {
                "usage_percent": cpu_percent,
                "frequency_ghz": cpu_frequency_ghz,
                "physical_cores": cpu_physical_cores,
                "logical_cores": cpu_logical_cores
            },
            "ram": {
                "usage_percent": ram_percent,
                "used_bytes": ram_used_bytes,
                "available_bytes": ram_available_bytes,
                "total_bytes": ram_total_bytes
            },
            "network": {
                "send_mbps": network["net_send"],
                "receive_mbps": network["net_recv"]
            },
            "disk": {
                "read_mbs": disk["disk_read"],
                "write_mbs": disk["disk_write"],
                "usage_percent": disk["disk_percent"],
                "free_bytes": disk["disk_free_bytes"],
                "used_bytes": disk["disk_used_bytes"],
                "total_bytes": disk["disk_total_bytes"]
            }
        }
        await send_metrics(metrics)
        await send_summary(summary)
        await asyncio.sleep(2)

asyncio.run(collect_metrics())
