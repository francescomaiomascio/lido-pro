<script lang="ts">
  import { APP_DISPLAY_NAME, appConfig } from '../../../lib/config/appConfig'
  import {
    appLanguages,
    languageLabels,
    type AppLanguage,
  } from '../../../lib/i18n/languageStore'
  import { appThemes, getThemeLabel, type AppTheme } from '../../../lib/theme/themeTokens'
  import type { BeachLayout } from '../../../lib/types/beach'
  import type { DatabaseRuntime } from '../../../lib/types/db'
  import DiagnosticsPanel from '../../layout/DiagnosticsPanel.svelte'

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
    | 'interface'
    | 'local-data'
    | 'account-provider'
    | 'integrations'
    | 'diagnostics'
    | 'application'
    | 'security-backup'

  const persistenceLabel = $derived(
    runtime === 'browser-memory-fallback'
      ? 'Memoria temporanea'
      : runtime === 'web-persistent-sqlite'
        ? 'Persistente web'
        : runtime === 'native-sqlite'
          ? 'SQLite nativo'
          : 'Non disponibile',
  )
  const layoutSizeLabel = $derived(layout ? `${layout.widthM}m x ${layout.depthM}m` : 'Non disponibile')

  const systemSections: Array<{ id: SystemSection; label: string }> = [
    { id: 'general', label: 'Generale' },
    { id: 'interface', label: 'Interfaccia' },
    { id: 'local-data', label: 'Dati locali' },
    { id: 'account-provider', label: 'Account e provider' },
    { id: 'integrations', label: 'Integrazioni' },
    { id: 'diagnostics', label: 'Diagnostica' },
    { id: 'application', label: 'Applicazione' },
    { id: 'security-backup', label: 'Sicurezza e backup' },
  ]
</script>

<section class="settings-panel system-admin-panel" aria-label="Sistema">
  <div class="settings-view-header settings-panel__header system-admin-header">
    <div>
      <h2>Sistema</h2>
      <p>Impostazioni locali, interfaccia, dati, diagnostica e confini applicativi.</p>
    </div>
    <span class="settings-toolbar-count">{persistenceLabel}</span>
  </div>

  <div class="system-settings-layout">
    <nav class="system-settings-index" aria-label="Categorie sistema">
      {#each systemSections as section}
        <a href={`#system-${section.id}`}>{section.label}</a>
      {/each}
    </nav>

    <div class="system-settings-stack">
      <section id="system-general" class="settings-admin-section">
        <header>
          <strong>Generale</strong>
          <span>Stato operativo locale della sessione corrente.</span>
        </header>
        <dl class="settings-admin-definition">
          <div><dt>Runtime</dt><dd>{runtimeLabel}</dd></div>
          <div><dt>Persistenza</dt><dd>{persistenceLabel}</dd></div>
          <div><dt>Layout attivo</dt><dd>{layoutSizeLabel}</dd></div>
          <div><dt>Elementi caricati</dt><dd>{itemCount}</dd></div>
        </dl>
      </section>

      <section id="system-interface" class="settings-admin-section">
        <header>
          <strong>Interfaccia</strong>
          <span>Lingua e tema dell’applicazione.</span>
        </header>
        <div class="settings-admin-rows">
          <div class="settings-admin-row">
            <div><strong>Lingua</strong><span>{languageLabels[language]}</span></div>
            <div class="settings-inline-options" aria-label="Lingua applicazione">
              {#each appLanguages as entry}
                <button type="button" class:active={entry === language} onclick={() => onLanguageChange(entry)}>
                  {entry.toUpperCase()}
                </button>
              {/each}
            </div>
          </div>
          <div class="settings-admin-row">
            <div><strong>Tema</strong><span>{getThemeLabel(theme)}</span></div>
            <div class="settings-inline-options" aria-label="Tema applicazione">
              {#each appThemes as entry}
                <button type="button" class:active={entry === theme} onclick={() => onThemeChange(entry)}>
                  {getThemeLabel(entry)}
                </button>
              {/each}
            </div>
          </div>
        </div>
      </section>

      <section id="system-local-data" class="settings-admin-section">
        <header>
          <strong>Dati locali</strong>
          <span>Database, adapter e layout locale caricato.</span>
        </header>
        <dl class="settings-admin-definition">
          <div><dt>Database</dt><dd>beach_bdf.db</dd></div>
          <div><dt>Adapter</dt><dd>{runtime ?? 'Non disponibile'}</dd></div>
          <div><dt>Stato persistenza</dt><dd>{persistenceLabel}</dd></div>
          <div><dt>Dimensioni layout</dt><dd>{layout ? `${layout.widthM}m x ${layout.depthM}m` : 'Non disponibili'}</dd></div>
        </dl>
      </section>

      <section id="system-account-provider" class="settings-admin-section">
        <header>
          <strong>Account e provider</strong>
          <span>Profilo locale e provider esterni non attivi.</span>
        </header>
        <dl class="settings-admin-definition">
          <div><dt>Account locale</dt><dd>Profilo operativo locale</dd></div>
          <div><dt>Provider esterni</dt><dd>Non configurati</dd></div>
          <div><dt>Google / Apple</dt><dd>Previsti, non attivi</dd></div>
        </dl>
      </section>

      <section id="system-integrations" class="settings-admin-section">
        <header>
          <strong>Integrazioni</strong>
          <span>Confini futuri non attivi in questa build.</span>
        </header>
        <dl class="settings-admin-definition">
          <div><dt>Lido Cloud</dt><dd>Non attivo</dd></div>
          <div><dt>Lido Pay</dt><dd>Non attivo</dd></div>
          <div><dt>Portale clienti</dt><dd>Non attivo</dd></div>
        </dl>
      </section>

      <section id="system-diagnostics" class="settings-admin-section">
        <header>
          <strong>Diagnostica</strong>
          <span>Stato tecnico e strumenti di sviluppo confinati.</span>
        </header>
        <DiagnosticsPanel {layout} {itemCount} {runtime} />
      </section>

      <section id="system-application" class="settings-admin-section">
        <header>
          <strong>Applicazione</strong>
          <span>Identita prodotto e configurazione package.</span>
        </header>
        <dl class="settings-admin-definition">
          <div><dt>Nome prodotto</dt><dd>{APP_DISPLAY_NAME}</dd></div>
          <div><dt>Package Android</dt><dd>{appConfig.appId}</dd></div>
          <div><dt>Canale</dt><dd>Locale</dd></div>
          <div><dt>Database</dt><dd>beach_bdf.db</dd></div>
        </dl>
      </section>

      <section id="system-security-backup" class="settings-admin-section">
        <header>
          <strong>Sicurezza e backup</strong>
          <span>Stato backup e azioni protette.</span>
        </header>
        <dl class="settings-admin-definition">
          <div><dt>Backup operativo</dt><dd>Non configurato</dd></div>
          <div><dt>Azioni protette</dt><dd>Solo diagnostica sviluppo</dd></div>
        </dl>
      </section>
    </div>
  </div>
</section>
