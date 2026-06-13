#!/bin/bash
BORDER=$(cat /tmp/hypr_swap_border 2>/dev/null)
hyprctl keyword general:col.active_border "${BORDER:-rgb(7aa2f7)}"
hyprctl dispatch submap reset
