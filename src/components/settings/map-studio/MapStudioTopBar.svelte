<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import { projectModelElementCount } from './state/mapStudioProjectModel'
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'

  let {
    setup,
    output = null,
    status,
    draftAvailable,
    projectState,
    lifecycle,
    onSave,
    onCalculate,
    onShowDraft,
    onExitProject,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    status: string
    draftAvailable: boolean
    projectState: MapStudioProjectState
    lifecycle: MapStudioLifecycleModel
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
    onExitProject: () => void
  } = $props()

  const elementCount = $derived(projectModelElementCount(projectState.projectModel))
  const warningCount = $derived(output?.warnings.length ?? 0)
  const statusLabel = $derived(
    lifecycle.stateLabel || status,
  )
  const saveDisabledReason = $derived(projectState.dirtyState === 'dirty' || projectState.projectDraft.dirty ? '' : 'Nessuna modifica progetto da salvare.')
  const verifyDisabledReason = $derived(lifecycle.completeness.canVerify ? '' : 'Completa perimetro, aree, tracciati, ingombri e vincoli prima della verifica.')
  const previewDisabledReason = $derived(lifecycle.completeness.previewReady ? '' : 'Anteprima non ancora disponibile.')
</script>

<header class="map-studio-topbar">
  <button type="button" class="map-studio-topbar__back" onclick={onExitProject} aria-label="Torna ai progetti">
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M15 18 9 12l6-6" />
    </svg>
    <span>Progetti</span>
  </button>
  <div class="map-studio-topbar__title">
    <span class="map-studio-topbar__breadcrumb">Studio mappa / {lifecycle.modeLabel}</span>
    <strong>{lifecycle.stageLabel}</strong>
    <span>{setup.beach.widthM}m × {setup.beach.depthM}m · {elementCount} elementi · {warningCount} warning · layout attivo protetto · {statusLabel}</span>
  </div>
  <div class="map-studio-topbar__actions" aria-label="Azioni Studio mappa">
    <button type="button" onclick={onSave} disabled={Boolean(saveDisabledReason)} title={saveDisabledReason || 'Salva configurazione progetto'}>Salva</button>
    <button type="button" class="primary" onclick={onCalculate} disabled={Boolean(verifyDisabledReason)} title={verifyDisabledReason || 'Esegui verifica progetto'}>Verifica</button>
    <button type="button" onclick={onShowDraft} disabled={Boolean(previewDisabledReason) || !draftAvailable} title={previewDisabledReason || 'Apri anteprima'}>Apri anteprima</button>
  </div>
</header>
