<script lang="ts">
  import { getLanguageLabels, type AppLanguage } from '../../lib/i18n/languageStore'
  import type { SettingsSection } from '../../lib/state/settingsMenuState'

  let {
    activeSection,
    language,
    mode = 'expanded',
    onToggleMode,
    onSelect,
  }: {
    activeSection: SettingsSection
    language: AppLanguage
    mode?: 'expanded' | 'compact'
    onToggleMode?: () => void
    onSelect: (section: SettingsSection) => void
  } = $props()

  const labels = $derived(getLanguageLabels(language))
  const compact = $derived(mode === 'compact')

  type NavItem = { id: SettingsSection; label: string; description: string; planned?: boolean }

  const groups: Array<{
    title: string
    items: NavItem[]
  }> = $derived([
    {
      title: labels.management,
      items: [
        { id: 'customers', label: labels.customers, description: 'Anagrafiche e contatti' },
        { id: 'registry', label: 'Registro', description: 'Prenotazioni e saldi' },
        { id: 'tariffs', label: 'Listino', description: 'Prezzi, articoli e dotazioni' },
      ],
    },
    {
      title: labels.system,
      items: [
        { id: 'system', label: 'Sistema', description: 'Preferenze, diagnostica e versione' },
      ],
    },
  ])

  const beachGroups: Array<{ id: string; title: string; items: NavItem[] }> = [
    {
      id: 'beach-map',
      title: 'Spiaggia',
      items: [
        { id: 'beach-parametric-setup', label: 'Studio mappa', description: 'Layout parametrico e pubblicazione' },
        { id: 'beach-dimensions-capacity', label: 'Registro misure', description: 'Oggetti e vincoli fisici' },
        { id: 'beach-layout-versions', label: 'Configurazioni salvate', description: 'Mappe, bozze e backup' },
      ],
    },
    {
      id: 'element-library',
      title: 'Libreria elementi',
      items: [
        { id: 'beach-assets', label: 'Asset spiaggia', description: 'Overview libreria' },
        { id: 'beach-library-umbrellas', label: 'Ombrelloni', description: 'Varianti e ingombri' },
        { id: 'beach-library-palms', label: 'Palme', description: 'Formati e palmette' },
        { id: 'beach-library-furniture', label: 'Arredi spiaggia', description: 'Lettini e tavolini' },
        { id: 'beach-library-map-items', label: 'Articoli e servizi', description: 'Docce, box e ostacoli' },
        { id: 'beach-walkway-materials', label: 'Passerelle e materiali', description: 'Moduli e materiali' },
        { id: 'beach-surface', label: 'Sfondi e palette', description: 'Sabbia, mare e colori' },
        { id: 'beach-library-icons-symbols', label: 'Icone tecniche', description: 'Icone operative' },
      ],
    },
  ]

  let openBeachGroups: Record<string, boolean> = $state({
    'beach-map': true,
    'element-library': true,
  })

  const isActiveBeachGroup = (group: { id: string; items: NavItem[] }) =>
    group.items.some((item) => item.id === activeSection) ||
    (group.id === 'element-library' && activeSection === 'beach-assets')

  const selectFromPointer = (event: PointerEvent, section: SettingsSection) => {
    event.preventDefault()
    event.stopPropagation()
    onSelect(section)
  }

  const toggleBeachGroup = (event: MouseEvent | PointerEvent, groupId: string) => {
    event.preventDefault()
    event.stopPropagation()
    openBeachGroups = {
      ...openBeachGroups,
      [groupId]: !openBeachGroups[groupId],
    }
  }

  const beachGroupHomeSection: Record<string, SettingsSection> = {
    'beach-map': 'beach-parametric-setup',
    'element-library': 'beach-assets',
  }

  const stopChromePointer = (event: PointerEvent | MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
  }

  const openBeachGroupHome = (event: MouseEvent | PointerEvent, groupId: string) => {
    event.preventDefault()
    event.stopPropagation()
    openBeachGroups = {
      ...openBeachGroups,
      [groupId]: true,
    }
    onSelect(beachGroupHomeSection[groupId] ?? 'beach-parametric-setup')
  }



  $effect(() => {
    const activeGroup = beachGroups.find(isActiveBeachGroup)
    if (activeGroup && !openBeachGroups[activeGroup.id]) {
      openBeachGroups = {
        ...openBeachGroups,
        [activeGroup.id]: true,
      }
    }
  })
