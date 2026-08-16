#!/bin/bash
BORDER=$(cat /tmp/hypr_swap_border 2>/dev/null)
hyprctl eval "hl.config({ general = { col = { active_border = \"${BORDER:-rgb(7aa2f7)}\" } } })" | grep -q '^ok' \
    || hyprctl keyword general:col.active_border "${BORDER:-rgb(7aa2f7)}"
hyprctl dispatch submap reset >/dev/null 2>&1 \
    || hyprctl dispatch 'hl.dsp.submap("reset")'
