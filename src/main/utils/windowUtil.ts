function isTilingWindowManager() {
  if (process.platform === 'darwin') {
    return false
  }

  if (process.platform !== 'linux') {
    return true
  }

  const desktopEnv = process.env.XDG_CURRENT_DESKTOP?.toLowerCase()
  const tilingSystems = ['hyprland', 'i3', 'sway', 'bspwm', 'dwm', 'awesome', 'qtile', 'herbstluftwm', 'xmonad']

  return tilingSystems.some((system) => desktopEnv?.includes(system))
}

export { isTilingWindowManager }
