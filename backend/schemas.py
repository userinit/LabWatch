from pydantic import BaseModel

class Metric(BaseModel):
    timestamp: float
    cpu: float
    ram: float
    net_send: float
    net_recv: float
    disk_read: float
    disk_write: float