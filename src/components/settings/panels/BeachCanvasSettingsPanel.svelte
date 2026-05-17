<script lang="ts">
  import { onMount } from 'svelte'
  import {
    assetMetricDefinitions,
    createDefaultBeachMetricModel,
    mapCanvasConfigStore,
    validateBeachMetricModel,
    validateCurrentCanvasLayout,
    type BeachDistanceRules,
    type BeachMetricModel,
    type MapAssetCodeDisplayMode,
    type MapAssetRowLabelMode,
    type MapAssetRowLabelNumberingMode,
    type MapBackgroundPreset,
    type MapCanvasConfig,
    type MapLabelMode,
  } from '../../../lib/map-canvas'
  import {
    beachLibraryCategories,
    getBeachLibraryItems,
    type BeachLibraryItem,
    type BeachLibraryCategoryId,
  } from '../../../lib/map-canvas/library/assetLibraryCatalog'
  import {
    generatedBeachAssets,
    getGeneratedBeachAssets,
    type GeneratedBeachAsset,
    type GeneratedBeachAssetFamily,
  } from '../../../lib/map-canvas/library/generatedAssetManifest'
  import {
    activateDraftLayout,
    calculateAndSaveDraft,
    createDraftFromActive,
    deleteDraftLayout,
    getArchivedLayoutVersions,
    getLayoutDiffForCurrentDraft,
    getLayoutVersions,
    loadParametricSetupDraft,
    restoreArchivedLayout,
    saveParametricSetupDraft,
  } from '../../../lib/map-canvas/parametric/parametricLayoutRepository'
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { LayoutDiffResult } from '../../../lib/map-canvas/parametric/layoutDiff'
  import type { BeachLayoutVersion } from '../../../lib/map-canvas/parametric/parametricLayoutTypes'
  import type {
    ParametricSetupAssetMetric,
    ParametricSetupRow,
    ParametricSetupState,
    ParametricSetupZone,
  } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import { setParametricLayoutViewMode, type ParametricLayoutViewMode } from '../../../lib/services/beachLayoutService'
  import type { SettingsSection } from '../../../lib/state/settingsMenuState'
  import type { BeachItem, BeachLayout, BeachStatusSummary } from '../../../lib/types/beach'
  import BeachLibraryCategoryList from '../library/BeachLibraryCategoryList.svelte'
  import BeachLibraryItemList from '../library/BeachLibraryItemList.svelte'
  import SettingsControlGroup from '../SettingsControlGroup.svelte'
  import SettingsFieldRow from '../SettingsFieldRow.svelte'
  import SettingsHeader from '../SettingsHeader.svelte'
  import SettingsMetricGrid from '../SettingsMetricGrid.svelte'
  import SettingsSectionCard from '../SettingsSectionCard.svelte'
  import SettingsSurface from '../SettingsSurface.svelte'

  let {
    section,
    appDisplayName,
    layout,
    summary,
    typeSummary,
    items,
    onSectionSelect,
  }: {
    section: SettingsSection
    appDisplayName: string
    layout: BeachLayout | null
    summary: BeachStatusSummary
    typeSummary: { palms: number; umbrellas: number; smallPalms: number }
    items: BeachItem[]
    onSectionSelect: (section: SettingsSection) => void
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

  const updateBeach = <K extends keyof MapCanvasConfig['beach']>(
    key: K,
    value: MapCanvasConfig['beach'][K],
  ) => updateConfig((config) => ({ ...config, beach: { ...config.beach, [key]: value } }))

  const updateBeachMargin = <K extends keyof MapCanvasConfig['beach']['margins']>(
    key: K,
    value: MapCanvasConfig['beach']['margins'][K],
  ) =>
    updateConfig((config) => ({
      ...config,
      beach: {
        ...config.beach,
        margins: {
          ...config.beach.margins,
          [key]: value,
        },
      },
    }))

  const updateAssets = <K extends keyof MapCanvasConfig['assets']>(
    key: K,
    value: MapCanvasConfig['assets'][K],
  ) => updateConfig((config) => ({ ...config, assets: { ...config.assets, [key]: value } }))

  const updateRowLabelOverride = (rowLabel: string, value: string) =>
    updateConfig((config) => ({
      ...config,
      assets: {
        ...config.assets,
        rowLabelOverrides: {
          ...config.assets.rowLabelOverrides,
          [rowLabel]: value,
        },
      },
    }))

  const updateZones = <K extends keyof MapCanvasConfig['zones']>(
    key: K,
    value: MapCanvasConfig['zones'][K],
  ) => updateConfig((config) => ({ ...config, zones: { ...config.zones, [key]: value } }))

  const updateInteraction = <K extends keyof MapCanvasConfig['interaction']>(
    key: K,
    value: MapCanvasConfig['interaction'][K],
  ) =>
    updateConfig((config) => ({
      ...config,
      interaction:
        key === 'mode' && value === 'work'
          ? { ...config.interaction, mode: 'work', snapPreviewEnabled: false }
          : { ...config.interaction, [key]: value },
      grid:
        key === 'mode' && value === 'edit'
          ? { ...config.grid, visible: true, opacity: Math.max(config.grid.opacity, 0.48) }
          : config.grid,
      zones:
        key === 'mode' && value === 'work'
          ? { ...config.zones, visible: false }
          : config.zones,
      walkways:
        key === 'mode' && value === 'work'
          ? { ...config.walkways, visible: false }
          : config.walkways,
    }))

  const updateRules = <K extends keyof MapCanvasConfig['rules']>(
    key: K,
    value: MapCanvasConfig['rules'][K],
  ) => updateConfig((config) => ({ ...config, rules: { ...config.rules, [key]: value } }))

  const updateWalkways = <K extends keyof MapCanvasConfig['walkways']>(
    key: K,
    value: MapCanvasConfig['walkways'][K],
  ) => updateConfig((config) => ({ ...config, walkways: { ...config.walkways, [key]: value } }))

  const validation = $derived(validateCurrentCanvasLayout({ items, config: $mapCanvasConfigStore }))
  const layoutMetrics = $derived([
    {
      label: 'Dimensioni',
      value: layout
        ? `${layout.widthM}m x ${layout.depthM}m`
        : `${$mapCanvasConfigStore.beach.widthM}m x ${$mapCanvasConfigStore.beach.depthM}m`,
    },
    { label: 'Posti', value: summary.total },
    { label: 'Palme', value: typeSummary.palms },
    { label: 'Ombrelloni', value: typeSummary.umbrellas },
    { label: 'Palme piccole', value: typeSummary.smallPalms },
  ])
  const beachMetricModel = $derived.by<BeachMetricModel>(() => {
    const model = createDefaultBeachMetricModel()
    return {
      ...model,
      beach: {
        ...model.beach,
        widthM: layout?.widthM ?? $mapCanvasConfigStore.beach.widthM,
        depthM: layout?.depthM ?? $mapCanvasConfigStore.beach.depthM,
        seaSide: $mapCanvasConfigStore.beach.seaSide,
        marginsM: {
          top: $mapCanvasConfigStore.beach.margins.topM,
          right: $mapCanvasConfigStore.beach.margins.rightM,
          bottom: $mapCanvasConfigStore.beach.margins.bottomM,
          left: $mapCanvasConfigStore.beach.margins.leftM,
        },
      },
      capacity: {
        totalItems: summary.total,
        palms: typeSummary.palms,
        umbrellas: typeSummary.umbrellas,
        smallPalms: typeSummary.smallPalms,
      },
    }
  })
  const metricValidation = $derived(validateBeachMetricModel({ model: beachMetricModel, items }))
  const rowMetrics = $derived(
    beachMetricModel.rows.map((row) => ({
      ...row,
      actualCount: items.filter((item) => item.rowLabel === row.id).length,
    })),
  )
  const codePrefixes = $derived(beachMetricModel.rows.map((row) => row.id))
  const rowLabelOverrideRows = $derived(
    rowMetrics.map((row, index) => ({
      rowLabel: row.id,
      defaultLabel: String(index + 1),
      description: `${row.label} · ${row.family === 'small_palm' ? 'palme piccole' : row.family === 'umbrella' ? 'ombrelloni' : 'palme'}`,
    })),
  )
  const distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }> = [
    { label: 'Distanza minima palme', key: 'minPalmGapM', hint: 'Spazio tra elementi palma.' },
    { label: 'Distanza minima ombrelloni', key: 'minUmbrellaGapM', hint: 'Spazio tra ombrelloni.' },
    { label: 'Distanza minima palme piccole', key: 'minSmallPalmGapM', hint: 'Spazio tra PM/palmette.' },
    { label: 'Distanza tipi diversi', key: 'minMixedAssetGapM', hint: 'Regola mista draft.' },
    { label: 'Distanza righe palme', key: 'minPalmRowGapM', hint: 'Gap verticale tra righe P.' },
    { label: 'Distanza righe ombrelloni', key: 'minUmbrellaRowGapM', hint: 'Gap verticale tra righe O.' },
    { label: 'Distanza zone', key: 'minZoneGapM', hint: 'Separazione tra zone primarie.' },
    { label: 'Margine bordo', key: 'marginFromBoundaryM', hint: 'Margine generale dai bordi.' },
    { label: 'Margine mare', key: 'marginFromSeaM', hint: 'Fascia visuale lato mare.' },
    { label: 'Margine ingresso', key: 'marginFromEntranceM', hint: 'Fascia tecnica ingresso.' },
  ]
  const libraryCategoryTargets: Partial<Record<BeachLibraryCategoryId, SettingsSection>> = {
    umbrellas: 'beach-library-umbrellas',
    palms: 'beach-library-palms',
    furniture: 'beach-library-furniture',
    map_items: 'beach-library-map-items',
    walkways: 'beach-walkway-materials',
    zones: 'beach-unusable-areas',
    icons_symbols: 'beach-library-icons-symbols',
  }
  const categoryFamilyMap: Partial<Record<BeachLibraryCategoryId, GeneratedBeachAssetFamily>> = {
    umbrellas: 'umbrella',
    palms: 'palm',
    furniture: 'furniture',
    walkways: 'walkway',
  }
  const categoryImportCounts = $derived(
    generatedBeachAssets.reduce<Partial<Record<BeachLibraryCategoryId, number>>>((counts, asset) => {
      const category = asset.family === 'umbrella' ? 'umbrellas' : asset.family === 'palm' ? 'palms' : asset.family === 'walkway' ? 'walkways' : 'furniture'
      counts[category] = (counts[category] ?? 0) + 1
      return counts
    }, {}),
  )
  const realLibraryCategories = $derived(
    beachLibraryCategories.map((category) => {
      const family = categoryFamilyMap[category.id]
      const generated = family ? getGeneratedBeachAssets(family) : []
      return {
        ...category,
        status: generated.length > 0 ? 'available' : category.status,
        availableCount: categoryImportCounts[category.id] ?? category.availableCount,
        plannedCount: generated.length > 0 ? 0 : category.plannedCount,
        previewUrl: generated[0]?.previewUrl,
      }
    }),
  )
  const libraryPageBySection: Partial<
    Record<
      SettingsSection,
      {
        title: string
        description: string
        categoryId: BeachLibraryCategoryId
        note: string
      }
    >
  > = {
    'beach-library-umbrellas': {
      title: 'Ombrelloni',
      description: 'Varianti grafiche e metriche degli ombrelloni.',
      categoryId: 'umbrellas',
      note: 'Le varianti vendibili sono governate dal Listino; qui restano solo materiali tecnici per lo Studio.',
    },
    'beach-library-palms': {
      title: 'Palme',
      description: 'Varianti di chioma, scala e resa dall’alto.',
      categoryId: 'palms',
      note: 'La mappa usa ancora il renderer operativo corrente; qui prepariamo solo la libreria grafica.',
    },
    'beach-library-furniture': {
      title: 'Arredi tecnici',
      description: 'Sagome e materiali non contabili per lo Studio.',
      categoryId: 'furniture',
      note: 'Catalogo preparatorio: gli arredi non sono ancora piazzabili sulla mappa.',
    },
    'beach-library-map-items': {
      title: 'Oggetti tecnici',
      description: 'Elementi tecnici e ostacoli di scena.',
      categoryId: 'map_items',
      note: 'I servizi a pagamento stanno nel Listino; qui restano oggetti tecnici e ostacoli di mappa.',
    },
    'beach-library-icons-symbols': {
      title: 'Icone Studio',
      description: 'Segnaletica, servizi e simboli leggibili in mappa.',
      categoryId: 'icons_symbols',
      note: 'Le icone sono preview UI leggere; il motore operativo resta Canvas.',
    },
    'beach-walkway-materials': {
      title: 'Materiali costruzione',
      description: 'Materiali, larghezze e moduli tecnici dello Studio.',
      categoryId: 'walkways',
      note: 'Nessun materiale viene ancora applicato al layout corrente.',
    },
    'beach-unusable-areas': {
      title: 'Aree non utilizzabili',
      description: 'Template di zona e superfici da escludere dal layout.',
      categoryId: 'zones',
      note: 'La geometria resta futura: qui si definisce solo il catalogo visuale delle aree.',
    },
    'beach-services-obstacles': {
      title: 'Servizi / ostacoli',
      description: 'Servizi fissi, ostacoli e articoli tecnici di mappa.',
      categoryId: 'map_items',
      note: 'Superficie tecnica per oggetti non vendibili dello Studio.',
    },
  }
  const activeLibraryPage = $derived(libraryPageBySection[section])
  const generatedCategory = (asset: GeneratedBeachAsset): BeachLibraryCategoryId =>
    asset.family === 'umbrella'
      ? 'umbrellas'
      : asset.family === 'palm'
        ? 'palms'
        : asset.family === 'walkway'
          ? 'walkways'
          : 'furniture'
  const toLibraryItem = (asset: GeneratedBeachAsset): BeachLibraryItem => ({
    id: asset.id,
    categoryId: generatedCategory(asset),
    label: asset.label,
    description: 'Generato internamente · project_owned',
    status: 'available',
    defaultWidthM: asset.defaultWidthM,
    defaultHeightM: asset.defaultHeightM,
    moduleLengthM: asset.moduleLengthM,
    collisionShape: asset.collisionShape,
    previewKind: asset.id,
    previewUrl: asset.previewUrl,
    source: asset.source,
    license: asset.license,
    requiresAttribution: asset.requiresAttribution,
    qualityStatus: asset.qualityStatus,
    visualStyle: asset.visualStyle,
    palmScaleGroup: asset.palmScaleGroup,
  })
  let libraryViewMode = $state<'grid' | 'list'>('grid')
  let parametricDraftStatus = $state('Configurazione progetto')
  let layoutVersions = $state<BeachLayoutVersion[]>([])
  let layoutDiff = $state<LayoutDiffResult | null>(null)
  let layoutVersionStatus = $state('')
  let selectedLayoutViewMode = $state<ParametricLayoutViewMode>('active')
  let parametricSetup = $state<ParametricSetupState | null>(null)
  let parametricOutput = $state<ParametricLayoutOutput | null>(null)
  const refreshLayoutVersions = async () => {
    layoutVersions = await getLayoutVersions()
    layoutDiff = await getLayoutDiffForCurrentDraft()
  }
  const switchLayoutViewMode = (mode: ParametricLayoutViewMode) => {
    selectedLayoutViewMode = mode
    setParametricLayoutViewMode(mode)
  }
  const createParametricDraft = async () => {
    parametricDraftStatus = 'Creazione bozza…'
    try {
      const draft = await createDraftFromActive()
      parametricSetup = await loadParametricSetupDraft(draft.version.id)
      parametricOutput = null
      parametricDraftStatus = `Configurazione pronta: ${draft.elements.length} elementi`
      await refreshLayoutVersions()
    } catch (error) {
      parametricDraftStatus = error instanceof Error ? error.message : 'Errore creazione bozza'
    }
  }
  const loadCurrentParametricSetup = async () => {
    try {
      const versions = await getLayoutVersions()
      layoutVersions = versions
      layoutDiff = await getLayoutDiffForCurrentDraft()
      const draft = versions.find((version) => version.status === 'draft') ?? (await createDraftFromActive()).version
      parametricSetup = await loadParametricSetupDraft(draft.id)
      parametricOutput = null
      parametricDraftStatus = draft.status === 'draft' ? 'Configurazione pronta' : 'Configurazione creata'
      await refreshLayoutVersions()
    } catch (error) {
      parametricDraftStatus = error instanceof Error ? error.message : 'Setup parametrico non disponibile'
    }
  }
  const patchSetup = (updater: (state: ParametricSetupState) => ParametricSetupState) => {
    if (!parametricSetup) return
    parametricSetup = { ...updater(parametricSetup), status: 'draft_editing' }
    parametricOutput = null
  }
  const numberFromInput = (event: Event) => Number((event.currentTarget as HTMLInputElement).value)
  const textFromInput = (event: Event) => (event.currentTarget as HTMLInputElement).value
  const selectFromInput = (event: Event) => (event.currentTarget as HTMLSelectElement).value
  const updateSetupBeach = <K extends keyof ParametricSetupState['beach']>(
    key: K,
    value: ParametricSetupState['beach'][K],
  ) => patchSetup((state) => ({ ...state, beach: { ...state.beach, [key]: value } }))
  const updateSetupMargin = <K extends keyof ParametricSetupState['beach']['marginsM']>(
    key: K,
    value: ParametricSetupState['beach']['marginsM'][K],
  ) =>
    patchSetup((state) => ({
      ...state,
      beach: { ...state.beach, marginsM: { ...state.beach.marginsM, [key]: value } },
    }))
  const updateSetupZone = (id: string, patch: Partial<ParametricSetupZone>) =>
    patchSetup((state) => ({
      ...state,
      zones: state.zones.map((zone) => (zone.id === id ? { ...zone, ...patch } : zone)),
    }))
  const addSetupZone = () =>
    patchSetup((state) => {
      const id = `zone_custom_${Date.now()}`
      return {
        ...state,
        zones: [
          ...state.zones,
          {
            id,
            label: 'Nuova zona',
            type: 'custom',
            xM: state.beach.marginsM.left,
            yM: state.beach.marginsM.top,
            widthM: Math.max(1, Math.round(state.beach.widthM / 3)),
            heightM: Math.max(1, Math.round(state.beach.depthM / 4)),
            locked: false,
            visible: true,
            allowedAssetFamilies: [],
          },
        ],
      }
    })
  const deleteSetupZone = (id: string) =>
    patchSetup((state) => ({
      ...state,
      zones: state.zones.filter((zone) => zone.id !== id),
      rows: state.rows.map((row) => (row.zoneId === id ? { ...row, zoneId: '' } : row)),
    }))
  const updateSetupRow = (id: string, patch: Partial<ParametricSetupRow>) =>
    patchSetup((state) => ({
      ...state,
      rows: state.rows.map((row) => (row.id === id ? { ...row, ...patch } : row)),
    }))
  const addSetupRow = () =>
    patchSetup((state) => {
      const index = state.rows.length + 1
      return {
        ...state,
        rows: [
          ...state.rows,
          {
            id: `row_custom_${Date.now()}`,
            label: `R${index}`,
            family: 'umbrella',
            zoneId: state.zones[0]?.id ?? '',
            itemCount: 1,
            yM: null,
            minGapM: null,
            distributionMode: 'uniform',
            locked: false,
            assetVariantId: null,
            startMarginM: 0,
            endMarginM: 0,
            distributionAxis: 'x',
          },
        ],
      }
    })
  const deleteSetupRow = (id: string) =>
    patchSetup((state) => ({ ...state, rows: state.rows.filter((row) => row.id !== id) }))
  const updateSetupAsset = (assetId: string, patch: Partial<ParametricSetupAssetMetric>) =>
    patchSetup((state) => ({
      ...state,
      assetMetrics: state.assetMetrics.map((asset) =>
        asset.assetId === assetId ? { ...asset, ...patch } : asset,
      ),
    }))
  const updateSetupDistance = <K extends keyof ParametricSetupState['distanceRules']>(
    key: K,
    value: ParametricSetupState['distanceRules'][K],
  ) => patchSetup((state) => ({ ...state, distanceRules: { ...state.distanceRules, [key]: value } }))
  const metricRowLabel = (row: { label?: string; id?: string }) => row.label ?? row.id ?? ''
  const saveCurrentParametricSetup = async () => {
    if (!parametricSetup) return
    parametricDraftStatus = 'Salvataggio bozza…'
    await saveParametricSetupDraft(parametricSetup)
    parametricDraftStatus = 'Configurazione salvata'
    await refreshLayoutVersions()
  }
  const calculateCurrentParametricSetup = async () => {
    if (!parametricSetup) return
    parametricDraftStatus = 'Verifica in corso…'
    try {
      const output = await calculateAndSaveDraft(parametricSetup)
      parametricOutput = output
      parametricSetup = { ...parametricSetup, status: 'draft_calculated' }
      parametricDraftStatus = `Disposizione calcolata: ${output.elements.length} elementi, ${output.warnings.length} warning`
      switchLayoutViewMode('draft')
      await refreshLayoutVersions()
    } catch (error) {
      parametricDraftStatus = error instanceof Error ? error.message : 'Errore calcolo bozza'
    }
  }
  const activeLayoutVersion = $derived(layoutVersions.find((version) => version.status === 'active') ?? null)
  const draftLayoutVersions = $derived(layoutVersions.filter((version) => version.status === 'draft'))
  const archivedLayoutVersions = $derived(layoutVersions.filter((version) => version.status === 'archived'))
  const deleteDraft = async (versionId: string) => {
    if (!window.confirm('Eliminare questa bozza parametrica?')) return
    await deleteDraftLayout(versionId)
    layoutVersionStatus = 'Bozza eliminata'
    switchLayoutViewMode('active')
    await refreshLayoutVersions()
  }
  const activateDraft = async (versionId: string) => {
    if (!window.confirm('Attivare questa bozza come nuovo layout attivo? Il layout attivo corrente verrà archiviato.')) return
    await activateDraftLayout(versionId)
    layoutVersionStatus = 'Bozza attivata. Layout precedente archiviato.'
    switchLayoutViewMode('active')
    await refreshLayoutVersions()
  }
  const restoreArchived = async (versionId: string) => {
    await restoreArchivedLayout(versionId)
    layoutVersionStatus = 'Archivio ripristinato come bozza'
    switchLayoutViewMode('draft')
    await refreshLayoutVersions()
  }

  const activeLibraryItems = $derived.by<BeachLibraryItem[]>(() => {
    if (!activeLibraryPage) return []
    const family = categoryFamilyMap[activeLibraryPage.categoryId]
    const generated = family ? getGeneratedBeachAssets(family) : []
    return generated.length > 0
      ? generated.map(toLibraryItem)
      : getBeachLibraryItems(activeLibraryPage.categoryId)
  })
  const openEditModeFromLibrary = () => {
    updateInteraction('mode', 'edit')
    onSectionSelect('beach-edit-mode')
  }

  onMount(() => {
    mapCanvasConfigStore.hydrate()
    refreshLayoutVersions().catch(() => {
      layoutVersionStatus = 'Versioni layout non disponibili'
    })
    loadCurrentParametricSetup()
  })
