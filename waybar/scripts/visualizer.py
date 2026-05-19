#!/usr/bin/env python3
import subprocess
import json
import math
import time

BARS = 10
BLOCK = ' ▁▂▃▄▅▆▇█'

SINE_AFTER    = 3    # seconds of silence before sine appears
FADE_START    = 10   # seconds of silence before fade begins
FADE_DURATION = 3    # seconds to fade out completely

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

def make_sine(phase, amplitude=1.0):
    chars = []
    for i in range(BARS):
        val = math.sin(phase + i * (2 * math.pi / BARS))
        height = round((val + 1) / 2 * 6 * amplitude)
        chars.append(BLOCK[min(height, 8)])
    return ''.join(chars)

silence_start = None
sine_phase = 0.0

try:
    for line in cava.stdout:
        line = line.strip()
        if not line:
            continue

        try:
            values = [int(v) for v in line.split(';') if v.strip().isdigit()]
            if len(values) < BARS * 2:
                continue

            is_silent = all(v == 0 for v in values[:BARS])

            if is_silent:
                if silence_start is None:
                    silence_start = time.time()
                elapsed = time.time() - silence_start

                if elapsed < SINE_AFTER:
                    print(json.dumps({"text": "▁" * BARS, "class": "idle"}), flush=True)
                elif elapsed < FADE_START:
                    sine_phase += 0.05
                    print(json.dumps({'text': make_sine(sine_phase), 'class': 'sine'}), flush=True)
                elif elapsed < FADE_START + FADE_DURATION:
                    sine_phase += 0.05
                    print(json.dumps({'text': make_sine(sine_phase), 'class': 'fading'}), flush=True)
                else:
                    print(json.dumps({"text": "", "class": "gone"}), flush=True)
                continue

            silence_start = None
            sine_phase = 0.0
            text = ''.join(BLOCK[min(v, 8)] for v in values[BARS:])
            print(json.dumps({'text': text}), flush=True)
        except:
            print(json.dumps({"text": "▁" * BARS, "class": "idle"}), flush=True)

except (BrokenPipeError, KeyboardInterrupt):
    pass
finally:
    cava.kill()
