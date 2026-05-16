export type AppTheme = 'neutral' | 'dark'

export const appThemes: AppTheme[] = ['neutral', 'dark']

export const getNextTheme = (theme: AppTheme): AppTheme => (theme === 'neutral' ? 'dark' : 'neutral')

export const getThemeLabel = (theme: AppTheme): string => (theme === 'neutral' ? 'Neutro' : 'Scuro')
