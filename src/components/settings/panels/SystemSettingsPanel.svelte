<script lang="ts">
  import { APP_DISPLAY_NAME, DEFAULT_WORKSPACE_NAME, appConfig } from '../../../lib/config/appConfig'
  import { resetBrowserDatabaseForDevelopmentOnly } from '../../../lib/db/beachRepository'
  import { DATABASE_NAME, SCHEMA_VERSION } from '../../../lib/db/schema'
  import {
    appLanguages,
    languageLabels,
    type AppLanguage,
  } from '../../../lib/i18n/languageStore'
  import { getRuntimeTarget, getRuntimeTargetLabel } from '../../../lib/platform/runtimeTarget'
  import { appThemes, getThemeLabel, type AppTheme } from '../../../lib/theme/themeTokens'
  import type { BeachLayout } from '../../../lib/types/beach'
  import type { DatabaseRuntime } from '../../../lib/types/db'
  import ActionActivity from '../../loading/ActionActivity.svelte'
  import LocalDatabaseInspector from '../dev/LocalDatabaseInspector.svelte'

  let {
    language,
    theme,
    layout,
    itemCount,
    runtime,
    runtimeLabel,
    onLanguageChange,
    onThemeChange,
  }: {
    language: AppLanguage
    theme: AppTheme
    layout: BeachLayout | null
    itemCount: number
    runtime: DatabaseRuntime | null
    runtimeLabel: string
    onLanguageChange: (language: AppLanguage) => void
    onThemeChange: (theme: AppTheme) => void
  } = $props()

  type SystemSection =
    | 'general'
    | 'account'
    | 'providers'
    | 'interface'
    | 'local-data'
    | 'backup'
    | 'diagnostics'
    | 'database-inspector'
    | 'application'

  type SystemRow = {
    label: string
    value: string
    note?: string
    tone?: 'muted' | 'warning'
  }

  type SystemSectionMeta = {
    id: SystemSection
    label: string
    description: string
  }

  type SystemContextFact = {
    label: string
    value: string
    tone?: 'ok' | 'muted' | 'warning'
  }

  type SystemContext = {
    eyebrow: string
    title: string
    summary: string
    facts: SystemContextFact[]
    note: string
  }

  let activeSection: SystemSection = $state('general')
  let mobileSectionOpen = $state(false)
  let resetError: string | null = $state(null)
  let resetInProgress = $state(false)

  const sections: SystemSectionMeta[] = [
    { id: 'general', label: 'Generale', description: 'Prodotto, workspace e runtime corrente.' },
    { id: 'account', label: 'Account e workspace', description: 'Profilo locale e contesto lido.' },
    { id: 'providers', label: 'Provider e integrazioni', description: 'Accessi, cloud e integrazioni non attive.' },
    { id: 'interface', label: 'Interfaccia', description: 'Lingua, tema e preferenze UI.' },
    { id: 'local-data', label: 'Dati locali', description: 'Database, schema e storage locale.' },
    { id: 'backup', label: 'Backup e sicurezza', description: 'Backup, export e azioni protette.' },
    { id: 'diagnostics', label: 'Diagnostica', description: 'Stato tecnico della sessione.' },
    ...(import.meta.env.DEV
      ? [
          {
            id: 'database-inspector' as const,
            label: 'Database locale',
            description: 'Inspector temporaneo di sviluppo.',
          },
        ]
      : []),
    { id: 'application', label: 'Applicazione', description: 'Package, versione e canale.' },
  ]

  const runtimeTarget = $derived(getRuntimeTarget())
  const runtimeTargetLabel = $derived(getRuntimeTargetLabel(runtimeTarget))
  const persistenceLabel = $derived(
    runtime === 'browser-memory-fallback'
      ? 'Memoria temporanea'
      : runtime === 'web-persistent-sqlite'
        ? 'Web SQLite persistente'
        : runtime === 'native-sqlite'
          ? 'SQLite nativo'
          : 'Non disponibile',
  )
  const webStoreLabel = $derived(
    runtime === 'web-persistent-sqlite' ? 'Sì' : runtime === 'browser-memory-fallback' ? 'No' : 'N/D',
  )
  const layoutSizeLabel = $derived(layout ? `${layout.widthM}m x ${layout.depthM}m` : 'Non disponibile')
  const activeLayoutLabel = $derived(
    layout ? `${layout.widthM}m x ${layout.depthM}m · ${itemCount} elementi` : `${itemCount} elementi`,
  )
  const resetAvailable = $derived(import.meta.env.DEV && runtime !== 'native-sqlite')
  const activeSectionMeta = $derived(sections.find((section) => section.id === activeSection) ?? sections[0])

  const generalRows = $derived<SystemRow[]>([
    { label: 'Prodotto', value: APP_DISPLAY_NAME },
    { label: 'Workspace', value: DEFAULT_WORKSPACE_NAME },
    { label: 'Modalità', value: 'Locale' },
    { label: 'Runtime', value: runtimeTargetLabel },
    { label: 'Persistenza', value: persistenceLabel },
    { label: 'Layout attivo', value: activeLayoutLabel },
  ])

  const accountRows: SystemRow[] = [
    { label: 'Account locale', value: 'Profilo operativo locale', note: 'Nessun account cloud collegato.' },
    { label: 'Workspace', value: DEFAULT_WORKSPACE_NAME, note: 'Contesto lido locale.' },
    { label: 'Ruolo', value: 'Operatore locale', note: 'Ruoli multiutente non configurati.' },
    { label: 'Stato accesso', value: 'Accesso non configurato' },
    { label: 'Menu account', value: 'Gestito dalla topbar/avatar', note: 'Pronto per IA account futura.' },
  ]

  const providerRows: SystemRow[] = [
    { label: 'Google account', value: 'Non collegato' },
    { label: 'Apple account', value: 'Non collegato' },
    { label: 'Email', value: 'Non configurata' },
    { label: 'Cloud sync', value: 'Non attivo', note: 'Nessuna sincronizzazione live.' },
    { label: 'Portale clienti', value: 'Non rilasciato' },
  ]

  const localDataRows = $derived<SystemRow[]>([
    { label: 'Database', value: DATABASE_NAME },
    { label: 'Schema', value: `v${SCHEMA_VERSION}` },
    { label: 'Adapter', value: runtime ?? 'Non disponibile' },
    { label: 'Web store', value: webStoreLabel },
    { label: 'Elementi caricati', value: String(itemCount) },
    { label: 'Dimensioni layout', value: layoutSizeLabel },
    {
      label: 'Stato persistenza',
      value: persistenceLabel,
      tone: runtime === 'browser-memory-fallback' ? 'warning' : undefined,
      note: runtime === 'browser-memory-fallback' ? 'I dati possono essere persi al reload.' : undefined,
    },
  ])

  const backupRows: SystemRow[] = [
    { label: 'Backup operativo', value: 'Non configurato' },
    { label: 'Export locale', value: 'Non disponibile' },
    { label: 'Import backup', value: 'Non disponibile' },
    { label: 'Azioni protette', value: 'Protette', note: 'Le azioni distruttive sono isolate.' },
  ]

  const diagnosticsRows = $derived<SystemRow[]>([
    { label: 'Runtime', value: runtimeLabel },
    { label: 'Runtime target', value: runtimeTargetLabel },
    { label: 'Database', value: DATABASE_NAME },
    { label: 'Schema', value: `v${SCHEMA_VERSION}` },
    { label: 'Adapter', value: runtime ?? 'Non disponibile' },
    { label: 'Storage', value: persistenceLabel },
    { label: 'Canale', value: 'Locale' },
    { label: 'Stato cache', value: 'Locale' },
  ])

  const applicationRows: SystemRow[] = [
    { label: 'Nome prodotto', value: APP_DISPLAY_NAME },
    { label: 'Package Android', value: appConfig.appId },
    { label: 'Canale', value: 'Locale' },
    { label: 'Versione', value: '0.0.0' },
    { label: 'Build', value: 'Sviluppo locale' },
    { label: 'Database', value: DATABASE_NAME },
  ]

  const contexts = $derived<Record<SystemSection, SystemContext>>({
    general: {
      eyebrow: 'Stato locale',
      title: DEFAULT_WORKSPACE_NAME,
      summary: 'Ambiente operativo locale attivo per LidoPro.',
      facts: [
        { label: 'Runtime', value: runtimeTargetLabel, tone: 'ok' },
        { label: 'Persistenza', value: persistenceLabel, tone: runtime === 'browser-memory-fallback' ? 'warning' : 'ok' },
        { label: 'Layout', value: activeLayoutLabel },
      ],
      note: 'Questa schermata fotografa lo stato locale. Non modifica dati operativi, layout o conti.',
    },
    account: {
      eyebrow: 'Identità locale',
      title: 'Account e workspace',
      summary: 'Profilo locale pronto per una futura IA account/provider.',
      facts: [
        { label: 'Accesso', value: 'Non configurato', tone: 'muted' },
        { label: 'Ruolo', value: 'Operatore locale' },
        { label: 'Workspace', value: DEFAULT_WORKSPACE_NAME },
      ],
      note: 'Nessun login o account cloud reale è attivo in questa build.',
    },
    providers: {
      eyebrow: 'Provider',
      title: 'Integrazioni non attive',
      summary: 'Google, Apple, cloud sync e portale clienti restano confini futuri.',
      facts: [
        { label: 'Google', value: 'Non collegato', tone: 'muted' },
        { label: 'Cloud', value: 'Non attivo', tone: 'muted' },
        { label: 'Portale', value: 'Non rilasciato', tone: 'muted' },
      ],
      note: 'La UI documenta il confine architetturale senza simulare connessioni reali.',
    },
    interface: {
      eyebrow: 'Preferenze',
      title: 'Interfaccia locale',
      summary: 'Lingua, tema e densità della sessione.',
      facts: [
        { label: 'Lingua', value: languageLabels[language] },
        { label: 'Tema', value: getThemeLabel(theme) },
        { label: 'Densità', value: 'Normale' },
      ],
      note: 'Le preferenze sono locali e non implicano profilo cloud.',
    },
    'local-data': {
      eyebrow: 'Storage',
      title: DATABASE_NAME,
      summary: 'Persistenza, schema e dati caricati nel runtime corrente.',
      facts: [
        { label: 'Schema', value: `v${SCHEMA_VERSION}` },
        { label: 'Elementi', value: String(itemCount) },
        { label: 'Web store', value: webStoreLabel, tone: webStoreLabel === 'Sì' ? 'ok' : 'warning' },
      ],
      note: 'Non committare database locali, export o backup con dati reali.',
    },
    backup: {
      eyebrow: 'Protezione',
      title: 'Backup e sicurezza',
      summary: 'Azioni locali e zona pericolosa isolate.',
      facts: [
        { label: 'Backup', value: 'Non configurato', tone: 'muted' },
        { label: 'Export', value: 'Non disponibile', tone: 'muted' },
        { label: 'Reset dev', value: resetAvailable ? 'Disponibile' : 'Non disponibile', tone: resetAvailable ? 'warning' : 'muted' },
      ],
      note: 'Le azioni distruttive restano esplicite e separate dal flusso operativo.',
    },
    diagnostics: {
      eyebrow: 'Diagnostica',
      title: runtimeLabel,
      summary: 'Stato tecnico sintetico della sessione corrente.',
      facts: [
        { label: 'Target', value: runtimeTargetLabel },
        { label: 'Adapter', value: runtime ?? 'Non disponibile' },
        { label: 'Canale', value: 'Locale' },
      ],
      note: 'Diagnostica tecnica locale, non monitoraggio cloud.',
    },
    'database-inspector': {
      eyebrow: 'Dev read-only',
      title: 'Database locale',
      summary: 'Inspector temporaneo per leggere tabelle locali durante lo sviluppo.',
      facts: [
        { label: 'Modalità', value: 'Sola lettura', tone: 'warning' },
        { label: 'Adapter', value: runtime ?? 'Non disponibile' },
        { label: 'Schema', value: `v${SCHEMA_VERSION}` },
      ],
      note: 'Non espone SQL libero, reset, seed o azioni distruttive.',
    },
    application: {
      eyebrow: 'Applicazione',
      title: APP_DISPLAY_NAME,
      summary: 'Identità package e canale della build locale.',
      facts: [
        { label: 'Package', value: appConfig.appId },
        { label: 'Versione', value: '0.0.0' },
        { label: 'Build', value: 'Sviluppo locale' },
      ],
      note: 'La repository non distribuisce binari firmati o notarizzati.',
    },
  })
  const activeContext = $derived(contexts[activeSection])

  const selectSection = (section: SystemSection) => {
    activeSection = section
    mobileSectionOpen = true
  }

  const showSectionList = () => {
    mobileSectionOpen = false
  }

  const handleDevelopmentReset = async () => {
    resetError = null

    if (!resetAvailable) {
      resetError = 'Reset disponibile solo in browser/dev.'
      return
    }

    const confirmed = window.confirm(
      'Reset database browser di sviluppo: cancella clienti, assegnazioni, conti, pagamenti, tariffe ed extra locali. Continuare?',
    )
    if (!confirmed) {
      return
    }

    resetInProgress = true
    try {
      await resetBrowserDatabaseForDevelopmentOnly()
      window.location.reload()
    } catch (error) {
      resetError = error instanceof Error ? error.message : 'Reset non riuscito.'
    } finally {
      resetInProgress = false
    }
  }
