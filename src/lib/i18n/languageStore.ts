export type AppLanguage = 'it' | 'en' | 'es' | 'fr'

const storageKey = 'lido-pro-language'

export const appLanguages: AppLanguage[] = ['it', 'en', 'es', 'fr']

export const languageLabels: Record<AppLanguage, string> = {
  it: 'Italiano',
  en: 'English',
  es: 'Español',
  fr: 'Français',
}

type Dictionary = {
  subtitle: string
  map: string
  list: string
  filters: string
  searchPlaceholder: string
  settingsTitle: string
  management: string
  beach: string
  system: string
  customers: string
  tariffs: string
  extras: string
  language: string
  theme: string
  diagnostics: string
  version: string
}

const dictionaries: Record<AppLanguage, Dictionary> = {
  it: {
    subtitle: 'Gestione spiaggia',
    map: 'Mappa',
    list: 'Lista',
    filters: 'Filtri',
    searchPlaceholder: 'Cerca posto, cliente, stato',
    settingsTitle: 'Impostazioni',
    management: 'Gestione',
    beach: 'Spiaggia',
    system: 'Sistema',
    customers: 'Clienti',
    tariffs: 'Tariffe',
    extras: 'Extra',
    language: 'Lingua',
    theme: 'Tema',
    diagnostics: 'Diagnostica',
    version: 'Versione app',
  },
  en: {
    subtitle: 'Beach operations',
    map: 'Map',
    list: 'List',
    filters: 'Filters',
    searchPlaceholder: 'Search place, customer, status',
    settingsTitle: 'Settings',
    management: 'Management',
    beach: 'Beach',
    system: 'System',
    customers: 'Customers',
    tariffs: 'Tariffs',
    extras: 'Extras',
    language: 'Language',
    theme: 'Theme',
    diagnostics: 'Diagnostics',
    version: 'App version',
  },
  es: {
    subtitle: 'Gestión de playa',
    map: 'Mapa',
    list: 'Lista',
    filters: 'Filtros',
    searchPlaceholder: 'Buscar puesto, cliente, estado',
    settingsTitle: 'Ajustes',
    management: 'Gestión',
    beach: 'Playa',
    system: 'Sistema',
    customers: 'Clientes',
    tariffs: 'Tarifas',
    extras: 'Extras',
    language: 'Idioma',
    theme: 'Tema',
    diagnostics: 'Diagnóstico',
    version: 'Versión de la app',
  },
  fr: {
    subtitle: 'Gestion plage',
    map: 'Carte',
    list: 'Liste',
    filters: 'Filtres',
    searchPlaceholder: 'Rechercher place, client, état',
    settingsTitle: 'Réglages',
    management: 'Gestion',
    beach: 'Plage',
    system: 'Système',
    customers: 'Clients',
    tariffs: 'Tarifs',
    extras: 'Extras',
    language: 'Langue',
    theme: 'Thème',
    diagnostics: 'Diagnostic',
    version: "Version de l'app",
  },
}

export const loadInitialLanguage = (): AppLanguage => {
  if (typeof localStorage === 'undefined') {
    return 'it'
  }

  const stored = localStorage.getItem(storageKey)
  return stored && stored in dictionaries ? (stored as AppLanguage) : 'it'
}

export const saveLanguage = (language: AppLanguage) => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem(storageKey, language)
  }
}

export const setLanguage = (language: AppLanguage): AppLanguage => {
  saveLanguage(language)
  return language
}

export const getLanguageLabels = (language: AppLanguage): Dictionary => dictionaries[language]
