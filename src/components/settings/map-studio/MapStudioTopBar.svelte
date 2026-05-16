<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'

  let {
    setup,
    output = null,
    status,
    draftAvailable,
    projectState,
    onSave,
    onCalculate,
    onShowDraft,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    status: string
    draftAvailable: boolean
    projectState: MapStudioProjectState
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
  } = $props()

  const elementCount = $derived(output?.elements.length ?? setup.rows.reduce((total, row) => total + row.itemCount, 0))
  const warningCount = $derived(output?.warnings.length ?? 0)
  const statusLabel = $derived(
    projectState.previewState === 'available'
      ? 'Anteprima disponibile'
      : projectState.dirtyState === 'dirty'
        ? 'Verifica da aggiornare'
        : status,
  )
</script>

<header class="map-studio-topbar">
  <div class="map-studio-topbar__title">
    <strong>Studio mappa</strong>
    <span>Layout parametrico · Configurazione progetto · {setup.beach.widthM}m × {setup.beach.depthM}m · {elementCount} elementi · {warningCount} warning · {statusLabel}</span>
  </div>
  <div class="map-studio-topbar__actions" aria-label="Azioni Studio mappa">
    <button type="button" onclick={onSave}>Salva</button>
    <button type="button" class="primary" onclick={onCalculate}>Verifica</button>
    <button type="button" onclick={onShowDraft} disabled={!draftAvailable}>Anteprima</button>
  </div>
</header>
