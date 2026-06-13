# dotfiles

Hyprland desktop on Arch Linux, themed with Tokyo Night.

## Setup

There is no bootstrap script. Clone the repo and copy each config into the
location shown below, then install the matching packages.

```bash
git clone https://github.com/cengizozel/dotfiles.git
```

## Configs

| Path | Installs to |
|------|-------------|
| `hypr/` | `~/.config/hypr/` |
| `waybar/` | `~/.config/waybar/` |
| `swaync/` | `~/.config/swaync/` |
| `rofi/` | `~/.config/rofi/` |
| `kitty/` | `~/.config/kitty/` |
| `nvim/` | `~/.config/nvim/` |
| `bashrc` | `~/.bashrc` |
| `bin/rofi-click-away` | `~/.local/bin/rofi-click-away` |
| `wallpapers/` | `~/Pictures/wallpapers/` |
| `librewolf/userChrome.css` | `~/.config/librewolf/librewolf/<profile>/chrome/userChrome.css` |
| `aerospace.toml` | `~/.aerospace.toml` (macOS, see note below) |

`aerospace.toml` is for [AeroSpace](https://github.com/nikitabobko/AeroSpace), a
tiling window manager for macOS. It is kept here so all configs live in one place.

## Keybinds

| Keybind | Action |
|---------|--------|
| `Super+T` | Terminal (kitty) |
| `Super+E` | File manager (yazi) |
| `Super+B` | Browser (librewolf) |
| `Super+C` | Messaging (signal-desktop) |
| `Super+A` | Audio device control (pavucontrol) |
| `Super+N` | Notification panel (swaync) |
| `Super+M` | Session exit menu (hyprshutdown) |
| `Alt+Space` | App launcher (rofi) |
| `Alt+C` | Calculator (rofi) |

## Theme

[Tokyo Night](https://github.com/folke/tokyonight.nvim) across all components.
Font: [Hack Nerd Font Mono](https://github.com/ryanoasis/nerd-fonts).

## Notes

Setup runbook for Bluetooth keyboard, ProtonVPN, and handy commands lives in
[NOTES.md](NOTES.md).
