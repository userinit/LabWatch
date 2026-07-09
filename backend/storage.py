from collections import deque
metrics_buffer = deque(maxlen=60)
summary = {}
last_seen = None