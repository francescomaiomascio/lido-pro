export type LidoProModuleId =
  | 'dashboard'
  | 'clients'
  | 'registry'
  | 'priceList'
  | 'activeLayout'
  | 'studioProjects'
  | 'system'

export type LidoProPrimaryModuleId = Exclude<LidoProModuleId, 'system'>

export type LidoProModule = {
  id: LidoProModuleId
  label: string
  shortLabel: string
  description: string
}

export type LidoProTopbarItem =
  | (LidoProModule & { id: LidoProPrimaryModuleId; disabled?: false })
  | {
      id: 'bar'
      label: string
      shortLabel: string
      description: string
      disabled: true
      disabledReason: string
    }

export const lidoproPrimaryModules: Array<LidoProModule & { id: LidoProPrimaryModuleId }> = [
  {
    id: 'dashboard',
    label: 'Home',
    shortLabel: 'Home',
    description: 'Stato operativo e accesso ai workspace principali.',
  },
  {
    id: 'clients',
    label: 'Clienti',
    shortLabel: 'Clienti',
    description: 'Anagrafiche, profili e assegnazioni cliente.',
  },
  {
    id: 'registry',
    label: 'Registro',
    shortLabel: 'Registro',
    description: 'Attivita, prenotazioni e saldi operativi.',
  },
  {
    id: 'priceList',
    label: 'Listino',
    shortLabel: 'Listino',
    description: 'Tariffe, catalogo, dotazioni e articoli collegati ai conti.',
  },
  {
    id: 'activeLayout',
    label: 'Spiaggia',
    shortLabel: 'Spiaggia',
    description: 'Spiaggia operativa protetta usata durante il lavoro quotidiano.',
  },
  {
    id: 'studioProjects',
    label: 'Studio',
    shortLabel: 'Studio',
    description: 'Bozze, sketch, verifica e pubblicazione controllata.',
  },
]

export const lidoproUtilityModules: LidoProModule[] = [
  {
    id: 'system',
    label: 'Sistema',
    shortLabel: 'Sistema',
    description: 'Preferenze locali, diagnostica e stato applicazione.',
  },
]

export const lidoproModules: LidoProModule[] = [
  ...lidoproPrimaryModules,
  ...lidoproUtilityModules,
]

export const lidoproTopbarItems: LidoProTopbarItem[] = [
  {
    id: 'dashboard',
    label: 'Home',
    shortLabel: 'Home',
    description: 'Console operativa del lido.',
  },
  {
    id: 'activeLayout',
    label: 'Spiaggia',
    shortLabel: 'Spiaggia',
    description: 'Spiaggia operativa protetta usata durante il lavoro quotidiano.',
  },
  {
    id: 'bar',
    label: 'Bar',
    shortLabel: 'Bar',
    description: 'Ordini, servizi e delivery spiaggia. Modulo previsto, non attivo.',
    disabled: true,
    disabledReason: 'Modulo Bar previsto, non configurato in questa build.',
  },
  {
    id: 'clients',
    label: 'Clienti',
    shortLabel: 'Clienti',
    description: 'Anagrafiche, profili e assegnazioni cliente.',
  },
  {
    id: 'registry',
    label: 'Registro',
    shortLabel: 'Registro',
    description: 'Attivita, prenotazioni e saldi operativi.',
  },
  {
    id: 'priceList',
    label: 'Listino',
    shortLabel: 'Listino',
    description: 'Tariffe, catalogo, dotazioni e articoli collegati ai conti.',
  },
  {
    id: 'studioProjects',
    label: 'Studio',
    shortLabel: 'Studio',
    description: 'Bozze, sketch, verifica e pubblicazione controllata.',
  },
]

export const getLidoProModule = (id: LidoProModuleId) =>
  lidoproModules.find((module) => module.id === id) ?? lidoproModules[0]
