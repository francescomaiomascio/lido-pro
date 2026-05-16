<script lang="ts">
  import BeachCanvasSettingsPanel from './panels/BeachCanvasSettingsPanel.svelte'
  import CustomersSettingsPanel from './panels/CustomersSettingsPanel.svelte'
  import RegistrySettingsPanel from './panels/RegistrySettingsPanel.svelte'
  import SystemSettingsPanel from './panels/SystemSettingsPanel.svelte'
  import TariffsSettingsPanel from './panels/TariffsSettingsPanel.svelte'
  import type { AppLanguage } from '../../lib/i18n/languageStore'
  import type { OpenRegistryRequest } from '../../lib/state/registryFilters'
  import type { SettingsSection } from '../../lib/state/settingsMenuState'
  import type { AppTheme } from '../../lib/theme/themeTokens'
  import type { BeachItem, BeachLayout, BeachStatusSummary } from '../../lib/types/beach'
  import type { DatabaseRuntime } from '../../lib/types/db'
  import type { ExtraItemCatalogEntry } from '../../lib/types/extraItem'

  let {
    activeSection,
    appDisplayName,
    layout,
    summary,
    typeSummary,
    items,
    runtime,
    theme,
    language,
    registryOpenRequest,
    extraCatalog,
    onSectionSelect,
    onExtraCatalogChange,
    onThemeChange,
    onLanguageChange,
  }: {
    activeSection: SettingsSection
    appDisplayName: string
    layout: BeachLayout | null
    summary: BeachStatusSummary
    typeSummary: { palms: number; umbrellas: number; smallPalms: number }
    items: BeachItem[]
    runtime: DatabaseRuntime | null
    theme: AppTheme
    language: AppLanguage
    registryOpenRequest: OpenRegistryRequest | null
    extraCatalog: ExtraItemCatalogEntry[]
    onSectionSelect: (section: SettingsSection) => void
    onExtraCatalogChange: (catalog: ExtraItemCatalogEntry[]) => void
    onThemeChange: (theme: AppTheme) => void
    onLanguageChange: (language: AppLanguage) => void
  } = $props()

  const beachSections: SettingsSection[] = [
    'beach-parametric-setup',
    'beach-dimensions-capacity',
    'beach-distances-distribution',
    'beach-measurements-grid',
    'beach-surface',
    'beach-rendering-elements',
    'beach-assets',
    'beach-library-umbrellas',
    'beach-library-palms',
    'beach-library-furniture',
    'beach-library-map-items',
    'beach-library-icons-symbols',
    'beach-walkways',
    'beach-walkway-materials',
    'beach-unusable-areas',
    'beach-services-obstacles',
    'beach-layout-rules',
    'beach-layout-validation',
    'beach-layout-versions',
    'beach-edit-mode',
  ]

  const runtimeLabel = $derived(
    runtime === 'native-sqlite'
      ? 'SQLite nativo'
      : runtime === 'web-persistent-sqlite'
        ? 'SQLite web persistente'
        : 'Memoria temporanea',
  )
</script>

<div class="settings-content" aria-label="Contenuto impostazioni">
  {#if activeSection === 'customers'}
    <CustomersSettingsPanel />
  {:else if activeSection === 'tariffs'}
    <TariffsSettingsPanel onCatalogChange={onExtraCatalogChange} />
  {:else if activeSection === 'extras'}
    <TariffsSettingsPanel onCatalogChange={onExtraCatalogChange} />
  {:else if activeSection === 'registry'}
    <RegistrySettingsPanel openRequest={registryOpenRequest} />
  {:else if beachSections.includes(activeSection)}
    <BeachCanvasSettingsPanel
      section={activeSection}
      {appDisplayName}
      {layout}
      {summary}
      {typeSummary}
      {items}
      {onSectionSelect}
    />
  {:else if activeSection === 'system'}
    <SystemSettingsPanel
      {language}
      {theme}
      {layout}
      itemCount={summary.total}
      {runtime}
      {runtimeLabel}
      {onThemeChange}
      {onLanguageChange}
    />
  {:else if activeSection === 'language' || activeSection === 'theme' || activeSection === 'diagnostics' || activeSection === 'version'}
    <SystemSettingsPanel
      {language}
      {theme}
      {layout}
      itemCount={summary.total}
      {runtime}
      {runtimeLabel}
      {onThemeChange}
      {onLanguageChange}
    />
  {/if}
</div>
