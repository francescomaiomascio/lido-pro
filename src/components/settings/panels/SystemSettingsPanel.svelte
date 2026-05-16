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

  type SystemSection = 'interface' | 'local-data' | 'diagnostics' | 'application' | 'backup'

  let activeSection: SystemSection = $state('interface')

  const persistenceLabel = $derived(
    runtime === 'browser-memory-fallback'
      ? 'Memoria temporanea'
      : runtime === 'web-persistent-sqlite'
        ? 'Persistente web'
        : runtime === 'native-sqlite'
          ? 'SQLite nativo'
          : 'Non disponibile',
  )
  const systemTabs: Array<{ id: SystemSection; label: string }> = [
    { id: 'interface', label: 'Interfaccia' },
    { id: 'local-data', label: 'Dati locali' },
    { id: 'diagnostics', label: 'Diagnostica' },
    { id: 'application', label: 'Applicazione' },
    { id: 'backup', label: 'Sicurezza / Backup' },
  ]
</script>

<section class="settings-panel system-admin-panel" aria-label="Sistema">
  <div class="settings-view-header settings-panel__header system-admin-header">
    <h2>Sistema</h2>
    <span class="settings-toolbar-count">{persistenceLabel}</span>
  </div>

  <div class="system-admin-toolbar" role="tablist" aria-label="Sezioni sistema">
    {#each systemTabs as tab}
      <button
        type="button"
        role="tab"
        aria-selected={activeSection === tab.id}
        class:active={activeSection === tab.id}
        onclick={() => (activeSection = tab.id)}
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <div class="settings-admin-grid settings-admin-grid--single">
    {#if activeSection === 'interface'}
    <section class="settings-admin-section settings-admin-section--wide">
      <header><strong>Interfaccia</strong></header>
      <div class="settings-admin-rows">
        <div class="settings-admin-row">
          <div><strong>Lingua</strong><span>{languageLabels[language]}</span></div>
          <div class="settings-inline-options">
            {#each appLanguages as entry}
              <button type="button" class:active={entry === language} onclick={() => onLanguageChange(entry)}>
                {entry.toUpperCase()}
              </button>
            {/each}
          </div>
        </div>
        <div class="settings-admin-row">
          <div><strong>Tema</strong><span>{getThemeLabel(theme)}</span></div>
          <div class="settings-inline-options">
            {#each appThemes as entry}
              <button type="button" class:active={entry === theme} onclick={() => onThemeChange(entry)}>
                {getThemeLabel(entry)}
              </button>
            {/each}
          </div>
        </div>
      </div>
    </section>
    {/if}

    {#if activeSection === 'local-data'}
    <section class="settings-admin-section settings-admin-section--wide">
      <header><strong>Dati locali</strong></header>
      <dl class="settings-admin-definition">
        <div><dt>Runtime</dt><dd>{runtimeLabel}</dd></div>
        <div><dt>Database</dt><dd>beach_bdf.db</dd></div>
        <div><dt>Adapter</dt><dd>{runtime ?? 'non disponibile'}</dd></div>
        <div><dt>Elementi caricati</dt><dd>{itemCount}</dd></div>
        <div><dt>Dimensioni</dt><dd>{layout ? `${layout.widthM}m x ${layout.depthM}m` : 'Non disponibili'}</dd></div>
        <div><dt>Stato persistenza</dt><dd>{persistenceLabel}</dd></div>
      </dl>
    </section>
    {/if}

    {#if activeSection === 'diagnostics'}
    <section class="settings-admin-section system-admin-section--wide">
      <header><strong>Diagnostica</strong></header>
      <DiagnosticsPanel {layout} {itemCount} {runtime} />
    </section>
    {/if}

    {#if activeSection === 'application'}
    <section class="settings-admin-section settings-admin-section--wide">
      <header><strong>Applicazione</strong></header>
      <dl class="settings-admin-definition">
        <div><dt>Nome prodotto</dt><dd>{APP_DISPLAY_NAME}</dd></div>
        <div><dt>Package Android</dt><dd>{appConfig.appId}</dd></div>
        <div><dt>Canale</dt><dd>Locale</dd></div>
        <div><dt>Database</dt><dd>beach_bdf.db</dd></div>
      </dl>
    </section>
    {/if}

    {#if activeSection === 'backup'}
    <section class="settings-admin-section settings-admin-section--wide">
      <header><strong>Sicurezza / Backup</strong></header>
      <div class="settings-admin-rows">
        <div class="settings-admin-row">
          <div><strong>Backup operativo</strong><span>Non ancora configurato</span></div>
          <span class="settings-admin-muted">Previsto in una wave dedicata.</span>
        </div>
        <div class="settings-admin-row">
          <div><strong>Azioni distruttive</strong><span>Solo diagnostica sviluppo</span></div>
          <span class="settings-admin-muted">Il reset resta isolato nella sezione Diagnostica.</span>
        </div>
      </div>
    </section>
    {/if}
  </div>
</section>
