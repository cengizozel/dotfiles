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

- `hypr/` — Hyprland window manager configuration and scripts
- `nvim/` — Neovim configuration (LazyVim)
- `claude/` — Claude Code settings
- `install.sh` — Bootstrap script for fresh installs
