#!/bin/bash
SOURCE=$(cat /tmp/hypr_swap_source)
hyprctl dispatch swapwindow address:$SOURCE
hyprctl keyword general:col.active_border "rgb(89b4fa)"
hyprctl dispatch submap reset
