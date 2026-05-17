export const APP_DISPLAY_NAME = 'LidoPro'

export const businessConfig = {
  daily: {
    startLabel: '09:00',
    endLabel: 'chiusura',
  },
  season: {
    startMonth: 6,
    startDay: 1,
    endMonth: 9,
    endDay: 30,
  },
} as const

export const appConfig = {
  name: 'LidoPro',
  appId: 'it.lidopro.app',
  webDir: 'dist',
} as const
