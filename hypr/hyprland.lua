-- Migrated from hyprland.conf (hyprlang support is removed in Hyprland 0.57)

require("monitors")

-- Re-apply remembered HDMI monitor off state (set by toggle-hdmi-monitor.sh).
-- Runs on every config load, so the state survives reloads too.
local state_file = io.open(os.getenv("HOME") .. "/.config/hypr/hdmi-monitor.state", "r")
if state_file then
    local state = state_file:read("*l")
    state_file:close()
    if state == "off" then
        hl.monitor({ output = "HDMI-A-1", disabled = true })
    end
end

hl.on("hyprland.start", function()
    hl.exec_cmd("blueman-applet")
    -- waybar, swaync, and hyprpaper run as systemd user services, pulled in by
    -- graphical-session.target via hyprland-session.target below
    hl.exec_cmd("dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP HYPRLAND_INSTANCE_SIGNATURE && systemctl --user start hyprland-session.target")
    hl.dispatch(hl.dsp.focus({ workspace = 5 }))
    hl.exec_cmd("kitty", { workspace = "5" })
    hl.exec_cmd([[sleep 1 && hyprctl dispatch 'hl.dsp.focus({ window = "class:kitty" })']])
    hl.exec_cmd("mkdir -p ~/Pictures/Screenshots")
end)

hl.env("QT_QPA_PLATFORMTHEME", "qt6ct")

local mainMod = "SUPER"
local terminal = "kitty"
local fileManager = "kitty yazi"
local menu = "rofi -show drun"
local browser = "librewolf"

hl.bind(mainMod .. " + T", hl.dsp.exec_cmd(terminal))
hl.bind(mainMod .. " + A", hl.dsp.exec_cmd("pavucontrol"))
hl.bind(mainMod .. " + B", hl.dsp.exec_cmd(browser))
hl.bind(mainMod .. " + C", hl.dsp.exec_cmd("signal-desktop --disable-accelerated-video-decode"))
hl.bind(mainMod .. " + D", hl.dsp.exec_cmd([[kitty --title kitty-cal -e bash -c "cal $(date +%Y); read"]]))
hl.bind(mainMod .. " + Q", hl.dsp.window.close())
hl.bind(mainMod .. " + M", hl.dsp.exec_cmd("~/.config/hypr/scripts/logout-confirm.sh"))
hl.bind(mainMod .. " + P", hl.dsp.exec_cmd("~/.config/hypr/scripts/toggle-hdmi-monitor.sh"))
hl.bind(mainMod .. " + SHIFT + Escape", hl.dsp.exec_cmd("systemctl poweroff"))
hl.bind(mainMod .. " + E", hl.dsp.exec_cmd(fileManager))
hl.bind(mainMod .. " + V", hl.dsp.window.float())
hl.bind(mainMod .. " + F", hl.dsp.window.fullscreen({ mode = "fullscreen" }))
hl.bind(mainMod .. " + grave", hl.dsp.exec_cmd("hyprctl reload"))
hl.bind("ALT + space", hl.dsp.exec_cmd(menu))
hl.bind("ALT + c", hl.dsp.exec_cmd([[rofi -show calc -modi calc -no-show-match -no-sort -no-history -theme ~/.config/rofi/calc.rasi -calc-command "echo -n '{result}' | wl-copy"]]))

hl.bind("ALT + Tab", hl.dsp.focus({ last = true }))

hl.bind(mainMod .. " + H", hl.dsp.focus({ direction = "l" }))
hl.bind(mainMod .. " + L", hl.dsp.focus({ direction = "r" }))
hl.bind(mainMod .. " + K", hl.dsp.focus({ direction = "u" }))
hl.bind(mainMod .. " + J", hl.dsp.focus({ direction = "d" }))

hl.bind(mainMod .. " + SHIFT + H", hl.dsp.window.move({ direction = "l" }))
hl.bind(mainMod .. " + SHIFT + L", hl.dsp.window.move({ direction = "r" }))
hl.bind(mainMod .. " + SHIFT + K", hl.dsp.window.move({ direction = "u" }))
hl.bind(mainMod .. " + SHIFT + J", hl.dsp.window.move({ direction = "d" }))

hl.bind(mainMod .. " + mouse:272", hl.dsp.window.drag(), { mouse = true })
hl.bind(mainMod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true })

hl.bind(mainMod .. " + minus", hl.dsp.exec_cmd("~/.config/hypr/scripts/dwindle-smart-resize shrink horiz"))
hl.bind(mainMod .. " + equal", hl.dsp.exec_cmd("~/.config/hypr/scripts/dwindle-smart-resize grow horiz"))
hl.bind(mainMod .. " + SHIFT + minus", hl.dsp.exec_cmd("~/.config/hypr/scripts/dwindle-smart-resize shrink vert"))
hl.bind(mainMod .. " + SHIFT + equal", hl.dsp.exec_cmd("~/.config/hypr/scripts/dwindle-smart-resize grow vert"))
hl.bind(mainMod .. " + O", hl.dsp.layout("togglesplit"))

