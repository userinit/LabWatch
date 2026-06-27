from pydantic import BaseModel

class Metric(BaseModel):
    timestamp: float
    cpu: float
    ram: float
    net_send_mbps: float
    net_recv_mbps: float