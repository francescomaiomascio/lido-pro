export const APP_DISPLAY_NAME = 'Spiaggia BDF'

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
  name: 'Beach BDF',
  appId: 'it.beachbdf.app',
  webDir: 'dist',
} as const
