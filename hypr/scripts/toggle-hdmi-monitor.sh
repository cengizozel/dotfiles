#!/bin/bash
# Toggle the small HDMI monitor on/off and remember the choice across logins.
# Geometry must match ~/.config/hypr/monitors.lua.

MON="HDMI-A-1"
CFG="1024x768@85.0,0x672,1.0"
STATE="$HOME/.config/hypr/hdmi-monitor.state"

if hyprctl monitors | grep -q "^Monitor $MON"; then
    hyprctl eval "hl.monitor({ output = \"$MON\", disabled = true })" | grep -q '^ok' \
        || hyprctl keyword monitor "$MON,disable"
    echo off > "$STATE"
    notify-send "Monitor" "$MON off" -t 1500
else
    IFS=, read -r mode pos scale <<< "$CFG"
    hyprctl eval "hl.monitor({ output = \"$MON\", mode = \"$mode\", position = \"$pos\", scale = $scale })" | grep -q '^ok' \
        || hyprctl keyword monitor "$MON,$CFG"
    echo on > "$STATE"
    notify-send "Monitor" "$MON on" -t 1500
fi
