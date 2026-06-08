#!/usr/bin/env python3
"""Open a fixed set of apps in their assigned workspaces.

Philosophy: fill the gaps, don't reshuffle.
  - "Already open" means there's a visible WINDOW for the app. If a window
    exists anywhere, leave it where it is (skip). Otherwise launch it.
    (We deliberately do NOT check by process: a windowless background
    process — e.g. chromium left running, or an unrelated /home/steam path —
    would wrongly suppress the launch. Single-instance apps just refocus
    when relaunched, so window-only is both safe and intuitive.)
  - Apps land silently in their workspace so focus doesn't jump around.
  - The terminal (kitty) is checked per-workspace, not globally, because
    kitty is used all over the place and we still want one in workspace 5.

Edit SLOTS to change the layout.
"""

import json
import subprocess

# ws | match class (case-insensitive) | scope | launch command
SLOTS = [
    (3, "chromium",  "global",    "chromium"),
    (5, "kitty",     "workspace", "kitty"),
    (6, "librewolf", "global",    "librewolf"),
    (7, "Signal",    "global",    "signal-desktop"),
    (8, "steam",     "global",    "steam"),
    (9, "anytype",   "global",    "flatpak run io.anytype.anytype"),
]

FOCUS_WORKSPACE = 5  # where to land after launching


def hypr(*args):
    return subprocess.run(["hyprctl", *args], capture_output=True, text=True).stdout


def clients():
    try:
        return json.loads(hypr("clients", "-j"))
    except json.JSONDecodeError:
        return []


def main():
    wins = clients()

    def window_match(cls, ws=None):
        cls = cls.lower()
        for c in wins:
            cclass = (c.get("class") or "").lower()
            if cls in cclass:
                if ws is None or c.get("workspace", {}).get("id") == ws:
                    return True
        return False

    for ws, cls, scope, cmd in SLOTS:
        if scope == "workspace":
            has_window = window_match(cls, ws)
        else:  # global: a window for this app anywhere
            has_window = window_match(cls)

        if has_window:
            continue

        # Launch silently into the target workspace (focus stays put).
        hypr("dispatch", "exec", f"[workspace {ws} silent] {cmd}")

    hypr("dispatch", "workspace", str(FOCUS_WORKSPACE))


if __name__ == "__main__":
    main()
