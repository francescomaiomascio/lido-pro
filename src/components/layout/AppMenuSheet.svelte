<script lang="ts">
  import SettingsShell from '../settings/SettingsShell.svelte'
  import type { AppLanguage } from '../../lib/i18n/languageStore'
  import type { OpenRegistryRequest } from '../../lib/state/registryFilters'
  import type { SettingsSection } from '../../lib/state/settingsMenuState'
  import type { AppTheme } from '../../lib/theme/themeTokens'
  import type { BeachItem, BeachLayout, BeachStatusSummary } from '../../lib/types/beach'
  import type { DatabaseRuntime } from '../../lib/types/db'
  import type { ExtraItemCatalogEntry } from '../../lib/types/extraItem'

  let {
    open,
    appDisplayName,
    activeSection,
    directDetailOpen,
    layout,
    summary,
    typeSummary,
    items,
    runtime,
    theme,
    language,
    registryOpenRequest,
    extraCatalog,
    onClose,
    onSectionSelect,
    onExtraCatalogChange,
    onThemeChange,
    onLanguageChange,
  }: {
    open: boolean
    appDisplayName: string
    activeSection: SettingsSection
    directDetailOpen: boolean
    layout: BeachLayout | null
    summary: BeachStatusSummary
    typeSummary: { palms: number; umbrellas: number; smallPalms: number }
    items: BeachItem[]
    runtime: DatabaseRuntime | null
    theme: AppTheme
    language: AppLanguage
    registryOpenRequest: OpenRegistryRequest | null
    extraCatalog: ExtraItemCatalogEntry[]
    onClose: () => void
    onSectionSelect: (section: SettingsSection) => void
    onExtraCatalogChange: (catalog: ExtraItemCatalogEntry[]) => void
    onThemeChange: (theme: AppTheme) => void
    onLanguageChange: (language: AppLanguage) => void
  } = $props()
</script>

<SettingsShell
  {open}
  {appDisplayName}
  {activeSection}
  {directDetailOpen}
  {layout}
  {summary}
  {typeSummary}
  {items}
  {runtime}
  {theme}
  {language}
  {registryOpenRequest}
  {extraCatalog}
  {onClose}
  {onSectionSelect}
  {onExtraCatalogChange}
  {onThemeChange}
  {onLanguageChange}
/>
