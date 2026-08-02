#!/bin/bash
# Toggle the second monitor output. Disabling migrates its workspaces to the
# primary; re-enabling restores the layout from monitors.conf via reload.
MON=HDMI-A-1
if hyprctl monitors -j | jq -e --arg m "$MON" '.[] | select(.name==$m)' >/dev/null; then
    hyprctl keyword monitor "$MON, disable"
else
    hyprctl reload
fi
