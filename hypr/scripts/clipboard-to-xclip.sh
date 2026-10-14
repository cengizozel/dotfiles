#!/bin/bash
# Run by wl-paste --watch (see hyprland.lua) with each new image/png clipboard
# selection on stdin. Pushes the image into the X selection so xclip over
# ssh -X can read it; Hyprland only syncs the clipboard to X while an X
# window has focus.
#
# Hyprland mirrors xclip's selection straight back as a new Wayland
# selection, truncated for large images. A selection that equals or is a
# prefix of the last pushed image is that mirror: skip it (or the watcher
# loops forever) and restore the full image on the Wayland side if it was
# truncated.
last=$XDG_RUNTIME_DIR/xclip-png
new=$(mktemp)
cat > "$new"
size=$(stat -c %s "$new")
if [ "$size" -eq 0 ]; then
    rm -f "$new"
    exit 0
fi
if [ -f "$last" ] && cmp -s -n "$size" "$new" "$last"; then
    rm -f "$new"
    if [ "$size" -lt "$(stat -c %s "$last")" ]; then
        wl-copy -t image/png < "$last"
    fi
    exit 0
fi
mv "$new" "$last"
xclip -selection clipboard -t image/png -i "$last"
