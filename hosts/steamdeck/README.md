# Steam Deck Desktop Mode

A Hyprland flavored setup for KDE Plasma 6 on SteamOS. Everything lives in the home directory so it survives SteamOS updates and never touches the read only root filesystem. Gaming mode is unaffected.

## Tiling

`kwin-scripts/krohnkite-hypr4/` is a customized build of [Krohnkite](https://github.com/anametologin/krohnkite) with an added DwindleLayout, a true binary tree tiler. New windows split the focused tile, with split direction chosen by the tile aspect ratio like Hyprland dwindle. It keeps per split ratios when windows come and go, supports directional swaps, and collapses a split when a window closes. Install by copying to `~/.local/share/kwin/scripts/` and enabling the Krohnkite Hypr script in System Settings under Window Management, KWin Scripts.

Layout selection uses numeric `<name>LayoutOrder` keys in kwinrc, where 0 disables a layout and 1 is the default. My settings are in `snippets/kwinrc-krohnkite.ini` with dwindle first and monocle second. There are 9 virtual desktops acting as workspaces.

Two maintenance warnings. KWin caches script code in memory, so after editing a script a full logout and login is required for changes to load. Never hot swap by reinstalling under a new plugin id while the session runs, because the old engine keeps running alongside the new one and the layouts fight over every window.

## Keyboard

Apple keyboard with Option and Command swapped to behave like Super and Alt, the `altwin:swap_alt_win` XKB option in System Settings under Keyboard, Key Bindings.

## Shortcuts

KDE ships defaults on many of these keys, all unbound first through the D-Bus interface of `org.kde.kglobalaccel`. Editing `kglobalshortcutsrc` by hand gets reverted, and the Shortcuts page of System Settings must not sit open with unapplied changes while bindings are modified elsewhere.

| Keys | Action |
| --- | --- |
| Meta+1 to 9 | Switch workspace |
| Meta+Shift+1 to 9 | Send window to workspace without following |
| Meta+H J K L | Directional focus |
| Meta+Shift+H J K L | Swap window with neighbor |
| Meta+Ctrl+H L and J K | Resize tile |
| Meta+Q | Close window |
| Meta+V | Toggle floating |
| Meta+Return | Swap with master tile |
| Meta+O | Toggle split direction |
| Meta+M | Monocle layout |
| Meta+T | kitty |
| Meta+B | LibreWolf |
| Meta+C | Signal |
| Meta+E | Dolphin |
| Alt+Space | KRunner |
| Meta+Shift+S | Region screenshot to clipboard |
| Meta+N | Notifications popup |
| Meta+Shift+N | Toggle do not disturb |
| Meta+Backspace | Clear all notifications |
| Ctrl+Alt+L | Lock screen |

Sending windows with shifted numbers carries the shifted symbol forms as alternate bindings, since pressing Meta+Shift+2 produces Meta+@ on a US layout.

## Theme

Tokyo Night from the same palette as my kitty config.

- `color-schemes/TokyoNight.colors` goes in `~/.local/share/color-schemes/`, applied with `plasma-apply-colorscheme TokyoNight`. Active titlebars are a dim navy, inactive ones dark gray. The scheme carries explicit ColorEffects sections so inactive windows do not dim their contents.
- Breeze window borders at Normal size with the outline and shadows off, see `snippets/breezerc` and `snippets/kwinrc-decoration.ini`. Breeze colors only the titlebar by focus state, side borders always take the application background color.
- kitty is the terminal, the official static build in `~/.local/kitty.app` with Hack Nerd Font in `~/.local/share/fonts`. It uses the shared kitty config from this repo plus `kitty/local.conf`, the Deck override that turns off transparency. `applications/kitty.desktop` carries the Meta+T launcher binding.
- `konsole/` holds a profile and color scheme matching kitty, kept as a fallback terminal.
- Animations globally off, AnimationDurationFactor 0 in kdeglobals plus the slide, scale, squash, maximize and fullscreen effects disabled.
- `cava/` goes in `~/.config/cava/` and gives the visualizer a Tokyo Night gradient.
- Wallpaper is night-city.png from this repo.

## Mini Pager

`plasmoids/com.cengizozel.minipager/` is a small custom panel widget replacing the stock pager. Plain numbers in Tokyo Night colors, current workspace highlighted, and a number only shows when that workspace is occupied or current, like the waybar workspaces module. Copy to `~/.local/share/plasma/plasmoids/` and add the Mini Pager widget to the panel, placed directly after the task manager so the panel does not shift when numbers appear.

## Misc

- Alt+Tab covers windows from all workspaces, TabBox DesktopMode 0 in kwinrc.
- `bin/notif-clear` dismisses every notification through the freedesktop notification protocol, bound to Meta+Backspace by `applications/notif-clear.desktop`. Meta+N opens a standalone notifications widget placed on the panel, since shortcut activation does not reach applets nested inside the system tray.
- Desktop session restore is off, loginMode emptySession in ksmserverrc.
- Battery charge limit at 80 percent in gaming mode settings since the Deck lives on a dock.
- Anything outside the home directory gets wiped by SteamOS updates.
