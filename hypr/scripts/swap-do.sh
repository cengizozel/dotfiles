#!/bin/bash
SOURCE=$(cat /tmp/hypr_swap_source)
hyprctl dispatch swapwindow address:$SOURCE
hyprctl keyword general:col.active_border "rgb(7aa2f7)"
hyprctl dispatch submap reset
