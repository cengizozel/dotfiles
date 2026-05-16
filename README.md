# iusearchbtw

My Arch Linux dotfiles.

## Fresh Install

Run this on a base Arch install with `sudo` configured:

```bash
bash <(curl -s https://raw.githubusercontent.com/cengizozel/iusearchbtw/main/install.sh)
```

This will:
1. Install `yay` (AUR helper)
2. Install all packages (skips any already installed)
3. Clone this repo to `~/dotfiles`
4. Symlink configs to the right places
5. Enable NetworkManager and SDDM

Reboot after it finishes.

## Updating configs

Since configs are symlinked from `~/dotfiles`, just pull to get the latest:

```bash
cd ~/dotfiles && git pull
```

## Contents

| Repo path | System path |
|-----------|-------------|
| `hypr/hyprland.conf` | `~/.config/hypr/hyprland.conf` |
| `hypr/hyprpaper.conf` | `~/.config/hypr/hyprpaper.conf` |
| `hypr/scripts/` | `~/.config/hypr/scripts/` |
| `waybar/config.jsonc` | `~/.config/waybar/config.jsonc` |
| `waybar/style.css` | `~/.config/waybar/style.css` |
| `kitty/kitty.conf` | `~/.config/kitty/kitty.conf` |
| `nvim/` | `~/.config/nvim/` |
| `claude/settings.json` | `~/.claude/settings.json` |
| `wallpapers/` | `~/Pictures/wallpapers/` |
| `install.sh` | — bootstrap script for fresh installs |

## Theme

[Tokyo Night](https://github.com/folke/tokyonight.nvim) across all components. Font: [Hack Nerd Font Mono](https://github.com/ryanoasis/nerd-fonts).

## Tools

| Tool | Purpose |
|------|---------|
| `hyprlauncher` | App launcher (`Super`) |
| `hyprpaper` | Wallpaper daemon |
| `hyprshutdown` | Session exit menu |
| `waybar` | Status bar (floating islands) |
| `kitty` | Terminal (`Super+T`) |
| `pavucontrol` | Audio device control (`Super+A`) |
| `noisetorch` | Microphone noise suppression |
| `dolphin` | File manager (`Super+E`) |
| `librewolf` | Browser (`Super+B`) |