hl.bind(mainMod .. " + S", hl.dsp.exec_cmd("~/.config/hypr/scripts/swap-enter.sh"))

hl.define_submap("swapmode", function()
    hl.bind("H", hl.dsp.focus({ direction = "l" }))
    hl.bind("L", hl.dsp.focus({ direction = "r" }))
    hl.bind("K", hl.dsp.focus({ direction = "u" }))
    hl.bind("J", hl.dsp.focus({ direction = "d" }))
    hl.bind("return", hl.dsp.exec_cmd("~/.config/hypr/scripts/swap-do.sh"))
    hl.bind("escape", hl.dsp.exec_cmd("~/.config/hypr/scripts/swap-cancel.sh"))
end)

for i = 1, 9 do
    hl.bind(mainMod .. " + " .. i, hl.dsp.focus({ workspace = i }))
    hl.bind(mainMod .. " + SHIFT + " .. i, hl.dsp.window.move({ workspace = i, follow = false }))
end

-- Send current workspace to the other monitor
hl.bind(mainMod .. " + SHIFT + comma", hl.dsp.workspace.move({ monitor = "+1" }))

-- Screenshots
hl.bind(mainMod .. " + SHIFT + S", hl.dsp.exec_cmd([[sh -c 'REGION=$(slurp) || exit; grim -g "$REGION" - | wl-copy && notify-send "Screenshot copied" -t 1000']]))
hl.bind(mainMod .. " + SHIFT + F", hl.dsp.exec_cmd([[grim - | wl-copy && notify-send "Screenshot copied" -t 1000]]))
hl.bind(mainMod .. " + SHIFT + G", hl.dsp.exec_cmd([[sh -c 'REGION=$(slurp) || exit; grim -g "$REGION" ~/Pictures/Screenshots/Screenshot-$(date +%F_%T).png && notify-send "Screenshot saved" -t 1000']]))
hl.bind(mainMod .. " + G", hl.dsp.exec_cmd([[sh -c 'grim ~/Pictures/Screenshots/Screenshot-$(date +%F_%T).png && notify-send "Screenshot saved" -t 1000']]))

-- Clear all notifications and close the panel if open
hl.bind(mainMod .. " + BackSpace", hl.dsp.exec_cmd("swaync-client -C -cp"))
hl.bind(mainMod .. " + N", hl.dsp.exec_cmd("swaync-client -t -sw"))
hl.bind(mainMod .. " + SHIFT + N", hl.dsp.exec_cmd("swaync-client -d"))

hl.config({
    general = {
        border_size = 3,
        col = {
            active_border = "rgb(7aa2f7)",
            inactive_border = "rgb(292e42)",
        },
        gaps_in = 4,
        gaps_out = 6,
    },
    dwindle = {
        preserve_split = true,
        force_split = 2,
    },
    decoration = {
        rounding = 8,
    },
    animations = {
        enabled = false,
    },
    input = {
        follow_mouse = 2,
        float_switch_override_focus = 0,
        numlock_by_default = true,
    },
})

hl.window_rule({ match = { title = "^Friends List$" }, float = true })
-- Steam launches via a bootstrap/splash that ignores per-exec workspace rules,
-- so pin its main window to workspace 8 wherever/whenever it starts.
hl.window_rule({ match = { class = "^steam$" }, workspace = "8 silent" })
-- Anytype (flatpak) launches through a bootstrap that likewise ignores the
-- per-exec rule, so pin it to workspace 9.
hl.window_rule({ match = { class = "^anytype$" }, workspace = "9 silent" })
-- Screen share picker (xdg-desktop-portal-hyprland) must appear on the current
-- workspace, floating, or it opens as a tile elsewhere and capture waits forever.
hl.window_rule({ match = { class = "^hyprland-share-picker$" }, float = true, center = true })

hl.bind("mouse:272", hl.dsp.exec_cmd("~/.local/bin/rofi-click-away"), { non_consuming = true })
hl.bind("mouse:273", hl.dsp.exec_cmd("~/.local/bin/rofi-click-away"), { non_consuming = true })
hl.bind("mouse:274", hl.dsp.exec_cmd("~/.local/bin/rofi-click-away"), { non_consuming = true })

hl.bind("XF86AudioRaiseVolume", hl.dsp.exec_cmd("wpctl set-volume -l 1 @DEFAULT_AUDIO_SINK@ 5%+ && touch /tmp/waybar-vol-changed && kill -42 $(pidof waybar)"), { locked = true, repeating = true })
hl.bind("XF86AudioLowerVolume", hl.dsp.exec_cmd("wpctl set-volume @DEFAULT_AUDIO_SINK@ 5%- && touch /tmp/waybar-vol-changed && kill -42 $(pidof waybar)"), { locked = true, repeating = true })
hl.bind("XF86AudioMute", hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SINK@ toggle && touch /tmp/waybar-vol-changed && kill -42 $(pidof waybar)"), { locked = true })
hl.bind("XF86AudioMicMute", hl.dsp.exec_cmd("wpctl set-mute @DEFAULT_AUDIO_SOURCE@ toggle"), { locked = true })
