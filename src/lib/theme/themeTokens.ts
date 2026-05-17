export type AppTheme = 'neutral' | 'graphite' | 'dune' | 'dark'

export const appThemes: AppTheme[] = ['neutral', 'graphite', 'dune', 'dark']

export const getNextTheme = (theme: AppTheme): AppTheme => {
  const index = appThemes.indexOf(theme)
  return appThemes[(index + 1) % appThemes.length] ?? 'neutral'
}

export const getThemeLabel = (theme: AppTheme): string =>
  ({
    neutral: 'Executive',
    graphite: 'Grafite',
    dune: 'Duna',
    dark: 'Notte',
  })[theme]
