import { appThemes, getNextTheme, type AppTheme } from './themeTokens'

const storageKey = 'lido-pro-theme'

export const loadInitialTheme = (): AppTheme => {
  if (typeof localStorage === 'undefined') {
    return 'neutral'
  }

  const stored = localStorage.getItem(storageKey)
  return appThemes.includes(stored as AppTheme) ? (stored as AppTheme) : 'neutral'
}

export const saveTheme = (theme: AppTheme) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, theme)
  }
}

export const setTheme = (theme: AppTheme): AppTheme => {
  saveTheme(theme)
  return theme
}

export const toggleTheme = (theme: AppTheme): AppTheme => {
  const nextTheme = getNextTheme(theme)
  saveTheme(nextTheme)
  return nextTheme
}
