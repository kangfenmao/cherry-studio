export const DEFAULT_TEMPERATURE = 0.7
export const DEFAULT_CONEXTCOUNT = 5
export const platform = window.electron?.process?.platform === 'darwin' ? 'macos' : 'windows'
export const isMac = platform === 'macos'
export const isWindows = platform === 'windows'
