#!/usr/bin/env python3
import subprocess, os, time, json

STATE_FILE = '/tmp/waybar-vol-changed'
ICONS = ['󰕿', '󰖀', '󰕾']
MUTED_ICON = '󰝟'

def get_volume():
    r = subprocess.run(['pactl', 'get-sink-volume', '@DEFAULT_SINK@'], capture_output=True, text=True)
    for part in r.stdout.split():
        if part.endswith('%'):
            return min(int(part[:-1]), 100)
    return 0

def is_muted():
    r = subprocess.run(['pactl', 'get-sink-mute', '@DEFAULT_SINK@'], capture_output=True, text=True)
    return 'yes' in r.stdout

vol = get_volume()
muted = is_muted()

recently_changed = os.path.exists(STATE_FILE) and (time.time() - os.path.getmtime(STATE_FILE)) < 1.5

if muted:
    text = MUTED_ICON
elif recently_changed:
    text = f'{vol}%'
else:
    text = ICONS[0] if vol == 0 else ICONS[1] if vol < 50 else ICONS[2]

cls = 'percent' if (not muted and recently_changed) else 'icon'
print(json.dumps({'text': text, 'tooltip': f'{vol}%', 'class': cls}))
