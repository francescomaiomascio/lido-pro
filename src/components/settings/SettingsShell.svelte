<script lang="ts">
  import { onMount } from 'svelte'
  import { getLanguageLabels, type AppLanguage } from '../../lib/i18n/languageStore'
  import type { OpenRegistryRequest } from '../../lib/state/registryFilters'
  import type { SettingsSection } from '../../lib/state/settingsMenuState'
  import type { AppTheme } from '../../lib/theme/themeTokens'
  import type { BeachItem, BeachLayout, BeachStatusSummary } from '../../lib/types/beach'
  import type { DatabaseRuntime } from '../../lib/types/db'
  import type { ExtraItemCatalogEntry } from '../../lib/types/extraItem'
  import SettingsContent from './SettingsContent.svelte'
  import SettingsNavigation from './SettingsNavigation.svelte'

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

  let isMobile = $state(false)
  let mobileDetailOpen = $state(false)
  let layerElement: HTMLDivElement | null = $state(null)
  type SettingsNavMode = 'expanded' | 'compact'

  const mobileSettingsBreakpoint = 640
  const tabletSettingsBreakpoint = 1180
  const navExpandedDefaultPx = 256
  const navExpandedMinPx = 224
  const navExpandedMaxPx = 288
  const navCompactPx = 68

  let navMode = $state<SettingsNavMode>('expanded')
  let navWidthPx = $state(navExpandedDefaultPx)
  let navResizeActive = $state(false)
  let navTouchedByUser = $state(false)
  let navResizeStartX = $state(0)
  let navResizeStartWidth = $state(navExpandedDefaultPx)
  let sectionBackStack = $state<SettingsSection[]>([])
  let sectionForwardStack = $state<SettingsSection[]>([])

  const labels = $derived(getLanguageLabels(language))
  const navIsCompact = $derived(navMode === 'compact')
  const navCssWidth = $derived(navIsCompact ? `${navCompactPx}px` : `${navWidthPx}px`)

  const syncViewport = () => {
    if (typeof window === 'undefined') {
      return
    }

    isMobile = window.innerWidth <= mobileSettingsBreakpoint
    if (!isMobile) {
      mobileDetailOpen = true
      if (!navTouchedByUser) {
        navMode = window.innerWidth <= tabletSettingsBreakpoint ? 'compact' : 'expanded'
        if (navMode === 'expanded') {
          navWidthPx = navExpandedDefaultPx
        }
      }
    }
  }


  const clampNavWidth = (width: number) =>
    Math.min(navExpandedMaxPx, Math.max(navExpandedMinPx, Math.round(width)))

  const toggleNavMode = () => {
    navTouchedByUser = true
    if (navMode === 'compact') {
      navMode = 'expanded'
      navWidthPx = clampNavWidth(navWidthPx || navExpandedDefaultPx)
      return
    }
    navMode = 'compact'
  }

  const handleNavResizeMove = (event: PointerEvent) => {
    const nextWidth = navResizeStartWidth + event.clientX - navResizeStartX
    if (nextWidth < 180) {
      navMode = 'compact'
      return
    }
    navMode = 'expanded'
    navWidthPx = clampNavWidth(nextWidth)
  }

  const stopNavResize = () => {
    navResizeActive = false
    if (typeof window !== 'undefined') {
      window.removeEventListener('pointermove', handleNavResizeMove)
    }
  }

  const goBackSection = () => {
    const previous = sectionBackStack.at(-1)
    if (!previous) return
    sectionBackStack = sectionBackStack.slice(0, -1)
    sectionForwardStack = [...sectionForwardStack, activeSection].slice(-30)
    onSectionSelect(previous)
    if (isMobile) mobileDetailOpen = true
  }

  const goForwardSection = () => {
    const next = sectionForwardStack.at(-1)
    if (!next) return
    sectionForwardStack = sectionForwardStack.slice(0, -1)
    sectionBackStack = [...sectionBackStack, activeSection].slice(-30)
    onSectionSelect(next)
    if (isMobile) mobileDetailOpen = true
  }

  const startNavResize = (event: PointerEvent) => {
    if (isMobile) {
      return
    }
    event.preventDefault()
    event.stopPropagation()
    navTouchedByUser = true
    navResizeActive = true
    navMode = 'expanded'
    navResizeStartX = event.clientX
    navResizeStartWidth = navWidthPx || navExpandedDefaultPx
    window.addEventListener('pointermove', handleNavResizeMove)
    window.addEventListener('pointerup', stopNavResize, { once: true })
  }

  const handleSelect = (section: SettingsSection) => {
    if (section !== activeSection) {
      sectionBackStack = [...sectionBackStack, activeSection].slice(-30)
      sectionForwardStack = []
    }
    onSectionSelect(section)
    if (isMobile) {
      mobileDetailOpen = true
    }
  }

  const closeFromPointer = (event: PointerEvent | MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    onClose()
  }

  const handleLayerPointerDown = (event: PointerEvent) => {
    if (!open || !(event.target instanceof HTMLElement)) {
      return
    }

    const closeTarget = event.target.closest('[data-settings-close]')
    if (closeTarget) {
      closeFromPointer(event)
      return
    }

    const sectionTarget = event.target.closest('[data-settings-section]') as HTMLElement | null
    const section = sectionTarget?.dataset.settingsSection as SettingsSection | undefined
    if (section) {
      event.preventDefault()
      event.stopPropagation()
      handleSelect(section)
      return
    }

    if (!event.target.closest('.settings-shell')) {
      closeFromPointer(event)
    }
  }

  onMount(() => {
    syncViewport()
    window.addEventListener('resize', syncViewport)
    return () => {
      window.removeEventListener('resize', syncViewport)
      window.removeEventListener('pointermove', handleNavResizeMove)
    }
  })

  $effect(() => {
    if (!open || !layerElement) {
      return
    }

    layerElement.addEventListener('pointerdown', handleLayerPointerDown, { capture: true })
    return () => {
      layerElement?.removeEventListener('pointerdown', handleLayerPointerDown, { capture: true })
    }
  })

  $effect(() => {
    if (open && !isMobile) {
      mobileDetailOpen = true
    }
    if (open && isMobile) {
      mobileDetailOpen = directDetailOpen
    }
  })
