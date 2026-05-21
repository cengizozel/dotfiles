# iusearchbtw

My Arch Linux dotfiles.

## Note on non-Arch configs

`aerospace.toml` is the config for [AeroSpace](https://github.com/nikitabobko/AeroSpace), a tiling window manager for macOS. It's stored here to keep all my dotfiles in one place.

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
| `waybar/modules.jsonc` | `~/.config/waybar/modules.jsonc` |
| `waybar/style.css` | `~/.config/waybar/style.css` |
| `waybar/scripts/` | `~/.config/waybar/scripts/` |
| `waybar/layouts/` | `~/.config/waybar/layouts/` |
| `waybar/colors/` | `~/.config/waybar/colors/` |
| `waybar/context/` | `~/.config/waybar/context/` |
| `swaync/config.json` | `~/.config/swaync/config.json` |
| `swaync/style.css` | `~/.config/swaync/style.css` |
| `kitty/kitty.conf` | `~/.config/kitty/kitty.conf` |
| `nvim/` | `~/.config/nvim/` |
| `bashrc` | `~/.bashrc` |
| `rofi/` | `~/.config/rofi/` |
| `bin/rofi-click-away` | `~/.local/bin/rofi-click-away` |
| `wallpapers/` | `~/Pictures/wallpapers/` |
| `librewolf/userChrome.css` | `~/.config/librewolf/librewolf/<profile>/chrome/userChrome.css` |
| `librewolf/sidebery-data.json` | Sidebery backup — restore via Sidebery Settings → Import |
| `install.sh` | — bootstrap script for fresh installs |
| `aerospace.toml` | `~/.config/aerospace/aerospace.toml` (macOS) |

## Apple Magic Keyboard (Bluetooth)

Pair via `bluetoothctl`:

```bash
sudo systemctl enable --now bluetooth
bluetoothctl
# inside bluetoothctl:
power on
agent on
scan on
trust <MAC>
pair <MAC>
connect <MAC>
```

Fix modifier key layout (swap Option ↔ Command to match PC keyboard positions):

```bash
# Apply immediately
echo 1 | sudo tee /sys/module/hid_apple/parameters/swap_opt_cmd

# Make permanent
echo "options hid_apple swap_opt_cmd=1" | sudo tee /etc/modprobe.d/hid_apple.conf
```

## Useful Commands

```bash
# See recently installed packages
grep "installed" /var/log/pacman.log | tail -50
```

## ProtonVPN

The daemon runs as a systemd service (`proton-vpn-daemon`). Use the CLI after signing in once:

```bash
protonvpn signin              # sign in with Proton account
protonvpn connect             # connect to fastest server
protonvpn connect --country US  # connect to specific country
protonvpn disconnect
protonvpn status
protonvpn servers             # list available servers
```

## Theme

[Tokyo Night](https://github.com/folke/tokyonight.nvim) across all components. Font: [Hack Nerd Font Mono](https://github.com/ryanoasis/nerd-fonts).

## Tools

| Tool | Purpose |
|------|---------|
| `hyprlauncher` | App launcher (`Super`) |
| `hyprpaper` | Wallpaper daemon |
| `hyprshutdown` | Session exit menu |
| `waybar` | Status bar (floating islands) |
| `swaync` | Notification daemon + panel |
| `kitty` | Terminal (`Super+T`) |
| `pavucontrol` | Audio device control (`Super+A`) |
| `noisetorch` | Microphone noise suppression |
| `yazi` | File manager (`Super+E`) |
| `librewolf` | Browser (`Super+B`) |
| `discord` | Chat / voice |
| `signal-desktop` | Encrypted messaging (`Super+C`) |
| `flatpak` | Sandboxed app runtime |
| `ollama` | Local LLM runner (CUDA) |
| `proton-vpn-cli` | ProtonVPN CLI (`protonvpn`) |
| `vscodium` | Code editor |
