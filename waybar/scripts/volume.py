#!/usr/bin/env python3
# Event-driven volume module. Listens to pactl for sink changes and prints a
# new line on each one: the percent right after a change, the icon again a
# moment later. No polling, so slider scrolls and pavucontrol edits show up too.
import json
import re
import subprocess
import threading

ICONS = ['󰕿', '󰖀', '󰕾']
MUTED_ICON = '󰝟'
PERCENT_FOR = 1.5  # seconds to show the number after a change
EVENT = re.compile(r"Event 'change' on (sink|server) #")

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

def emit(show_percent):
    vol, muted = get_state()
    if muted:
        text, cls = MUTED_ICON, 'icon'
    elif show_percent:
        text, cls = f'{vol}%', 'percent'
    else:
        text, cls = (ICONS[0] if vol == 0 else ICONS[1] if vol < 50 else ICONS[2]), 'icon'
    print(json.dumps({'text': text, 'tooltip': f'{vol}%', 'class': cls}), flush=True)

timer = None

def on_change():
    global timer
    emit(True)
    if timer:
        timer.cancel()
    timer = threading.Timer(PERCENT_FOR, emit, args=(False,))
    timer.daemon = True
    timer.start()

emit(False)
with subprocess.Popen(['pactl', 'subscribe'], stdout=subprocess.PIPE, stderr=subprocess.DEVNULL, text=True) as p:
    for line in p.stdout:
        if EVENT.search(line):
            on_change()