</script>

{#if open}
  <div bind:this={layerElement} class="settings-shell-layer">
    <div
      class="settings-shell-backdrop"
      role="presentation"
      onpointerdown={closeFromPointer}
      onclick={closeFromPointer}
    ></div>

    <aside
      class="settings-shell"
      class:is-mobile={isMobile}
      class:settings-shell--nav-expanded={navMode === 'expanded' && !isMobile}
      class:settings-shell--nav-compact={navMode === 'compact' && !isMobile}
      class:settings-shell--nav-resizing={navResizeActive}
      style={`--settings-nav-width: ${navCssWidth}; --settings-nav-expanded-width: ${navWidthPx}px;`}
      aria-label={labels.settingsTitle}
    >
      <header class="settings-shell__header">
        <div>
          <h2>{labels.settingsTitle}</h2>
          <p>{appDisplayName}</p>
        </div>

        <div class="settings-shell__header-actions">
          {#if isMobile && mobileDetailOpen}
            <button
              type="button"
            class="button-ghost settings-shell__icon-action"
            aria-label="Indietro"
            title="Indietro"
            onpointerdown={(event) => {
              event.preventDefault()
              event.stopPropagation()
              mobileDetailOpen = false
            }}
            onclick={() => (mobileDetailOpen = false)}
          >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
          {/if}
          {#if !isMobile}
            <button
              type="button"
              class="button-ghost settings-shell__icon-action"
              aria-label="Sezione precedente"
              title="Indietro"
              disabled={sectionBackStack.length === 0}
              onclick={goBackSection}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <button
              type="button"
              class="button-ghost settings-shell__icon-action"
              aria-label="Sezione successiva"
              title="Avanti"
              disabled={sectionForwardStack.length === 0}
              onclick={goForwardSection}
            >
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </button>
          {/if}
          <button
            type="button"
            class="button-ghost settings-shell__icon-action"
            aria-label="Chiudi"
            title="Chiudi"
            data-settings-close
            onpointerdown={closeFromPointer}
            onclick={closeFromPointer}
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
              <path d="M18 6 6 18" />
              <path d="m6 6 12 12" />
            </svg>
          </button>
        </div>
      </header>


      <div class="settings-shell__body">
        {#if !isMobile || !mobileDetailOpen}
          <SettingsNavigation
            {activeSection}
            {language}
            mode={navMode}
            onToggleMode={toggleNavMode}
            onSelect={handleSelect}
          />
        {/if}

        {#if !isMobile || mobileDetailOpen}
          <SettingsContent
            {activeSection}
            {appDisplayName}
            {layout}
            {summary}
            {typeSummary}
            {items}
            {runtime}
            {theme}
            {language}
            {registryOpenRequest}
            {extraCatalog}
            onSectionSelect={handleSelect}
            onExtraCatalogChange={onExtraCatalogChange}
            onThemeChange={onThemeChange}
            onLanguageChange={onLanguageChange}
          />
        {/if}
      </div>
    </aside>
  </div>
{/if}
