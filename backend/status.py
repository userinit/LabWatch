# from storage import last_seen
import storage
import time

AGENT_TIMEOUT_SECONDS = 10 # time, in seconds, before agent is classed as offline

def get_agent_status():
    print(storage.last_seen)
    if storage.last_seen is None:
        return {
            "online": False,
        }
    return {
        "online": time.time() - storage.last_seen < AGENT_TIMEOUT_SECONDS,
        "last_seen": storage.last_seen
    }