#!/usr/bin/env python3
import subprocess, os, time, json

STATE_FILE = '/tmp/waybar-vol-changed'
ICONS = ['󰕿', '󰖀', '󰕾']
MUTED_ICON = '󰝟'

def get_state():
    # wpctl prints e.g. "Volume: 0.68" or "Volume: 0.68 [MUTED]"
    r = subprocess.run(['wpctl', 'get-volume', '@DEFAULT_AUDIO_SINK@'], capture_output=True, text=True)
    vol = 0
    for part in r.stdout.split():
        try:
            vol = min(round(float(part) * 100), 100)
            break
        except ValueError:
            continue
    return vol, 'MUTED' in r.stdout

vol, muted = get_state()

recently_changed = os.path.exists(STATE_FILE) and (time.time() - os.path.getmtime(STATE_FILE)) < 1.5

if muted:
    text = MUTED_ICON
elif recently_changed:
    text = f'{vol}%'
else:
    text = ICONS[0] if vol == 0 else ICONS[1] if vol < 50 else ICONS[2]

cls = 'percent' if (not muted and recently_changed) else 'icon'
print(json.dumps({'text': text, 'tooltip': f'{vol}%', 'class': cls}))
