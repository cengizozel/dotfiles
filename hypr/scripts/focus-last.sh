#!/bin/bash
# Alt+Tab: jump to the most recently focused window other than the current one.
# focus { last = true } does nothing from an empty workspace, so pick the target
# from Hyprland's global focus history instead.
target=$(python3 - <<'EOF'
import json, subprocess

def query(what):
    out = subprocess.run(["hyprctl", what, "-j"], capture_output=True, text=True).stdout
    try:
        return json.loads(out)
    except ValueError:
        return {}

active = query("activewindow").get("address")
clients = [
    c for c in query("clients")
    if c["address"] != active and c["workspace"]["id"] > 0 and c.get("mapped", True)
]
if clients:
    print(min(clients, key=lambda c: c["focusHistoryID"])["address"])
EOF
)
[ -n "$target" ] && hyprctl dispatch "hl.dsp.focus({ window = \"address:$target\" })" >/dev/null
