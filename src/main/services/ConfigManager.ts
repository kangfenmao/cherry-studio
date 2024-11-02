import Store from 'electron-store'

export class ConfigManager {
  private store: Store

  constructor() {
    this.store = new Store()
  }

  getTheme(): 'light' | 'dark' {
    return this.store.get('theme', 'light') as 'light' | 'dark'
  }

  setTheme(theme: 'light' | 'dark') {
    this.store.set('theme', theme)
  }
}

export const configManager = new ConfigManager()
