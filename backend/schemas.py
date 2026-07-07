from pydantic import BaseModel

class Metric(BaseModel):
    timestamp: float
    cpu: float
    ram: float
    net_send: float
    net_recv: float
    disk_read: float
    disk_write: float

class Cpu(BaseModel):
    usage_percent: float
    frequency_ghz: float
    physical_cores: int
    logical_cores: int

class Ram(BaseModel):
    usage_percent: float
    used_bytes: int
    available_bytes: int
    total_bytes: int

class Network(BaseModel):
    send_mbps: float
    receive_mbps: float

class Disk(BaseModel):
    read_mbs: float
    write_mbs: float
    usage_percent: float
    free_bytes: int
    used_bytes: int
    total_bytes: int

class Summary(BaseModel):
    timestamp: float
    cpu: Cpu
    ram: Ram
    network: Network
    disk: Disk