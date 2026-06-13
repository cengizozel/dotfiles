# Notes

Personal setup runbook. Not required to use the configs.

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

Fix modifier key layout (swap Option and Command to match PC keyboard positions):

```bash
# Apply immediately
echo 1 | sudo tee /sys/module/hid_apple/parameters/swap_opt_cmd

# Make permanent
echo "options hid_apple swap_opt_cmd=1" | sudo tee /etc/modprobe.d/hid_apple.conf
```

## ProtonVPN

The daemon runs as a systemd service (`proton-vpn-daemon`). Use the CLI after
signing in once:

```bash
protonvpn signin                # sign in with Proton account
protonvpn connect               # connect to fastest server
protonvpn connect --country US  # connect to specific country
protonvpn disconnect
protonvpn status
protonvpn servers               # list available servers
```

## Useful commands

```bash
# See recently installed packages
grep "installed" /var/log/pacman.log | tail -50
```
