<script lang="ts">
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import type { MapStudioAction } from './state/mapStudioActions'
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'
  import { formatHandleValue } from './state/mapStudioManipulation'
  import {
    projectModeLabel,
    projectModelElementCount,
    type MapStudioProjectModel,
  } from './state/mapStudioProjectModel'
  import { formatMeters } from './state/sketchDimensions'
  import { getSketchCommand, type SketchCommandId } from './state/sketchTools'

  let {
    projectModel,
    projectState,
    lifecycle,
    activeCommand,
    onAction,
    onSave,
    onCalculate,
    onShowDraft,
  }: {
    projectModel: MapStudioProjectModel
    projectState: MapStudioProjectState
    lifecycle: MapStudioLifecycleModel
    activeCommand: SketchCommandId
    onAction: (action: MapStudioAction) => void
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
  } = $props()

  const command = $derived(getSketchCommand(activeCommand))
  const transaction = $derived(projectState.draftTransaction)
  const changedParameter = $derived(transaction?.changedParameters[0])
  const scopeLabel = $derived(
    projectState.selectedEntity?.label ??
    (projectState.activeScope === 'perimeter' ? 'Perimetro progetto' : 'Progetto sketch'),
  )
  const selectedTrackCount = $derived(projectModel.tracks.filter((track) => track.enabled).length)
  const selectedAreaCount = $derived(projectModel.functionalAreas.filter((area) => area.enabled).length)
  const saveDisabled = $derived(projectState.dirtyState !== 'dirty' && !projectState.projectDraft.dirty)
  const verifyDisabled = $derived(!lifecycle.completeness.canVerify)
  const previewDisabled = $derived(!lifecycle.completeness.previewReady)

  const stageAction = $derived.by((): MapStudioAction | null => {
    if (transaction?.canCommit) return { id: 'commitManipulation', label: 'Conferma modifica', tone: 'primary' }
    if (projectModel.stage === 'perimeter') return { id: 'confirmPerimeter', label: 'Conferma perimetro', tone: 'primary' }
    if (projectModel.stage === 'areas') return { id: 'initializeAreas', label: 'Crea aree base', tone: 'primary' }
    if (projectModel.stage === 'tracks') return { id: 'initializeTracks', label: 'Genera tracciati', tone: 'primary' }
    if (projectModel.stage === 'footprints') return { id: 'initializeFootprints', label: 'Definisci ingombri', tone: 'primary' }
    if (projectModel.stage === 'constraints') return { id: 'confirmConstraints', label: 'Conferma vincoli', tone: 'primary' }
    if (lifecycle.completeness.canVerify) return { id: 'runVerification', label: 'Esegui verifica', tone: 'primary' }
    return null
  })
</script>

<aside class="map-sketch-properties" aria-label="Proprieta sketch">
  <header>
    <span>Inspector</span>
    <strong>{scopeLabel}</strong>
    <small>{command.label} · {projectModeLabel(projectModel.sourceMode)}</small>
  </header>

  <section class="map-sketch-properties__section">
    <h3>Perimetro</h3>
    <div class="map-sketch-property-grid">
      <div><span>Larghezza</span><strong>{formatMeters(projectModel.perimeter.widthM)}</strong></div>
      <div><span>Profondita</span><strong>{formatMeters(projectModel.perimeter.depthM)}</strong></div>
      <div><span>Lato mare</span><strong>{projectModel.perimeter.seaSide}</strong></div>
      <div><span>Elementi draft</span><strong>{projectModelElementCount(projectModel)}</strong></div>
    </div>
  </section>

  <section class="map-sketch-properties__section">
    <h3>Margini utili</h3>
    <div class="map-sketch-property-row">
      <span>Top</span><strong>{formatMeters(projectModel.perimeter.marginsM.top, 2)}</strong>
    </div>
    <div class="map-sketch-property-row">
      <span>Right</span><strong>{formatMeters(projectModel.perimeter.marginsM.right, 2)}</strong>
    </div>
    <div class="map-sketch-property-row">
      <span>Bottom</span><strong>{formatMeters(projectModel.perimeter.marginsM.bottom, 2)}</strong>
    </div>
    <div class="map-sketch-property-row">
      <span>Left</span><strong>{formatMeters(projectModel.perimeter.marginsM.left, 2)}</strong>
    </div>
  </section>

  <section class="map-sketch-properties__section">
    <h3>Modello</h3>
    <div class="map-sketch-property-row">
      <span>Aree</span><strong>{selectedAreaCount}</strong>
    </div>
    <div class="map-sketch-property-row">
      <span>Tracciati</span><strong>{selectedTrackCount}</strong>
    </div>
    <div class="map-sketch-property-row">
      <span>Stato</span><strong>{lifecycle.stateLabel}</strong>
    </div>
  </section>

  {#if changedParameter}
    <section class="map-sketch-properties__section map-sketch-properties__section--transaction">
      <h3>Modifica attiva</h3>
      <div class="map-sketch-property-row">
        <span>{changedParameter.label}</span>
        <strong>{formatHandleValue(changedParameter.proposedValue, changedParameter.unit)}</strong>
      </div>
      <div class="map-sketch-property-row">
        <span>Valore precedente</span>
        <strong>{formatHandleValue(changedParameter.currentValue, changedParameter.unit)}</strong>
      </div>
      <small>{transaction?.previewOnly ? 'Quota temporanea: non muta il modello.' : 'Commit su bozza progetto. Produzione protetta.'}</small>
    </section>
  {/if}

  <div class="map-sketch-properties__actions">
    {#if stageAction}
      <button
        type="button"
        class:primary={stageAction.tone === 'primary'}
        disabled={Boolean(stageAction.disabledReason)}
        onclick={() => onAction(stageAction)}
      >
        {stageAction.label}
      </button>
    {/if}
    {#if transaction?.canCancel}
      <button type="button" onclick={() => onAction({ id: 'cancelManipulation', label: 'Annulla' })}>Annulla</button>
    {/if}
  </div>

  <div class="map-sketch-properties__footer-actions">
    <button type="button" onclick={onSave} disabled={saveDisabled} title={saveDisabled ? 'Nessuna modifica progetto da salvare.' : 'Salva configurazione progetto'}>Salva</button>
    <button type="button" onclick={onCalculate} disabled={verifyDisabled} title={verifyDisabled ? 'Completa il modello prima della verifica.' : 'Esegui verifica'}>Verifica</button>
    <button type="button" onclick={onShowDraft} disabled={previewDisabled} title={previewDisabled ? 'Anteprima non ancora disponibile.' : 'Apri anteprima'}>Preview</button>
  </div>
</aside>
