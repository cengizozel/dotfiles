#!/usr/bin/env bash
# Ask before logging out of Hyprland, so a stray Super+M can't kill the session.
# Default selection is Cancel, so a reflexive Enter/Escape is harmless.

choice=$(printf 'Cancel\nLog out' | rofi -dmenu -i \
    -p "Log out of Hyprland?" \
    -theme ~/.config/rofi/confirm.rasi \
    -selected-row 0 \
    -u 1)

[ "$choice" = "Log out" ] || exit 0

if command -v hyprshutdown >/dev/null 2>&1; then
    hyprshutdown
else
    hyprctl dispatch exit
fi
