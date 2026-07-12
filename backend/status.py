# from storage import last_seen
import storage
import time

AGENT_TIMEOUT_SECONDS = 5 # time, in seconds, before agent is classed as offline

def get_agent_status():
    if storage.last_seen is None:
        return {
            "online": False,
        }
    return {
        "online": time.time() - storage.last_seen < AGENT_TIMEOUT_SECONDS,
        "last_seen": storage.last_seen
    }