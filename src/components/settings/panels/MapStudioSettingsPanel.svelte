<script lang="ts">
  import { onMount } from 'svelte'
  import { type BeachDistanceRules } from '../../../lib/map-canvas'
  import {
    calculateAndSaveDraft,
    createDraftFromActive,
    getLayoutDiffForCurrentDraft,
    getLayoutVersions,
    loadParametricSetupDraft,
    saveParametricSetupDraft,
  } from '../../../lib/map-canvas/parametric/parametricLayoutRepository'
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { BeachLayoutVersion } from '../../../lib/map-canvas/parametric/parametricLayoutTypes'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import { setParametricLayoutViewMode, type ParametricLayoutViewMode } from '../../../lib/services/beachLayoutService'
  import MapStudioPanel from '../map-studio/MapStudioPanel.svelte'

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

  let status = $state('Caricamento configurazione progetto...')
  let layoutVersions = $state<BeachLayoutVersion[]>([])
  let setup = $state<ParametricSetupState | null>(null)
  let output = $state<ParametricLayoutOutput | null>(null)

  const draftLayoutVersions = $derived(layoutVersions.filter((version) => version.status === 'draft'))

  const switchLayoutViewMode = (mode: ParametricLayoutViewMode) => {
    setParametricLayoutViewMode(mode)
  }

  const refreshLayoutVersions = async () => {
    layoutVersions = await getLayoutVersions()
    await getLayoutDiffForCurrentDraft()
  }

  const loadStudioSetup = async () => {
    status = 'Caricamento configurazione progetto...'
    try {
      const versions = await getLayoutVersions()
      layoutVersions = versions
      const draft = versions.find((version) => version.status === 'draft') ?? (await createDraftFromActive()).version
      setup = await loadParametricSetupDraft(draft.id)
      output = null
      status = 'Configurazione pronta'
      await refreshLayoutVersions()
    } catch (error) {
      status = error instanceof Error ? error.message : 'Setup parametrico non disponibile'
      setup = null
    }
  }

  const patchSetup = (updater: (state: ParametricSetupState) => ParametricSetupState) => {
    if (!setup) return
    setup = { ...updater(setup), status: 'draft_editing' }
    output = null
    status = 'Verifica da aggiornare'
  }

  const updateDistance = <K extends keyof ParametricSetupState['distanceRules']>(
    key: K,
    value: ParametricSetupState['distanceRules'][K],
  ) => patchSetup((state) => ({ ...state, distanceRules: { ...state.distanceRules, [key]: value } }))

  const saveSetup = async () => {
    if (!setup) return
    status = 'Salvataggio configurazione...'
    await saveParametricSetupDraft(setup)
    status = 'Configurazione salvata'
    await refreshLayoutVersions()
  }

  const calculateSetup = async () => {
    if (!setup) return
    status = 'Verifica in corso...'
    try {
      const nextOutput = await calculateAndSaveDraft(setup)
      output = nextOutput
      setup = { ...setup, status: 'draft_calculated' }
      status = `Verifica completata: ${nextOutput.elements.length} elementi, ${nextOutput.warnings.length} warning`
      switchLayoutViewMode('draft')
      await refreshLayoutVersions()
    } catch (error) {
      status = error instanceof Error ? error.message : 'Errore verifica layout'
    }
  }

  onMount(() => {
    loadStudioSetup()
  })
</script>

<section class="settings-panel settings-ui-page parametric-setup-page" aria-label="Studio mappa">
  <MapStudioPanel
    {setup}
    {output}
    {status}
    {distanceRows}
    draftAvailable={draftLayoutVersions.length > 0}
    onReload={loadStudioSetup}
    onSave={saveSetup}
    onCalculate={calculateSetup}
    onShowDraft={() => switchLayoutViewMode('draft')}
    onUpdateDistance={updateDistance}
  />
</section>
