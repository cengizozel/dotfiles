#!/bin/bash
# Remember the focused window, save the current active-border color so we can
# restore whatever the theme uses, then tint the border and enter swap mode.
hyprctl activewindow -j | python3 -c "import sys,json; print(json.load(sys.stdin)['address'])" > /tmp/hypr_swap_source
hyprctl getoption general:col.active_border -j \
    | python3 -c "import sys,json; print(' '.join('0x'+t if len(t)==8 and not t.endswith('deg') else t for t in json.load(sys.stdin)['custom'].split()))" \
    > /tmp/hypr_swap_border
hyprctl keyword general:col.active_border "rgb(ff6600)"
hyprctl dispatch submap swapmode
