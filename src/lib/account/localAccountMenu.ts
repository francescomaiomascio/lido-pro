import { DEFAULT_WORKSPACE_NAME } from '../config/appConfig'

export type LocalAccountMenuSection = {
  title: string
  items: LocalAccountMenuItem[]
}

export type LocalAccountMenuItem = {
  id: string
  label: string
  description: string
  status?: string
  disabled?: boolean
  action?: 'system'
}

export const localAccountMenuSections: LocalAccountMenuSection[] = [
  {
    title: 'Account e workspace',
    items: [
      {
        id: 'local-account',
        label: 'Account locale',
        description: 'Profilo operativo locale, senza provider connesso.',
        status: 'locale',
        action: 'system',
      },
      {
        id: 'workspace',
        label: 'Lido / workspace',
        description: 'Workspace corrente e dati dello stabilimento.',
        status: DEFAULT_WORKSPACE_NAME,
        action: 'system',
      },
    ],
  },
  {
    title: 'Dati e sicurezza',
    items: [
      {
        id: 'local-data',
        label: 'Dati locali',
        description: 'Persistenza, database locale e stato runtime.',
        action: 'system',
      },
      {
        id: 'backup',
        label: 'Backup',
        description: 'Politica backup locale e sicurezza operativa.',
        status: 'da configurare',
        action: 'system',
      },
    ],
  },
  {
    title: 'Integrazioni previste',
    items: [
      {
        id: 'providers',
        label: 'Accesso e provider',
        description: 'Google/Apple non configurati in questa build.',
        status: 'previsto',
        disabled: true,
      },
      {
        id: 'integrations',
        label: 'Integrazioni',
        description: 'Cloud, sync e portale clienti non sono attivi.',
        status: 'non attivo',
        disabled: true,
      },
    ],
  },
  {
    title: 'Sistema',
    items: [
      {
        id: 'settings',
        label: 'Impostazioni',
        description: 'Interfaccia, applicazione, diagnostica e backup.',
        action: 'system',
      },
      {
        id: 'about',
        label: 'Informazioni app',
        description: 'Versione locale e confine prodotto.',
        action: 'system',
      },
    ],
  },
]