</script>

{#snippet settingsRow(row: SystemRow)}
  <div class="native-system-row" class:warning={row.tone === 'warning'}>
    <div class="native-system-row__label">{row.label}</div>
    <div class="native-system-row__value">
      <strong>{row.value}</strong>
      {#if row.note}
        <span>{row.note}</span>
      {/if}
    </div>
  </div>
{/snippet}

{#snippet settingsGroup(title: string, rows: SystemRow[])}
  <section class="native-system-group" aria-label={title}>
    <header>{title}</header>
    <div class="native-system-group__rows">
      {#each rows as row}
        {@render settingsRow(row)}
      {/each}
    </div>
  </section>
{/snippet}

{#snippet interfaceGroup()}
  <section class="native-system-group" aria-label="Interfaccia">
    <header>Preferenze</header>
    <div class="native-system-group__rows">
      <div class="native-system-row native-system-row--control">
        <div class="native-system-row__label">Lingua</div>
        <div class="native-system-row__value">
          <strong>{languageLabels[language]}</strong>
          <div class="native-system-segment" aria-label="Lingua applicazione">
            {#each appLanguages as entry}
              <button type="button" class:active={entry === language} onclick={() => onLanguageChange(entry)}>
                {entry.toUpperCase()}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <div class="native-system-row native-system-row--control">
        <div class="native-system-row__label">Tema</div>
        <div class="native-system-row__value">
          <strong>{getThemeLabel(theme)}</strong>
          <div class="native-system-segment" aria-label="Tema applicazione">
            {#each appThemes as entry}
              <button type="button" class:active={entry === theme} onclick={() => onThemeChange(entry)}>
                {getThemeLabel(entry)}
              </button>
            {/each}
          </div>
        </div>
      </div>

      <div class="native-system-row native-system-row--control">
        <div class="native-system-row__label">Densità</div>
        <div class="native-system-row__value">
          <strong>Normale</strong>
          <div class="native-system-segment" aria-label="Densità interfaccia">
            <button type="button" disabled>Compatta</button>
            <button type="button" class="active" disabled>Normale</button>
            <button type="button" disabled>Ampia</button>
          </div>
        </div>
      </div>

      <div class="native-system-row native-system-row--control">
        <div class="native-system-row__label">Font editoriale</div>
        <div class="native-system-row__value">
          <strong>Attivo nel Listino</strong>
          <span>Preferenza attuale del modulo listino.</span>
        </div>
      </div>
    </div>
  </section>
{/snippet}

{#snippet dangerZone()}
  <section class="native-system-danger" aria-label="Zona pericolosa">
    <div>
      <span>Zona pericolosa</span>
      <strong>Reset database browser dev</strong>
      <p>Cancella il database locale di sviluppo. Non usare in produzione.</p>
      {#if !resetAvailable}
        <small>Disponibile solo in browser/dev, non in runtime SQLite nativo.</small>
      {/if}
      {#if resetError}
        <small class="error">{resetError}</small>
      {/if}
    </div>
    <button type="button" onclick={handleDevelopmentReset} disabled={resetInProgress || !resetAvailable}>
      {#if resetInProgress}
        <ActionActivity label="Reset in corso" />
      {:else}
        Reset database
      {/if}
    </button>
  </section>
{/snippet}

{#snippet contextRail(context: SystemContext)}
  <aside class="native-system-context" aria-label="Contesto sezione">
    <p>{context.eyebrow}</p>
    <h4>{context.title}</h4>
    <span>{context.summary}</span>

    <dl>
      {#each context.facts as fact}
        <div class={fact.tone ? `tone-${fact.tone}` : undefined}>
          <dt>{fact.label}</dt>
          <dd>{fact.value}</dd>
        </div>
      {/each}
    </dl>

    <small>{context.note}</small>
  </aside>
{/snippet}

{#snippet sectionFrame()}
  <div class="native-system-section-frame">
    <div class="native-system-main-stack">
      {#if activeSection === 'general'}
        {@render settingsGroup('Stato locale', generalRows)}
      {:else if activeSection === 'account'}
        {@render settingsGroup('Account e workspace', accountRows)}
      {:else if activeSection === 'providers'}
        {@render settingsGroup('Provider e integrazioni', providerRows)}
      {:else if activeSection === 'interface'}
        {@render interfaceGroup()}
      {:else if activeSection === 'local-data'}
        {@render settingsGroup('Dati locali', localDataRows)}
      {:else if activeSection === 'backup'}
        {@render settingsGroup('Backup e sicurezza', backupRows)}
        {@render dangerZone()}
      {:else if activeSection === 'diagnostics'}
        {@render settingsGroup('Diagnostica tecnica', diagnosticsRows)}
      {:else if activeSection === 'database-inspector'}
        <LocalDatabaseInspector />
      {:else if activeSection === 'application'}
        {@render settingsGroup('Applicazione', applicationRows)}
      {/if}
    </div>

    {@render contextRail(activeContext)}
  </div>
{/snippet}

<section class="settings-panel native-system-console" aria-label="Sistema">
  <header class="native-system-page-header">
    <div>
      <h2>Sistema</h2>
      <p>{DEFAULT_WORKSPACE_NAME} · {persistenceLabel} · {DATABASE_NAME}</p>
    </div>
  </header>

  <div class="native-system-layout" class:mobile-section-open={mobileSectionOpen}>
    <aside class="native-system-sidebar" aria-label="Sezioni Sistema">
      <div class="native-system-profile">
        <span aria-hidden="true">LP</span>
        <div>
          <strong>{DEFAULT_WORKSPACE_NAME}</strong>
          <small>Profilo operativo locale</small>
        </div>
      </div>

      <nav class="native-system-sidebar__nav">
        {#each sections as section}
          <button
            type="button"
            class:active={section.id === activeSection}
            onclick={() => selectSection(section.id)}
          >
            <span>{section.label}</span>
          </button>
        {/each}
      </nav>

      <div class="native-system-sidebar__status">
        <span>{runtimeTargetLabel}</span>
        <strong>{persistenceLabel}</strong>
      </div>
    </aside>

    <main
      class="native-system-content"
      class:native-system-content--database-inspector={activeSection === 'database-inspector'}
      aria-label={activeSectionMeta.label}
    >
      <button type="button" class="native-system-back" onclick={showSectionList}>
        Sistema
      </button>

      <header class="native-system-section-header">
        <h3>{activeSectionMeta.label}</h3>
        <span>{activeSectionMeta.description}</span>
      </header>

      {@render sectionFrame()}
    </main>
  </div>
</section>
