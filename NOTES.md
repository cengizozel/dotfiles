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

## Keyring unlock at login

gnome-keyring holds app secrets (Chromium, Signal, Anytype, Nextcloud client).
Without PAM integration, greetd logins leave it locked and apps prompt for the
keyring password on first use. Fix is two lines in `/etc/pam.d/greetd`:

```
auth       optional     pam_gnome_keyring.so
session    optional     pam_gnome_keyring.so auto_start
```

The auth line goes after the system-local-login include in the auth block, the
session line at the end. Secrets must live in the keyring named "login" (the
only one PAM unlocks) and its password must match the login password. If the
login password ever changes via passwd, the keyring password does not follow
and must be updated to match, or the prompts return.

## Useful commands

```bash
# See recently installed packages
grep "installed" /var/log/pacman.log | tail -50
```
