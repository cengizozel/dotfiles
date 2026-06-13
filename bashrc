#
# ~/.bashrc
#

# If not running interactively, don't do anything
[[ $- != *i* ]] && return

alias ls='ls --color=auto'
alias grep='grep --color=auto'
PS1='[\u@\h \W]\$ '
export PATH="$HOME/.local/bin:$PATH"

alias ollama='docker exec -it ollama ollama'
alias pv='protonvpn'
alias pvse='protonvpn connect --country SE'
alias pvdc='protonvpn disconnect'

fastfetch

# pnpm
export PNPM_HOME="/home/cengiz/.local/share/pnpm"
case ":$PATH:" in
  *":$PNPM_HOME:"*) ;;
  *) export PATH="$PNPM_HOME:$PATH" ;;
esac
# pnpm end
