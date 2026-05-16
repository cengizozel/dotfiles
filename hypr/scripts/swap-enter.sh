#!/bin/bash
hyprctl activewindow -j | python3 -c "import sys,json; print(json.load(sys.stdin)['address'])" > /tmp/hypr_swap_source
hyprctl keyword general:col.active_border "rgb(ff6600)"
hyprctl dispatch submap swapmode
