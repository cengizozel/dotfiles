#!/usr/bin/env bash
STATE="${XDG_RUNTIME_DIR:-/tmp}/waybar-volume-show-until"
LOCK="${XDG_RUNTIME_DIR:-/tmp}/waybar-volume-revert.lock"

case "${1:-}" in
    up)   wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%+ ;;
    down) wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%- ;;
esac

date -d '+1.5 seconds' +%s%3N > "$STATE"

(
    flock -n 9 || exit 0
    while true; do
        now_ms=$(date +%s%3N)
        until_ms=$(cat "$STATE" 2>/dev/null || echo 0)
        if (( now_ms >= until_ms )); then
            pkill -RTMIN+8 waybar 2>/dev/null || true
            exit 0
        fi
        sleep 0.1
    done
) 9>"$LOCK" &
disown
