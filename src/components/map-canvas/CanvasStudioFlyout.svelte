<script lang="ts">
  import {
    getBeachLibraryItems,
    beachLibraryCategories,
    type BeachLibraryCategoryId,
  } from '../../lib/map-canvas/library/assetLibraryCatalog'
  import {
    getGeneratedBeachAssets,
    type GeneratedBeachAssetFamily,
  } from '../../lib/map-canvas/library/generatedAssetManifest'
  import {
    mapCanvasConfigStore,
    validateCurrentCanvasLayout,
    type MapBackgroundPreset,
    type MapCanvasConfig,
    type MapCanvasStudioToolId,
    type MapLabelMode,
  } from '../../lib/map-canvas'
  import type { BeachItem } from '../../lib/types/beach'
  import BeachLibraryPreviewIcon from '../settings/library/BeachLibraryPreviewIcon.svelte'
  import CanvasStudioMiniPanel from './CanvasStudioMiniPanel.svelte'

  let {
    activeToolId,
    items,
  }: {
    activeToolId: MapCanvasStudioToolId
    items: BeachItem[]
  } = $props()

  const updateConfig = (updater: (config: MapCanvasConfig) => MapCanvasConfig) => {
    mapCanvasConfigStore.updateConfig(updater)
  }

  const updateGrid = <K extends keyof MapCanvasConfig['grid']>(
    key: K,
    value: MapCanvasConfig['grid'][K],
  ) => updateConfig((config) => ({ ...config, grid: { ...config.grid, [key]: value } }))

  const updateBackground = <K extends keyof MapCanvasConfig['background']>(
    key: K,
    value: MapCanvasConfig['background'][K],
  ) => updateConfig((config) => ({ ...config, background: { ...config.background, [key]: value } }))

  const updateAssets = <K extends keyof MapCanvasConfig['assets']>(
    key: K,
    value: MapCanvasConfig['assets'][K],
  ) => updateConfig((config) => ({ ...config, assets: { ...config.assets, [key]: value } }))

  const validation = $derived(validateCurrentCanvasLayout({ items, config: $mapCanvasConfigStore }))
  const validationErrors = $derived(validation.messages.filter((message) => message.severity === 'error').length)
  const validationWarnings = $derived(validation.messages.filter((message) => message.severity === 'warning').length)
  const assetCategories = $derived(
    beachLibraryCategories
      .filter((category) =>
        ['umbrellas', 'palms', 'furniture', 'map_items'].includes(category.id),
      )
      .map((category) => {
        const family = category.id === 'umbrellas' ? 'umbrella' : category.id === 'palms' ? 'palm' : category.id === 'furniture' ? 'furniture' : undefined
        const generated = family ? getGeneratedBeachAssets(family as GeneratedBeachAssetFamily) : []
        return { ...category, availableCount: generated.length, plannedCount: generated.length ? 0 : category.plannedCount, previewUrl: generated[0]?.previewUrl }
      }),
  )

  const libraryCategoryByTool: Partial<Record<MapCanvasStudioToolId, BeachLibraryCategoryId>> = {
    umbrellas: 'umbrellas',
    palms: 'palms',
    zones: 'zones',
    walkways: 'walkways',
  }
  const activeLibraryCategoryId = $derived(libraryCategoryByTool[activeToolId])
  const activeLibraryItems = $derived.by(() => {
    if (!activeLibraryCategoryId) return []
    const family = activeLibraryCategoryId === 'umbrellas' ? 'umbrella' : activeLibraryCategoryId === 'palms' ? 'palm' : activeLibraryCategoryId === 'walkways' ? 'walkway' : activeLibraryCategoryId === 'furniture' ? 'furniture' : undefined
    const generated = family ? getGeneratedBeachAssets(family as GeneratedBeachAssetFamily) : []
    return generated.length > 0 ? generated : getBeachLibraryItems(activeLibraryCategoryId)
  })
</script>

