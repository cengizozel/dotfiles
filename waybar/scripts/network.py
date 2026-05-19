#!/usr/bin/env python3
import sys, os, time, json, subprocess

CACHE      = '/tmp/waybar-net-cache'
MODE_FILE  = '/tmp/waybar-net-mode'
FALLBACK   = '{"text": "↓ 0.00 MB/s"}'

def get_iface():
    r = subprocess.run(['ip', 'route', 'show', 'default'], capture_output=True, text=True)
    tokens = r.stdout.split()
    if 'dev' in tokens:
        return tokens[tokens.index('dev') + 1]
    return None

def get_bytes(iface):
    rx = int(open(f'/sys/class/net/{iface}/statistics/rx_bytes').read())
    tx = int(open(f'/sys/class/net/{iface}/statistics/tx_bytes').read())
    return rx, tx

def read_mode():
    try:
        return open(MODE_FILE).read().strip()
    except:
        return 'down'

iface = get_iface()
if not iface:
    print(FALLBACK)
    sys.exit()

rx, tx = get_bytes(iface)
now    = time.time()
mode   = read_mode()

cache = {}
if os.path.exists(CACHE):
    try:
        with open(CACHE) as f:
            cache = json.load(f)
    except:
        pass

if cache.get('iface') == iface:
    dt = now - cache['time']
    if dt > 0:
        rx_mb = (rx - cache['rx']) / dt / 1048576
        tx_mb = (tx - cache['tx']) / dt / 1048576
        if mode == 'both':
            text = f'↓{rx_mb:5.2f} ↑{tx_mb:5.2f} MB/s'
        else:
            text = f'↓{rx_mb:5.2f} MB/s'
        print(json.dumps({'text': text}))
    else:
        print(FALLBACK)
else:
    print(FALLBACK)

with open(CACHE, 'w') as f:
    json.dump({'iface': iface, 'rx': rx, 'tx': tx, 'time': now}, f)