</script>

<nav class="settings-nav" class:settings-nav--compact={compact} aria-label="Navigazione impostazioni">
  {#if onToggleMode}
    <button
      type="button"
      class="settings-nav__mode-toggle"
      class:settings-nav__mode-toggle--compact={compact}
      aria-label={compact ? 'Espandi sidebar impostazioni' : 'Comprimi sidebar impostazioni'}
      title={compact ? 'Espandi sidebar' : 'Comprimi sidebar'}
      onpointerdown={stopChromePointer}
      onclick={onToggleMode}
    >
      <svg aria-hidden="true" viewBox="0 0 24 24" fill="none">
        <path d={compact ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />
      </svg>
    </button>
  {/if}
  {#snippet navRow(item: NavItem)}
    <button
      type="button"
      class="settings-nav__row"
      class:active={item.id === activeSection}
      aria-label={item.label}
      title={item.label}
      data-settings-section={item.id}
      onpointerdown={(event) => selectFromPointer(event, item.id)}
      onclick={() => onSelect(item.id)}
    >
      <div class="settings-nav__row-main">
        <span class="settings-nav__icon" aria-hidden="true">
          {#if item.id === 'customers'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          {:else if item.id === 'tariffs'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z"></path>
              <path d="M7 7h.01"></path>
            </svg>
          {:else if item.id === 'registry'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 3H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V5a2 2 0 0 0-2-2h-2"></path>
              <path d="M8 7h8"></path>
              <path d="M8 11h8"></path>
              <path d="M8 15h5"></path>
            </svg>
          {:else if item.id === 'beach-parametric-setup'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="m12 3 1.2 3.1L16.5 7l-3.3 1 .8 3.3-2.8-1.7-2.8 1.7.8-3.3-3.3-1 3.3-.9L12 3Z"></path>
              <path d="m18 13 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7.7-1.8Z"></path>
            </svg>
          {:else if item.id === 'beach-measurements-grid'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 4h16"></path>
              <path d="M4 10h16"></path>
              <path d="M4 16h16"></path>
              <path d="M4 22h16"></path>
              <path d="M4 4v18"></path>
              <path d="M10 4v18"></path>
              <path d="M16 4v18"></path>
              <path d="M22 4v18"></path>
            </svg>
          {:else if item.id === 'beach-surface'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 15c3-4 6 4 9 0s6 4 9 0"></path>
              <path d="M3 9c3-4 6 4 9 0s6 4 9 0"></path>
              <path d="M5 19h14"></path>
            </svg>
          {:else if item.id === 'beach-assets'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 6h6v6H4z"></path>
              <path d="M14 6h6v6h-6z"></path>
              <path d="M4 16h6v4H4z"></path>
              <path d="M14 16h6v4h-6z"></path>
            </svg>
          {:else if item.id === 'beach-rendering-elements'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="7" r="3"></circle>
              <path d="M12 10v10"></path>
              <path d="M7 14h10"></path>
              <path d="m8 20 4-4 4 4"></path>
            </svg>
          {:else if item.id === 'beach-library-umbrellas'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12a8 8 0 0 1 16 0Z"></path>
              <path d="M12 12v8"></path>
              <path d="M12 20a2 2 0 0 1-2 2"></path>
            </svg>
          {:else if item.id === 'beach-library-palms'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 21v-8"></path>
              <path d="M12 13c-4-1-6-4-7-8 4 0 6 2 7 5"></path>
              <path d="M12 13c4-1 6-4 7-8-4 0-6 2-7 5"></path>
            </svg>
          {:else if item.id === 'beach-library-furniture'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 10h12v5H6z"></path>
              <path d="M8 15v5"></path>
              <path d="M16 15v5"></path>
            </svg>
          {:else if item.id === 'beach-library-map-items' || item.id === 'beach-services-obstacles'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="5" y="5" width="14" height="14" rx="3"></rect>
              <path d="M9 12h6"></path>
              <path d="M12 9v6"></path>
            </svg>
          {:else if item.id === 'beach-library-icons-symbols'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 8h.01"></path>
              <path d="M11 12h1v4h1"></path>
            </svg>
          {:else if item.id === 'beach-surface-zones'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 5h8v6H4z"></path>
              <path d="M12 13h8v6h-8z"></path>
              <path d="M15 5h5v5"></path>
              <path d="M4 16h5v3"></path>
            </svg>
          {:else if item.id === 'beach-walkways'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 19 19 5"></path>
              <path d="m7 13 4 4"></path>
              <path d="m11 9 4 4"></path>
              <path d="m15 5 4 4"></path>
            </svg>
          {:else if item.id === 'beach-walkway-materials'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 19 19 5"></path>
              <path d="m6 14 4 4"></path>
              <path d="m10 10 4 4"></path>
              <path d="m14 6 4 4"></path>
            </svg>
          {:else if item.id === 'beach-unusable-areas'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 5h14v14H5z"></path>
              <path d="m5 5 14 14"></path>
            </svg>
          {:else if item.id === 'beach-layout-rules'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M5 5h14v14H5z"></path>
              <path d="M9 9h6"></path>
              <path d="M9 13h6"></path>
              <path d="M9 17h3"></path>
            </svg>
          {:else if item.id === 'beach-layout-validation'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 6 9 17l-5-5"></path>
              <path d="M4 21h16"></path>
            </svg>
          {:else if item.id === 'beach-layout-versions'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M8 7h12"></path>
              <path d="M8 12h12"></path>
              <path d="M8 17h12"></path>
              <path d="M4 7h.01"></path>
              <path d="M4 12h.01"></path>
              <path d="M4 17h.01"></path>
            </svg>
          {:else if item.id === 'beach-edit-mode'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9"></path>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"></path>
            </svg>
          {:else if item.id.startsWith('beach-')}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
          {:else if item.id === 'system' || item.id === 'language'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M3 5h12"></path>
              <path d="M9 3v2a14 14 0 0 1-4 10"></path>
              <path d="M6 10a14 14 0 0 0 10 10"></path>
              <path d="M12 19l4-9 4 9"></path>
              <path d="M13 17h6"></path>
            </svg>
          {:else if item.id === 'theme'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 3a9 9 0 1 0 9 9 7 7 0 0 1-9-9Z"></path>
            </svg>
          {:else if item.id === 'diagnostics'}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 9v4"></path>
              <path d="M12 17h.01"></path>
              <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z"></path>
            </svg>
          {:else}
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="9"></circle>
              <path d="M12 8h.01"></path>
              <path d="M11 12h1v4h1"></path>
            </svg>
          {/if}
        </span>
        <div class="settings-nav__copy">
          <span>
            {item.label}
            {#if item.planned}
              <em>Pianificato</em>
            {/if}
          </span>
          <small>{item.description}</small>
        </div>
      </div>
    </button>
  {/snippet}

  {#snippet compactGlyph(id: string)}
    {#if id === 'customers'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M22 21v-2a4 4 0 0 0-3-3.87"></path></svg>
    {:else if id === 'registry'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H6a2 2 0 0 0-2 2v16l4-2 4 2 4-2 4 2V5a2 2 0 0 0-2-2h-2"></path><path d="M8 7h8"></path><path d="M8 12h8"></path></svg>
    {:else if id === 'tariffs'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.59 13.41 11 3H4v7l9.59 9.59a2 2 0 0 0 2.82 0l4.18-4.18a2 2 0 0 0 0-2.82Z"></path><path d="M7 7h.01"></path></svg>
    {:else if id === 'beach-map'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v14H4z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path><circle cx="17" cy="16" r="1.5"></circle></svg>
    {:else if id === 'element-library'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h6v6H4z"></path><path d="M14 6h6v6h-6z"></path><path d="M4 16h6v4H4z"></path><path d="M14 16h6v4h-6z"></path></svg>
    {:else if id === 'beach-parametric-setup'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 5h16v14H4z"></path><path d="M8 9h8"></path><path d="M8 13h5"></path><circle cx="17" cy="16" r="1.5"></circle></svg>
    {:else if id === 'beach-dimensions-capacity'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M7 8h10"></path><path d="M7 14h6"></path><path d="M17 8l-2-2 2-2"></path><path d="M13 14l-2-2 2-2"></path></svg>
    {:else if id === 'beach-layout-versions'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M7 7h13"></path><path d="M7 12h13"></path><path d="M7 17h13"></path><path d="M3 7h.01"></path><path d="M3 12h.01"></path><path d="M3 17h.01"></path></svg>
    {:else if id === 'beach-assets'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h6v6H4z"></path><path d="M14 6h6v6h-6z"></path><path d="M4 16h6v4H4z"></path><path d="M14 16h6v4h-6z"></path></svg>
    {:else if id === 'beach-library-umbrellas'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 12a8 8 0 0 1 16 0Z"></path><path d="M12 12v8"></path><path d="M12 20a2 2 0 0 1-2 2"></path></svg>
    {:else if id === 'beach-library-palms'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21v-8"></path><path d="M12 13c-4-1-6-4-7-8 4 0 6 2 7 5"></path><path d="M12 13c4-1 6-4 7-8-4 0-6 2-7 5"></path></svg>
    {:else if id === 'beach-library-furniture'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 10h12v5H6z"></path><path d="M8 15v5"></path><path d="M16 15v5"></path></svg>
    {:else if id === 'beach-library-map-items'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="5" width="14" height="14" rx="3"></rect><path d="M9 12h6"></path><path d="M12 9v6"></path></svg>
    {:else if id === 'beach-walkway-materials'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 19 19 5"></path><path d="m6 14 4 4"></path><path d="m10 10 4 4"></path><path d="m14 6 4 4"></path></svg>
    {:else if id === 'beach-surface'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 15c3-4 6 4 9 0s6 4 9 0"></path><path d="M3 9c3-4 6 4 9 0s6 4 9 0"></path><path d="M5 19h14"></path></svg>
    {:else if id === 'beach-library-icons-symbols'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"></circle><path d="M12 8h.01"></path><path d="M11 12h1v4h1"></path></svg>
    {:else if id === 'system' || id === 'language'}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 5h12"></path><path d="M9 3v2a14 14 0 0 1-4 10"></path><path d="M12 19l4-9 4 9"></path></svg>
    {:else}
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 5h14v14H5z"></path><path d="M9 9h6"></path><path d="M9 13h4"></path></svg>
    {/if}
  {/snippet}

  {#snippet compactItem(id: string, label: string, active: boolean, section: SettingsSection, count: number | null = null)}
    <button
      type="button"
      class="settings-nav__compact-item"
      class:active
      aria-label={label}
      title={count === null ? label : `${label} · ${count}`}
      data-settings-section={section}
      onpointerdown={(event) => selectFromPointer(event, section)}
      onclick={() => onSelect(section)}
    >
      <span class="settings-nav__compact-icon" aria-hidden="true">{@render compactGlyph(id)}</span>
      {#if count !== null}
        <span class="settings-nav__compact-count" aria-hidden="true">{count}</span>
      {/if}
    </button>
  {/snippet}

  {#if compact}
    <div class="settings-nav__compact-stack" aria-label="Navigazione compatta impostazioni">
      <div class="settings-nav__compact-section" aria-hidden="true"></div>
      {#each groups[0].items as item}
        {@render compactItem(item.id, item.label, item.id === activeSection, item.id)}
      {/each}

      <div class="settings-nav__compact-divider" aria-hidden="true"></div>
      {#each beachGroups as beachGroup}
        {@render compactItem(beachGroup.id, beachGroup.title, isActiveBeachGroup(beachGroup), beachGroupHomeSection[beachGroup.id] ?? 'beach-parametric-setup', beachGroup.items.length)}
        {#each beachGroup.items as item}
          {@render compactItem(item.id, item.label, item.id === activeSection, item.id)}
        {/each}
        <div class="settings-nav__compact-divider settings-nav__compact-divider--soft" aria-hidden="true"></div>
      {/each}

      <div class="settings-nav__compact-divider" aria-hidden="true"></div>
      {#each groups[1].items as item}
        {@render compactItem(item.id, item.label, item.id === activeSection, item.id)}
      {/each}
    </div>
  {:else}

  {#each groups as group, groupIndex}
    <section class="settings-nav__group">
      <h3>{group.title}</h3>
      <div class="settings-nav__rows">
        {#each group.items as item}
          {@render navRow(item)}
        {/each}
      </div>
    </section>

    {#if groupIndex === 0}
      <section class="settings-nav__group">
        <h3>{labels.beach}</h3>
        <div class="settings-nav__accordion">
          {#each beachGroups as beachGroup}
            <details
              class="settings-nav__subgroup"
              class:active={isActiveBeachGroup(beachGroup)}
              open={openBeachGroups[beachGroup.id]}
              ontoggle={(event) => {
                openBeachGroups = {
                  ...openBeachGroups,
                  [beachGroup.id]: (event.currentTarget as HTMLDetailsElement).open,
                }
              }}
            >
              <summary
                aria-label={beachGroup.title}
                title={beachGroup.title}
                onclick={(event) => event.preventDefault()}
              >
                <button
                  type="button"
                  class="settings-nav__subgroup-toggle"
                  aria-label={openBeachGroups[beachGroup.id] ? `Chiudi ${beachGroup.title}` : `Apri ${beachGroup.title}`}
                  onclick={(event) => toggleBeachGroup(event, beachGroup.id)}
                >
                  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m6 4 4 4-4 4"></path>
                  </svg>
                </button>
                <span class="settings-nav__subgroup-icon" aria-hidden="true">
                  {#if beachGroup.id === 'map-setup'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 5h16v14H4z"></path>
                      <path d="M8 9h8"></path>
                      <path d="M8 13h5"></path>
                    </svg>
                  {:else if beachGroup.id === 'graphic-libraries'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 5h6v6H4z"></path>
                      <path d="M14 5h6v6h-6z"></path>
                      <path d="M4 15h6v4H4z"></path>
                      <path d="M14 15h6v4h-6z"></path>
                    </svg>
                  {:else if beachGroup.id === 'layout-versions'}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M4 5h6v6H4z"></path>
                      <path d="M14 5h6v6h-6z"></path>
                      <path d="M9 16h10"></path>
                      <path d="M5 16h.01"></path>
                    </svg>
                  {:else}
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="M12 3v6"></path>
                      <path d="M12 15v6"></path>
                      <path d="M3 12h6"></path>
                      <path d="M15 12h6"></path>
                      <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                  {/if}
                </span>
                <button
                  type="button"
                  class="settings-nav__subgroup-title settings-nav__subgroup-title-button"
                  onclick={(event) => openBeachGroupHome(event, beachGroup.id)}
                >
                  {beachGroup.title}
                </button>
                <small>{beachGroup.items.length}</small>
              </summary>
              <div class="settings-nav__rows settings-nav__rows--nested">
                {#each beachGroup.items as item}
                  {@render navRow(item)}
                {/each}
              </div>
            </details>
          {/each}
        </div>
      </section>
    {/if}
  {/each}
  {/if}
</nav>
