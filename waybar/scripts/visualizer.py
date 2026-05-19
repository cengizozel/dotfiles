#!/usr/bin/env python3
import subprocess
import json

BARS = 10
BLOCK = ' ▁▂▃▄▅▆▇█'

config = f"""
[general]
bars = {BARS * 2}
sleep_timer = 0

[input]
method = pulse
source = alsa_output.usb-Logitech_G733_Gaming_Headset_0000000000000000-00.analog-stereo.monitor

[output]
method = raw
data_format = ascii
ascii_max_range = 8
"""

with open('/tmp/waybar_cava.cfg', 'w') as f:
    f.write(config)

cava = subprocess.Popen(
    ['cava', '-p', '/tmp/waybar_cava.cfg'],
    stdout=subprocess.PIPE,
    stderr=subprocess.DEVNULL,
    text=True,
    bufsize=1
)

frame = 0
playing = False

try:
    for line in cava.stdout:
        line = line.strip()
        if not line:
            continue

        if frame % 10 == 0:
            try:
                r = subprocess.run(['playerctl', 'status'],
                                   capture_output=True, text=True, timeout=0.2)
                playing = r.stdout.strip() == 'Playing'
            except:
                playing = False
        frame += 1

        if not playing:
            print(json.dumps({"text": "▁" * BARS, "class": "idle"}), flush=True)
            continue

        try:
            values = [int(v) for v in line.split(';') if v.strip().isdigit()]
            if len(values) >= BARS * 2:
                text = ''.join(BLOCK[min(v, 8)] for v in values[:BARS])
                print(json.dumps({'text': text}), flush=True)
        except:
            print(json.dumps({"text": "▁" * BARS, "class": "idle"}), flush=True)

except (BrokenPipeError, KeyboardInterrupt):
    pass
finally:
    cava.kill()
