#!/usr/bin/env bash
STATE="/tmp/waybar-clock-alt"
if [[ -f "$STATE" ]]; then
    text=$(LC_ALL=ja_JP.utf8 TZ=Europe/Istanbul date +"%I時%M分 | %a %m月%d日")
else
    text=$(TZ=Europe/Istanbul date +"%I時%M分")
fi
printf '{"text":"%s"}\n' "$text"