<aside class="canvas-studio-flyout" aria-label="Pannello Canvas Studio">
  {#if activeToolId === 'surface'}
    <CanvasStudioMiniPanel title="Superficie" description="Preset e layer visivi mentre guardi la mappa." status="Live">
      <label class="canvas-studio-field">
        <span>Preset sfondo</span>
        <select
          value={$mapCanvasConfigStore.background.preset}
          onchange={(event) =>
            updateBackground('preset', (event.currentTarget as HTMLSelectElement).value as MapBackgroundPreset)}
        >
          <option value="warm_sand">warm_sand</option>
          <option value="soft_aqua">soft_aqua</option>
          <option value="neutral">neutral</option>
          <option value="clean_light">clean_light</option>
          <option value="muted_dark">muted_dark</option>
        </select>
      </label>
      <label class="canvas-studio-toggle"><span>Texture</span><input type="checkbox" checked={$mapCanvasConfigStore.background.textureEnabled} onchange={(event) => updateBackground('textureEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
      <label class="canvas-studio-toggle"><span>Gradiente mare</span><input type="checkbox" checked={$mapCanvasConfigStore.background.seaGradientEnabled} onchange={(event) => updateBackground('seaGradientEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
      <label class="canvas-studio-toggle"><span>Vignette</span><input type="checkbox" checked={$mapCanvasConfigStore.background.vignetteEnabled} onchange={(event) => updateBackground('vignetteEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
    </CanvasStudioMiniPanel>
  {:else if activeToolId === 'grid'}
    <CanvasStudioMiniPanel title="Griglia" description="Controlli rapidi della griglia metrica." status="Live">
      <label class="canvas-studio-toggle"><span>Mostra griglia</span><input type="checkbox" checked={$mapCanvasConfigStore.grid.visible} onchange={(event) => updateGrid('visible', (event.currentTarget as HTMLInputElement).checked)} /></label>
      <label class="canvas-studio-field">
        <span>Opacità</span>
        <input type="range" min="0" max="1" step="0.05" value={$mapCanvasConfigStore.grid.opacity} oninput={(event) => updateGrid('opacity', Number((event.currentTarget as HTMLInputElement).value))} />
      </label>
      <label class="canvas-studio-field">
        <span>Passo griglia</span>
        <input type="number" min="0.25" step="0.25" value={$mapCanvasConfigStore.grid.stepM} oninput={(event) => updateGrid('stepM', Number((event.currentTarget as HTMLInputElement).value))} />
      </label>
      <label class="canvas-studio-toggle"><span>Linee maggiori</span><input type="checkbox" checked={$mapCanvasConfigStore.grid.showMajorLines} onchange={(event) => updateGrid('showMajorLines', (event.currentTarget as HTMLInputElement).checked)} /></label>
      <label class="canvas-studio-toggle"><span>Linee minori</span><input type="checkbox" checked={$mapCanvasConfigStore.grid.showMinorLines} onchange={(event) => updateGrid('showMinorLines', (event.currentTarget as HTMLInputElement).checked)} /></label>
    </CanvasStudioMiniPanel>
  {:else if activeToolId === 'rendering'}
    <CanvasStudioMiniPanel title="Rendering elementi" description="Marker, label, ombre e selezione Canvas." status="Live">
      <label class="canvas-studio-field">
        <span>Scala elementi</span>
        <input type="range" min="0.8" max="1.5" step="0.02" value={$mapCanvasConfigStore.assets.scale} oninput={(event) => updateAssets('scale', Number((event.currentTarget as HTMLInputElement).value))} />
      </label>
      <label class="canvas-studio-field">
        <span>Label</span>
        <select value={$mapCanvasConfigStore.assets.labelMode} onchange={(event) => updateAssets('labelMode', (event.currentTarget as HTMLSelectElement).value as MapLabelMode)}>
          <option value="always">Sempre</option>
          <option value="selected">Solo selezionato</option>
          <option value="hidden">Nascoste</option>
        </select>
      </label>
      <label class="canvas-studio-toggle"><span>Ombre</span><input type="checkbox" checked={$mapCanvasConfigStore.assets.shadowsEnabled} onchange={(event) => updateAssets('shadowsEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
      <label class="canvas-studio-toggle"><span>Bordo selezione</span><input type="checkbox" checked={$mapCanvasConfigStore.assets.selectedRingEnabled} onchange={(event) => updateAssets('selectedRingEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
    </CanvasStudioMiniPanel>
  {:else if activeToolId === 'assets'}
    <CanvasStudioMiniPanel title="Asset" description="Home rapida della libreria grafica Canvas." status="Read-only">
      <div class="canvas-studio-library-list">
        {#each assetCategories as category}
          <div class="canvas-studio-library-row">
            <BeachLibraryPreviewIcon kind={category.previewKind} src={category.previewUrl} />
            <span>
              <strong>{category.label}</strong>
              <small>{category.availableCount} disponibili · {category.plannedCount} previsti</small>
            </span>
          </div>
        {/each}
      </div>
    </CanvasStudioMiniPanel>
  {:else if activeLibraryCategoryId}
    <CanvasStudioMiniPanel
      title={activeToolId === 'walkways' ? 'Passerelle' : activeToolId === 'zones' ? 'Zone' : activeToolId === 'palms' ? 'Palme' : 'Ombrelloni'}
      description="Varianti di libreria visibili nel Canvas Studio. Non operative sulla mappa."
      status={activeToolId === 'zones' || activeToolId === 'walkways' ? 'Previsto' : 'Library'}
    >
      <div class="canvas-studio-library-list">
        {#each activeLibraryItems.slice(0, 6) as item}
          <div class="canvas-studio-library-row">
            <BeachLibraryPreviewIcon kind={'previewKind' in item ? item.previewKind : item.id} src={'previewUrl' in item ? item.previewUrl : undefined} />
            <span>
              <strong>{item.label}</strong>
              <small>{'license' in item ? `Generato · ${item.license}` : item.status === 'available' ? 'Disponibile' : 'Previsto'}</small>
            </span>
          </div>
        {/each}
      </div>
      <p class="canvas-studio-note">Catalogo statico: nessuna variante cambia il renderer operativo.</p>
    </CanvasStudioMiniPanel>
  {:else}
    <CanvasStudioMiniPanel title="Valida" description="Sintesi read-only del layout corrente." status={validationErrors ? 'Errori' : validationWarnings ? 'Warning' : 'OK'}>
      <div class="canvas-studio-validation-grid">
        <div><span>Elementi</span><strong>{validation.total}</strong></div>
        <div><span>Errori</span><strong>{validationErrors}</strong></div>
        <div><span>Warning</span><strong>{validationWarnings}</strong></div>
      </div>
      <p class="canvas-studio-note">
        {validationErrors === 0 && validationWarnings === 0
          ? 'Layout corrente coerente con i controlli read-only.'
          : 'Apri Validazione layout nelle impostazioni per il dettaglio completo.'}
      </p>
    </CanvasStudioMiniPanel>
  {/if}
</aside>
