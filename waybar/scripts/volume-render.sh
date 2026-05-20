#!/usr/bin/env bash
STATE="${XDG_RUNTIME_DIR:-/tmp}/waybar-volume-show-until"
now_ms=$(date +%s%3N)
until_ms=0
[[ -f "$STATE" ]] && until_ms=$(cat "$STATE" 2>/dev/null || echo 0)

vol=$(wpctl get-volume @DEFAULT_AUDIO_SINK@ | awk '{printf "%d", $2 * 100}')
wpctl get-volume @DEFAULT_AUDIO_SINK@ | grep -q MUTED && muted=1 || muted=0

if [[ "$muted" == 1 ]]; then
    icon="󰝟"
elif (( vol >= 70 )); then
    icon="󰕾"
elif (( vol >= 30 )); then
    icon="󰖀"
else
    icon="󰕿"
fi

if (( now_ms < until_ms )); then
    text="${vol}%"
else
    text="$icon"
fi

printf '{"text":"%s","tooltip":"%d%%"}\n' "$text" "$vol"
