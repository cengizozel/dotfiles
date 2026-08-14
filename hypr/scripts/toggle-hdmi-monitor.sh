#!/bin/bash
# Toggle the small HDMI monitor on/off and remember the choice across logins.
# Geometry must match ~/.config/hypr/monitors.conf.

MON="HDMI-A-1"
CFG="1024x768@85.0,0x672,1.0"
STATE="$HOME/.config/hypr/hdmi-monitor.state"

if hyprctl monitors | grep -q "^Monitor $MON"; then
    hyprctl keyword monitor "$MON,disable"
    echo off > "$STATE"
    notify-send "Monitor" "$MON off" -t 1500
else
    hyprctl keyword monitor "$MON,$CFG"
    echo on > "$STATE"
    notify-send "Monitor" "$MON on" -t 1500
fi
