# Steam Deck Desktop Mode Setup

A Hyprland flavored setup for KDE Plasma 6 on SteamOS, recreating the feel of my main rice inside desktop mode. Everything lives in the home directory so it survives SteamOS updates and never touches the read only root filesystem. Gaming mode is unaffected.

## Tiling

Tiling is handled by [Krohnkite](https://github.com/anametologin/krohnkite), a KWin script installed user side into `~/.local/share/kwin/scripts/`. The binary tree layout is enabled to mimic Hyprland dwindle splits, with Monocle as the secondary layout. Gaps are set to zero since screen space matters more on the handheld display. My kwinrc settings for it are in `snippets/kwinrc-krohnkite.ini`.

There are 9 virtual desktops acting as workspaces.

## Keyboard

I use an Apple keyboard, so Option and Command are swapped to behave like Super and Alt. This is the `altwin:swap_alt_win` XKB option, set through System Settings under Keyboard, Key Bindings, "Alt is swapped with Win".

## Shortcuts

These mirror my Hyprland binds where possible. KDE ships defaults on many of these keys (taskbar entry activation on Meta plus numbers, Activity Switcher on Meta+Q, lock screen on Meta+L, clipboard popup on Meta+V, tile editor on Meta+T, power profile on Meta+B), all of which had to be unbound first.

| Keys | Action |
| --- | --- |
| Meta+1 to 9 | Switch workspace |
| Meta+Shift+1 to 9 | Send window to workspace without following |
| Meta+H J K L | Directional focus |
| Meta+Shift+H J K L | Move window within layout |
| Meta+Ctrl+H L | Shrink and grow width |
| Meta+Ctrl+J K | Grow and shrink height |
| Meta+Q | Close window |
| Meta+V | Toggle floating |
| Meta+Return | Promote window to master |
| Meta+M | Monocle layout |
| Meta+T | Konsole |
| Meta+B | LibreWolf |
| Meta+C | Signal |
| Meta+E | Dolphin |
| Alt+Space | KRunner |
| Meta+Shift+S | Region screenshot to clipboard |
| Ctrl+Alt+L | Lock screen |

Two lessons learned that cost real debugging time. First, in Plasma 6 the global shortcut service is owned by KWin itself, and running clients push their in memory bindings back after any restart of it, so editing `kglobalshortcutsrc` by hand gets silently reverted. The reliable way is the `setForeignShortcut` D-Bus call on `org.kde.kglobalaccel`, clearing the conflicting default before claiming the key. Second, never leave the Shortcuts page of System Settings open while doing any of this, since hitting Apply writes back the stale snapshot it loaded at open time.

Sending windows with shifted numbers needs extra care because pressing Meta+Shift+2 actually produces Meta+@ on a US layout. Each Window to Desktop entry carries the plain form plus the shifted symbol forms as alternates so all of them match.

## Theme

Tokyo Night everywhere, built from the same palette as my kitty config.

- `color-schemes/TokyoNight.colors` goes in `~/.local/share/color-schemes/` and is applied with `plasma-apply-colorscheme TokyoNight`. It includes explicit ColorEffects sections because inheriting empty values from a previous scheme made inactive windows dim their whole contents.
- Active titlebars are a dim navy, inactive ones are the gray from my Hyprland inactive border. Breeze only colors the titlebar by focus state. The side borders always take the application background color, so a Hyprland style colored border ring is not possible with stock Breeze on SteamOS. Border size is set to Normal so tiles still read as separate windows without gaps, see `snippets/kwinrc-decoration.ini`.
- Breeze outline and window shadows are turned off for a flat look, see `snippets/breezerc`.
- `konsole/` holds a profile and color scheme matching kitty, including 70 percent background opacity with blur.
- Animations are globally off. AnimationDurationFactor is set to 0 in kdeglobals and the slide, scale, squash, maximize and fullscreen KWin effects are disabled. Note that writing the factor with kwriteconfig6 needs the notify flag or running apps never pick it up.
- Wallpaper is night-city.png from this repo.

## Mini Pager

`plasmoids/com.cengizozel.minipager/` is a small custom panel widget replacing the stock pager, which renders workspaces as big screen shaped rectangles. This one shows plain numbers in Tokyo Night colors, highlights the current workspace, and only shows a number when that workspace is occupied or current, like the waybar workspaces module. Install it by copying the folder to `~/.local/share/plasma/plasmoids/` and adding the Mini Pager widget to the panel.

Placement tip. Put it directly after the task manager and before the panel spacer, otherwise the panel contents shift every time a workspace number appears or disappears.

## Misc

- Battery charge limit set to 80 percent in gaming mode settings since the Deck lives on a dock.
- The trick for anything SteamOS does not persist. If it can be done in the home directory it is safe, anything installed with pacman gets wiped by the next SteamOS update.