</script>

{#if section === 'beach-configuration'}
  <section class="settings-panel settings-ui-page" aria-label="Configurazione spiaggia">
    <SettingsHeader
      title="Configurazione spiaggia"
      description="Dimensioni, margini, lato mare e layout attivo."
      status="Layout attivo"
    />

    <div class="settings-ui-split settings-ui-split--summary">
      <div class="settings-control-panel">
        <div class="settings-control-panel__title">
          <h3>Modello spiaggia</h3>
          <p>Parametri base del layout versionato. Le modifiche operative passano da bozza parametrica.</p>
        </div>
        <div class="settings-control-list">
          <SettingsFieldRow label="Lato mare" hint="Orientamento visuale">
            <select
              value={$mapCanvasConfigStore.beach.seaSide}
              onchange={(event) =>
                updateBeach('seaSide', (event.currentTarget as HTMLSelectElement).value as MapCanvasConfig['beach']['seaSide'])}
            >
              <option value="top">Alto</option>
              <option value="right">Destra</option>
              <option value="bottom">Basso</option>
              <option value="left">Sinistra</option>
            </select>
          </SettingsFieldRow>
          <SettingsFieldRow label="Orientamento" hint="Bloccato">
            <input value="layout attivo" disabled />
          </SettingsFieldRow>
          <SettingsFieldRow label="Unità" hint="Bloccata">
            <input value="metri" disabled />
          </SettingsFieldRow>
          <SettingsFieldRow label="Margine alto">
            <input type="number" min="0" step="0.25" value={$mapCanvasConfigStore.beach.margins.topM} oninput={(event) => updateBeachMargin('topM', Number((event.currentTarget as HTMLInputElement).value))} />
          </SettingsFieldRow>
          <SettingsFieldRow label="Margine destro">
            <input type="number" min="0" step="0.25" value={$mapCanvasConfigStore.beach.margins.rightM} oninput={(event) => updateBeachMargin('rightM', Number((event.currentTarget as HTMLInputElement).value))} />
          </SettingsFieldRow>
          <SettingsFieldRow label="Margine basso">
            <input type="number" min="0" step="0.25" value={$mapCanvasConfigStore.beach.margins.bottomM} oninput={(event) => updateBeachMargin('bottomM', Number((event.currentTarget as HTMLInputElement).value))} />
          </SettingsFieldRow>
          <SettingsFieldRow label="Margine sinistro">
            <input type="number" min="0" step="0.25" value={$mapCanvasConfigStore.beach.margins.leftM} oninput={(event) => updateBeachMargin('leftM', Number((event.currentTarget as HTMLInputElement).value))} />
          </SettingsFieldRow>
        </div>
      </div>

      <aside class="settings-summary-panel" aria-label="Layout attivo">
        <span>{appDisplayName}</span>
        <strong>{layout ? `${layout.widthM}m x ${layout.depthM}m` : `${$mapCanvasConfigStore.beach.widthM}m x ${$mapCanvasConfigStore.beach.depthM}m`}</strong>
        <dl class="settings-metric-strip">
          {#each layoutMetrics.slice(1) as metric}
            <div>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          {/each}
        </dl>
      </aside>
    </div>
    <SettingsSectionCard title="Bozza parametrica" description="Crea una copia DB versionata del layout attivo. Non attiva e non sovrascrive beach_items." muted>
      <div class="settings-library-callout">
        <span>{parametricDraftStatus}</span>
        <button type="button" onclick={createParametricDraft}>Crea bozza parametrica</button>
      </div>
    </SettingsSectionCard>
    <SettingsSectionCard title="Codici e file" description="Righe derivate dal modello parametrico. Override locale delle label visuali, senza rinominare dati gestionali." muted>
      <div class="settings-control-list settings-control-list--wide">
        <SettingsFieldRow label="Numerazione posti" hint="Solo visuale Canvas">
          <select value={$mapCanvasConfigStore.assets.codeDisplayMode} onchange={(event) => updateAssets('codeDisplayMode', (event.currentTarget as HTMLSelectElement).value as MapAssetCodeDisplayMode)}>
            <option value="sequential_by_family">Progressiva per famiglia</option>
            <option value="stored_code">Codice salvato originale</option>
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Label file" hint="Fuori dagli asset">
          <select value={$mapCanvasConfigStore.assets.rowLabelMode} onchange={(event) => updateAssets('rowLabelMode', (event.currentTarget as HTMLSelectElement).value as MapAssetRowLabelMode)} disabled={$mapCanvasConfigStore.assets.codeDisplayMode === 'stored_code'}>
            <option value="side_badge">Laterale grigio</option>
            <option value="inline">Dentro label</option>
            <option value="hidden">Nascosto</option>
          </select>
        </SettingsFieldRow>
        <SettingsFieldRow label="Numeri file" hint={`Derivato da ${rowLabelOverrideRows.length} righe del modello`}>
          <select value={$mapCanvasConfigStore.assets.rowLabelNumberingMode} onchange={(event) => updateAssets('rowLabelNumberingMode', (event.currentTarget as HTMLSelectElement).value as MapAssetRowLabelNumberingMode)} disabled={$mapCanvasConfigStore.assets.rowLabelMode !== 'side_badge'}>
            <option value="global">Progressive globali</option>
            <option value="by_family">Riparti per zona</option>
          </select>
        </SettingsFieldRow>
        {#each rowLabelOverrideRows as row}
          <SettingsFieldRow label={row.description} hint={`Default ${row.defaultLabel}`}>
            <input
              value={$mapCanvasConfigStore.assets.rowLabelOverrides[row.rowLabel] ?? ''}
              placeholder={row.defaultLabel}
              oninput={(event) => updateRowLabelOverride(row.rowLabel, (event.currentTarget as HTMLInputElement).value)}
            />
          </SettingsFieldRow>
        {/each}
      </div>
    </SettingsSectionCard>
  </section>
{:else if section === 'beach-dimensions-capacity'}
  <section class="settings-panel settings-ui-page settings-measure-registry" aria-label="Registro misure">
    <SettingsHeader title="Registro misure" description="Dimensioni fisiche di ombrelloni, palme, arredi e materiali usati dal motore." status="Registro tecnico" />
    <div class="map-studio-registry-summary">
      <div><span>Superficie</span><strong>{parametricSetup?.beach.widthM ?? beachMetricModel.beach.widthM}m × {parametricSetup?.beach.depthM ?? beachMetricModel.beach.depthM}m</strong></div>
      <div><span>Metriche asset</span><strong>{(parametricSetup?.assetMetrics ?? assetMetricDefinitions).length}</strong></div>
      <div><span>File che usano metriche</span><strong>{parametricSetup?.rows.length ?? rowMetrics.length}</strong></div>
      <div><span>Vincoli distanza</span><strong>{distanceRows.length}</strong></div>
    </div>
    <div class="map-studio-registry-table" role="table" aria-label="Registro misure oggetti">
      <div role="row" class="map-studio-registry-table__head">
        <span>Famiglia</span><span>Variante</span><span>Dimensione</span><span>Collisione</span><span>Usata da</span>
      </div>
      {#each (parametricSetup?.assetMetrics ?? assetMetricDefinitions) as asset}
        <div role="row">
          <span>{asset.family}</span>
          <strong>{asset.label}</strong>
          <span>{asset.defaultDiameterM ? `${asset.defaultDiameterM}m Ø` : `${asset.defaultWidthM}m × ${asset.defaultHeightM}m`}</span>
          <span>{asset.collisionShape}</span>
          <span>{(parametricSetup?.rows ?? rowMetrics).filter((row) => row.family === asset.family).map(metricRowLabel).join(', ') || 'futuro'}</span>
        </div>
      {/each}
    </div>
    <div class="map-studio-registry-table map-studio-registry-table--rules" role="table" aria-label="Vincoli globali">
      <div role="row" class="map-studio-registry-table__head"><span>Regola</span><span>Valore</span><span>Descrizione</span></div>
      {#each distanceRows as row}
        <div role="row"><strong>{row.label}</strong><span>{parametricSetup?.distanceRules[row.key] ?? beachMetricModel.distances[row.key]}m</span><span>{row.hint}</span></div>
      {/each}
    </div>
  </section>
{:else if section === 'beach-distances-distribution'}
  <section class="settings-panel settings-ui-page" aria-label="Distanze e distribuzione">
    <SettingsHeader title="Distanze e distribuzione" description="Distanze minime e spaziatura salvabili nella bozza parametrica." status="Bozza parametrica" />
    <div class="settings-two-column">
      <SettingsSectionCard title="Distanze elementi e righe" description="Parametri preparatori del modello metrico">
        <div class="settings-control-list settings-control-list--wide">
          {#each distanceRows as row}
            <SettingsFieldRow label={row.label} hint={row.hint}>
              <input value={`${beachMetricModel.distances[row.key]} m`} disabled />
            </SettingsFieldRow>
          {/each}
        </div>
      </SettingsSectionCard>
      <SettingsSectionCard title="Distribuzione righe" description="Il layout attuale resta bloccato." muted>
        <div class="settings-planned-list">
          {#each rowMetrics as row}
            <div>
              <span>{row.label}</span>
              <strong>{row.distributionMode === 'existing_locked' ? 'Esistente bloccato' : row.distributionMode}</strong>
            </div>
          {/each}
          <div><span>Distribuzione uniforme</span><strong>Planned</strong></div>
          <div><span>Allineamento centro/bordo</span><strong>Planned</strong></div>
        </div>
      </SettingsSectionCard>
    </div>
  </section>
{:else if section === 'beach-measurements-grid'}
  <section class="settings-panel settings-ui-page" aria-label="Misure e griglia">
    <SettingsHeader title="Misure e griglia" description="Griglia metrica, linee principali e snapping." status="Live" />
    <div class="settings-control-panel settings-control-panel--wide">
      <div class="settings-control-panel__title">
        <h3>Griglia Canvas</h3>
        <p>Rendering immediato. In modalità lavoro resta leggera; in modifica diventa più tecnica.</p>
      </div>
      <div class="settings-control-list settings-control-list--wide">
        <label class="settings-row-toggle"><span>Mostra griglia</span><input type="checkbox" checked={$mapCanvasConfigStore.grid.visible} onchange={(event) => updateGrid('visible', (event.currentTarget as HTMLInputElement).checked)} /></label>
        <SettingsFieldRow label="Passo griglia">
          <input type="number" min="0.25" step="0.25" value={$mapCanvasConfigStore.grid.stepM} oninput={(event) => updateGrid('stepM', Number((event.currentTarget as HTMLInputElement).value))} />
        </SettingsFieldRow>
        <SettingsFieldRow label="Linea maggiore ogni">
          <input type="number" min="1" step="1" value={$mapCanvasConfigStore.grid.majorEveryM} oninput={(event) => updateGrid('majorEveryM', Number((event.currentTarget as HTMLInputElement).value))} />
        </SettingsFieldRow>
        <SettingsFieldRow label="Opacità griglia">
          <input type="range" min="0" max="1" step="0.05" value={$mapCanvasConfigStore.grid.opacity} oninput={(event) => updateGrid('opacity', Number((event.currentTarget as HTMLInputElement).value))} />
        </SettingsFieldRow>
        <label class="settings-row-toggle"><span>Linee maggiori</span><input type="checkbox" checked={$mapCanvasConfigStore.grid.showMajorLines} onchange={(event) => updateGrid('showMajorLines', (event.currentTarget as HTMLInputElement).checked)} /></label>
        <label class="settings-row-toggle"><span>Linee minori</span><input type="checkbox" checked={$mapCanvasConfigStore.grid.showMinorLines} onchange={(event) => updateGrid('showMinorLines', (event.currentTarget as HTMLInputElement).checked)} /></label>
        <SettingsFieldRow label="Passo snapping">
          <input type="number" min="0.1" step="0.1" value={$mapCanvasConfigStore.rules.snapStepM} oninput={(event) => updateRules('snapStepM', Number((event.currentTarget as HTMLInputElement).value))} />
        </SettingsFieldRow>
      </div>
    </div>
  </section>
{:else if section === 'beach-surface'}
  <section class="settings-panel settings-ui-page" aria-label="Sfondi e superficie">
    <SettingsHeader title="Sfondi e superficie" description="Preset, texture e profondità del Canvas." status="Live" />
    <div class="settings-ui-split settings-ui-split--surface">
      <div class="settings-control-panel">
        <div class="settings-control-panel__title">
          <h3>Superficie Canvas</h3>
          <p>Preset e layer visivi applicati in tempo reale alla mappa.</p>
        </div>
        <div class="settings-control-list">
          <SettingsFieldRow label="Preset sfondo">
            <select
              value={$mapCanvasConfigStore.background.preset}
              onchange={(event) => updateBackground('preset', (event.currentTarget as HTMLSelectElement).value as MapBackgroundPreset)}
            >
              <option value="warm_sand">warm_sand</option>
              <option value="soft_aqua">soft_aqua</option>
              <option value="neutral">neutral</option>
              <option value="clean_light">clean_light</option>
              <option value="muted_dark">muted_dark</option>
            </select>
          </SettingsFieldRow>
          <SettingsFieldRow label="Intensità texture">
            <input type="range" min="0" max="1" step="0.05" value={$mapCanvasConfigStore.background.textureIntensity} oninput={(event) => updateBackground('textureIntensity', Number((event.currentTarget as HTMLInputElement).value))} />
          </SettingsFieldRow>
          <label class="settings-row-toggle"><span>Texture leggera</span><input type="checkbox" checked={$mapCanvasConfigStore.background.textureEnabled} onchange={(event) => updateBackground('textureEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
          <label class="settings-row-toggle"><span>Gradiente mare</span><input type="checkbox" checked={$mapCanvasConfigStore.background.seaGradientEnabled} onchange={(event) => updateBackground('seaGradientEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
          <label class="settings-row-toggle"><span>Vignette/profondità</span><input type="checkbox" checked={$mapCanvasConfigStore.background.vignetteEnabled} onchange={(event) => updateBackground('vignetteEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
        </div>
      </div>

      <aside class="surface-preview-panel" aria-label="Anteprima preset superficie">
        <span>Preset attivo</span>
        <strong>{$mapCanvasConfigStore.background.preset}</strong>
        <div class={`surface-preview-strip surface-preview-strip--${$mapCanvasConfigStore.background.preset}`} aria-hidden="true"></div>
        <p>Texture, mare e profondità restano controllati dai toggle qui a sinistra.</p>
      </aside>
    </div>
  </section>
{:else if section === 'beach-rendering-elements'}
  <section class="settings-panel settings-ui-page" aria-label="Rendering elementi">
    <SettingsHeader title="Rendering elementi" description="Marker, label, ombre e selezione degli elementi Canvas." status="Live" />
    <div class="settings-control-panel settings-control-panel--wide">
      <div class="settings-control-panel__title">
        <h3>Renderer Canvas</h3>
        <p>Controlli live sul disegno degli elementi, senza cambiare asset, dati o coordinate.</p>
      </div>
      <div class="settings-control-list settings-control-list--wide">
        <SettingsFieldRow label="Scala elementi">
          <input type="range" min="0.8" max="1.5" step="0.02" value={$mapCanvasConfigStore.assets.scale} oninput={(event) => updateAssets('scale', Number((event.currentTarget as HTMLInputElement).value))} />
        </SettingsFieldRow>
        <SettingsFieldRow label="Label">
          <select value={$mapCanvasConfigStore.assets.labelMode} onchange={(event) => updateAssets('labelMode', (event.currentTarget as HTMLSelectElement).value as MapLabelMode)}>
            <option value="always">Sempre visibili</option>
            <option value="selected">Solo selezionato</option>
            <option value="hidden">Nascoste</option>
          </select>
        </SettingsFieldRow>
        <label class="settings-row-toggle"><span>Ombre</span><input type="checkbox" checked={$mapCanvasConfigStore.assets.shadowsEnabled} onchange={(event) => updateAssets('shadowsEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
        <label class="settings-row-toggle"><span>Label alto contrasto</span><input type="checkbox" checked={$mapCanvasConfigStore.assets.highContrastLabels} onchange={(event) => updateAssets('highContrastLabels', (event.currentTarget as HTMLInputElement).checked)} /></label>
        <label class="settings-row-toggle"><span>Bordo selezione</span><input type="checkbox" checked={$mapCanvasConfigStore.assets.selectedRingEnabled} onchange={(event) => updateAssets('selectedRingEnabled', (event.currentTarget as HTMLInputElement).checked)} /></label>
      </div>
    </div>
  </section>
{:else if section === 'beach-assets'}
  <section class="settings-panel beach-library-shell" aria-label="Asset costruzione">
    <SettingsHeader title="Asset costruzione" description="Materiali e oggetti tecnici per costruire o renderizzare la mappa. Gli articoli vendibili stanno nel Listino." status="Studio" />
    <BeachLibraryCategoryList
      categories={realLibraryCategories}
      targetSections={libraryCategoryTargets}
      onOpen={onSectionSelect}
    />
    <div class="beach-library-note beach-library-note--action">
      <span>Questa area raccoglie asset di costruzione e rendering. Prezzi, stock, dotazioni ed extra si gestiscono dal Listino.</span>
      <button type="button" onclick={openEditModeFromLibrary}>Apri modalità modifica</button>
    </div>
  </section>
{:else if activeLibraryPage}
  <section class="settings-panel beach-library-shell" aria-label={activeLibraryPage.title}>
    <SettingsHeader title={activeLibraryPage.title} description={activeLibraryPage.description}>
      <div class="beach-library-header-switch" aria-label="Vista libreria">
        <span>{activeLibraryItems.length} asset</span>
        <div class="beach-library-viewbar__switch" role="group" aria-label="Modalità visualizzazione">
          <button type="button" class:active={libraryViewMode === 'grid'} onclick={() => (libraryViewMode = 'grid')}>Griglia</button>
          <button type="button" class:active={libraryViewMode === 'list'} onclick={() => (libraryViewMode = 'list')}>Lista</button>
        </div>
      </div>
    </SettingsHeader>
    <BeachLibraryItemList items={activeLibraryItems} groupByPalmScale={activeLibraryPage.categoryId === 'palms'} viewMode={libraryViewMode} showViewbar={false} />
    <div class="beach-library-note beach-library-note--action">
      <span>{activeLibraryPage.note}</span>
      <button type="button" onclick={openEditModeFromLibrary}>Apri modalità modifica</button>
    </div>
  </section>
{:else if section === 'beach-surface-zones'}
  <section class="settings-panel" aria-label="Zone superficie">
    <SettingsSurface>
      <SettingsHeader title="Zone superficie" description="Aree metriche primarie della spiaggia. Editing numerico in bozza parametrica." status="Bozza parametrica" />
      <div class="settings-two-column">
        <SettingsSectionCard title="Rendering zone" description="Controlli visivi senza editor geometrico.">
          <SettingsControlGroup columns={2}>
            <label class="canvas-toggle"><input type="checkbox" checked={$mapCanvasConfigStore.zones.visible} onchange={(event) => updateZones('visible', (event.currentTarget as HTMLInputElement).checked)} /> Mostra zone</label>
            <SettingsFieldRow label="Opacità zone">
              <input type="range" min="0" max="0.5" step="0.02" value={$mapCanvasConfigStore.zones.opacity} oninput={(event) => updateZones('opacity', Number((event.currentTarget as HTMLInputElement).value))} />
            </SettingsFieldRow>
            <label class="canvas-toggle"><input type="checkbox" checked={$mapCanvasConfigStore.zones.showLabels} onchange={(event) => updateZones('showLabels', (event.currentTarget as HTMLInputElement).checked)} /> Label zone</label>
          </SettingsControlGroup>
        </SettingsSectionCard>
        <SettingsSectionCard title="Zone metriche primarie" description="Contratto parametrico della superficie." muted>
          <div class="settings-planned-list">
            {#each beachMetricModel.zones as zone}
              <div>
                <span>{zone.label}</span>
                <strong>{zone.geometry === 'rect' ? `${zone.widthM}m x ${zone.heightM}m` : 'Poligono futuro'}</strong>
              </div>
            {/each}
          </div>
        </SettingsSectionCard>
      </div>
    </SettingsSurface>
  </section>
{:else if section === 'beach-walkways'}
	  <section class="settings-panel" aria-label="Passerelle">
	    <SettingsSurface>
	      <SettingsHeader title="Passerelle" description="Impostazioni draft pronte per le wave editor future." status="Planned" />
	      <SettingsSectionCard title="Preset passerelle" description="Stato configurabile, nessun salvataggio layout.">
	        <SettingsControlGroup columns={2}>
	          <label class="canvas-toggle"><input type="checkbox" checked={$mapCanvasConfigStore.walkways.visible} onchange={(event) => updateWalkways('visible', (event.currentTarget as HTMLInputElement).checked)} /> Mostra passerelle</label>
	          <SettingsFieldRow label="Larghezza default">
	            <input type="number" min="0.5" step="0.1" value={$mapCanvasConfigStore.walkways.defaultWidthM} oninput={(event) => updateWalkways('defaultWidthM', Number((event.currentTarget as HTMLInputElement).value))} />
	          </SettingsFieldRow>
	          <SettingsFieldRow label="Lunghezza modulo">
	            <input type="number" min="0.5" step="0.1" value={$mapCanvasConfigStore.walkways.moduleLengthM} oninput={(event) => updateWalkways('moduleLengthM', Number((event.currentTarget as HTMLInputElement).value))} />
	          </SettingsFieldRow>
	          <SettingsFieldRow label="Materiale">
	            <select value={$mapCanvasConfigStore.walkways.material} onchange={(event) => updateWalkways('material', (event.currentTarget as HTMLSelectElement).value as MapCanvasConfig['walkways']['material'])}><option value="wood">Legno</option><option value="composite">Composito</option><option value="stone">Pietra</option></select>
	          </SettingsFieldRow>
	        </SettingsControlGroup>
	      </SettingsSectionCard>
	    </SettingsSurface>
	  </section>
	{:else if section === 'beach-layout-rules'}
	  <section class="settings-panel" aria-label="Regole layout">
	    <SettingsSurface>
	      <SettingsHeader title="Regole layout" description="Regole draft lette dalla validazione, senza drag o salvataggio." status="Draft" />
	      <SettingsSectionCard title="Vincoli tecnici" description="Preparano il validatore e i tool futuri.">
	        <SettingsControlGroup columns={2}>
	          <label class="canvas-toggle"><input type="checkbox" checked={$mapCanvasConfigStore.rules.collisionEnabled} onchange={(event) => updateRules('collisionEnabled', (event.currentTarget as HTMLInputElement).checked)} /> Collisioni</label>
	          <SettingsFieldRow label="Distanza stesso tipo"><input type="number" min="0" step="0.1" value={$mapCanvasConfigStore.rules.minDistanceSameTypeM} oninput={(event) => updateRules('minDistanceSameTypeM', Number((event.currentTarget as HTMLInputElement).value))} /></SettingsFieldRow>
	          <SettingsFieldRow label="Distanza tipi diversi"><input type="number" min="0" step="0.1" value={$mapCanvasConfigStore.rules.minDistanceDifferentTypeM} oninput={(event) => updateRules('minDistanceDifferentTypeM', Number((event.currentTarget as HTMLInputElement).value))} /></SettingsFieldRow>
	          <SettingsFieldRow label="Margine dal bordo"><input type="number" min="0" step="0.1" value={$mapCanvasConfigStore.rules.marginFromBoundaryM} oninput={(event) => updateRules('marginFromBoundaryM', Number((event.currentTarget as HTMLInputElement).value))} /></SettingsFieldRow>
	          <SettingsFieldRow label="Passo snapping"><input type="number" min="0.1" step="0.1" value={$mapCanvasConfigStore.rules.snapStepM} oninput={(event) => updateRules('snapStepM', Number((event.currentTarget as HTMLInputElement).value))} /></SettingsFieldRow>
	        </SettingsControlGroup>
	      </SettingsSectionCard>
	    </SettingsSurface>
	  </section>
{:else if section === 'beach-layout-validation'}
  <section class="settings-panel" aria-label="Validazione layout">
    <SettingsSurface>
      <SettingsHeader title="Validazione layout" description="Controlli tecnici sul layout corrente proiettato sul Canvas." status="Tecnico" />
      <div class="settings-two-column">
        <SettingsSectionCard title="Conteggi" description="Contratto layout corrente">
          <SettingsMetricGrid
            metrics={[
              { label: 'Totale', value: validation.total },
              ...codePrefixes.map((prefix) => ({ label: prefix, value: validation.byCodePrefix[prefix] ?? 0 })),
            ]}
          />
        </SettingsSectionCard>
        <SettingsSectionCard title="Messaggi" description="Errori, warning e note tecniche" muted>
          <div class="canvas-validation-list">
            {#each validation.messages as message}
              <div class={`canvas-validation-row canvas-validation-row--${message.severity}`}>
                <strong>{message.severity}</strong>
                <span>{message.title}</span>
                <small>{message.detail}</small>
              </div>
            {/each}
          </div>
        </SettingsSectionCard>
      </div>
    </SettingsSurface>
  </section>
	{:else if section === 'beach-layout-versions'}
	  <section class="settings-panel" aria-label="Configurazioni salvate">
	    <SettingsSurface>
	      <SettingsHeader title="Configurazioni salvate" description="Mappe, bozze, archivio, export e backup configurazione." status="Mappe salvate" />
        <SettingsSectionCard title="Carica configurazione" description="Scegli quale sorgente coordinate mostrare sulla mappa.">
          <div class="canvas-segmented">
            <button type="button" class:active={selectedLayoutViewMode === 'active'} onclick={() => switchLayoutViewMode('active')}>Layout attivo</button>
            <button type="button" class:active={selectedLayoutViewMode === 'draft'} disabled={draftLayoutVersions.length === 0} onclick={() => switchLayoutViewMode('draft')}>Bozza parametrica</button>
            <button type="button" class:active={selectedLayoutViewMode === 'compare'} disabled={draftLayoutVersions.length === 0} onclick={() => switchLayoutViewMode('compare')}>Confronto</button>
          </div>
        </SettingsSectionCard>
        <div class="settings-two-column">
          <SettingsSectionCard title="Layout attivo" description="Versione operativa letta dal Canvas.">
            <div class="settings-planned-list">
              {#if activeLayoutVersion}
                <div><span>{activeLayoutVersion.name}</span><strong>{activeLayoutVersion.source}</strong></div>
                <div><span>Creato</span><strong>{new Date(activeLayoutVersion.createdAt).toLocaleString('it-IT')}</strong></div>
                <div><span>Attivato</span><strong>{activeLayoutVersion.activatedAt ? new Date(activeLayoutVersion.activatedAt).toLocaleString('it-IT') : '—'}</strong></div>
              {:else}
                <div><span>Layout attivo</span><strong>Non caricato</strong></div>
              {/if}
            </div>
          </SettingsSectionCard>
          <SettingsSectionCard title="Diff active / draft" description="Summary delle differenze prima di attivare." muted>
            <SettingsMetricGrid
              metrics={layoutDiff
                ? [
                    { label: 'Elementi', value: layoutDiff.summary.totalElements },
                    { label: 'Mossi', value: layoutDiff.summary.movedElements },
                    { label: 'Aggiunti', value: layoutDiff.summary.addedElements },
                    { label: 'Rimossi', value: layoutDiff.summary.removedElements },
                    { label: 'Righe', value: layoutDiff.summary.rowChanges },
                    { label: 'Zone', value: layoutDiff.summary.zoneChanges },
                    { label: 'Warning', value: layoutDiff.summary.warnings },
                  ]
                : [
                    { label: 'Bozza', value: draftLayoutVersions.length ? 'Disponibile' : 'Assente' },
                    { label: 'Confronto', value: draftLayoutVersions.length ? 'Pronto' : 'Crea bozza' },
                  ]}
            />
          </SettingsSectionCard>
        </div>
        <SettingsSectionCard title="Bozze" description="Visualizza, modifica, duplica, attiva o elimina una configurazione draft.">
          <div class="settings-planned-list">
            {#if draftLayoutVersions.length === 0}
              <div><span>Nessuna bozza</span><strong>Crea bozza parametrica</strong></div>
            {:else}
              {#each draftLayoutVersions as version}
                <div>
                  <span>{version.name}</span>
                  <strong>{new Date(version.updatedAt).toLocaleString('it-IT')}</strong>
                  <button type="button" onclick={() => switchLayoutViewMode('draft')}>Visualizza</button>
                  <button type="button" onclick={() => switchLayoutViewMode('compare')}>Confronta</button>
                  <button type="button" onclick={() => activateDraft(version.id)}>Attiva</button>
                  <button type="button" onclick={() => deleteDraft(version.id)}>Elimina</button>
                </div>
              {/each}
            {/if}
          </div>
        </SettingsSectionCard>
        <SettingsSectionCard title="Archivio e backup" description="Ripristino, duplicazione, export JSON e backup configurazione.">
          <div class="settings-planned-list">
            {#if archivedLayoutVersions.length === 0}
              <div><span>Archivio</span><strong>Vuoto</strong></div>
            {:else}
              {#each archivedLayoutVersions as version}
                <div>
                  <span>{version.name}</span>
                  <strong>{new Date(version.updatedAt).toLocaleString('it-IT')}</strong>
                  <button type="button" onclick={() => restoreArchived(version.id)}>Ripristina come bozza</button>
                </div>
              {/each}
            {/if}
          </div>
        </SettingsSectionCard>
        <SettingsSectionCard title="Export / import" description="Direzione configurazioni salvate: backup locale e scambio JSON." muted>
          <div class="settings-planned-list">
            <div><span>Esporta JSON</span><strong>Preparato</strong></div>
            <div><span>Importa JSON</span><strong>Preparato</strong></div>
            <div><span>Backup configurazione</span><strong>Preparato</strong></div>
          </div>
        </SettingsSectionCard>
        {#if layoutVersionStatus}
          <div class="beach-library-note beach-library-note--action"><span>{layoutVersionStatus}</span></div>
        {/if}
	    </SettingsSurface>
	  </section>
{:else if section === 'beach-edit-mode'}
  <section class="settings-panel" aria-label="Modalità modifica">
    <SettingsSurface>
      <SettingsHeader title="Modalità Canvas" description="Lavoro operativo separato dai controlli tecnici di modifica." status={$mapCanvasConfigStore.interaction.mode === 'edit' ? 'Modifica attiva' : 'Lavoro'} />
      <div class="canvas-mode-stack">
        <div class="canvas-mode-row canvas-mode-row--primary">
          <div>
            <strong>Modalità corrente</strong>
            <span>{$mapCanvasConfigStore.interaction.mode === 'edit' ? 'Canvas Studio e controlli tecnici abilitati.' : 'Operatività cliente/prenotazione senza strumenti editor.'}</span>
          </div>
          <div class="canvas-segmented">
            <button type="button" class:active={$mapCanvasConfigStore.interaction.mode === 'work'} onclick={() => updateInteraction('mode', 'work')}>Lavoro</button>
            <button type="button" class:active={$mapCanvasConfigStore.interaction.mode === 'edit'} onclick={() => updateInteraction('mode', 'edit')}>Modifica</button>
          </div>
        </div>
        <div class="canvas-mode-row">
          <div>
            <strong>Canvas Studio</strong>
            <span>Aprendo CS dalla mappa si entra automaticamente in modalità modifica. Tornando a Lavoro, CS viene chiuso.</span>
          </div>
          <button type="button" onclick={() => updateInteraction('mode', 'edit')}>Prepara modifica</button>
        </div>
        <div class="canvas-mode-row">
          <div>
            <strong>Navigazione</strong>
            <span>Pan e zoom sono navigazione. Snapping preview resta un controllo tecnico di modifica.</span>
          </div>
          <div class="canvas-mode-toggles">
            <label><input type="checkbox" checked={$mapCanvasConfigStore.interaction.panEnabled} onchange={(event) => updateInteraction('panEnabled', (event.currentTarget as HTMLInputElement).checked)} /> Pan</label>
            <label><input type="checkbox" checked={$mapCanvasConfigStore.interaction.zoomEnabled} onchange={(event) => updateInteraction('zoomEnabled', (event.currentTarget as HTMLInputElement).checked)} /> Zoom</label>
            <label class:disabled={$mapCanvasConfigStore.interaction.mode === 'work'}><input type="checkbox" disabled={$mapCanvasConfigStore.interaction.mode === 'work'} checked={$mapCanvasConfigStore.interaction.snapPreviewEnabled} onchange={(event) => updateInteraction('snapPreviewEnabled', (event.currentTarget as HTMLInputElement).checked)} /> Snapping</label>
          </div>
        </div>
      </div>
    </SettingsSurface>
  </section>
{/if}
