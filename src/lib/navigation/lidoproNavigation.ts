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
    label: 'Layout',
    shortLabel: 'Layout',
    description: 'Mappa operativa protetta usata durante il lavoro quotidiano.',
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

export const getLidoProModule = (id: LidoProModuleId) =>
  lidoproModules.find((module) => module.id === id) ?? lidoproModules[0]
