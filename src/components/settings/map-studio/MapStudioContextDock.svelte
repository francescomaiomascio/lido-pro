<script lang="ts">
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import { actionButtonTitle, type MapStudioAction } from './state/mapStudioActions'
  import type { MapStudioControlPlane } from './state/mapStudioControlPlane'
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'
  import type { MapStudioScopeId } from './state/mapStudioScope'

  let {
    setup,
    projectState,
    controlPlane,
    lifecycle,
    onScopeChange,
    onAction,
  }: {
    setup: ParametricSetupState
    projectState: MapStudioProjectState
    controlPlane: MapStudioControlPlane
    lifecycle: MapStudioLifecycleModel
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onClearScope: () => void
    onAction: (action: MapStudioAction) => void
  } = $props()

  const dock = $derived(controlPlane.dockModel)
</script>

<section class="map-studio-context-dock" aria-label="Pannello contestuale Studio mappa">
  <div class="map-studio-context-dock__scope">
    <span>{lifecycle.stageLabel}</span>
    <strong>{dock.title}</strong>
    <small>{dock.scopeLabel} · Tool {dock.toolLabel} · {dock.manipulationLabel}</small>
    <small>{lifecycle.modeLabel} · {lifecycle.stateLabel}</small>
    {#if dock.hint}
      <em>{dock.hint}</em>
    {/if}
  </div>

  <div class="map-studio-context-dock__body">
    <div class="map-studio-context-dock__stage-console">
      <div>
        <span>Stage</span>
        <strong>{lifecycle.stageLabel}</strong>
      </div>
      <div>
        <span>Prossimo passo</span>
        <strong>{lifecycle.nextStepLabel}</strong>
      </div>
      <div>
        <span>Stato</span>
        <strong>{lifecycle.stateLabel}</strong>
      </div>
    </div>

    {#if projectState.activeDomain === 'functionalAreas'}
      <div class="map-studio-context-dock__chips" aria-label="Aree funzionali">
        {#each dock.areaChips as chip}
          <button type="button" class:active={chip.active} onclick={() => onScopeChange(chip.scopeId)}>{chip.label}</button>
        {/each}
      </div>
    {:else if projectState.activeDomain === 'tracks'}
      <div class="map-studio-context-dock__chips" aria-label="Tracciati pertinenti">
        {#each dock.trackChips.slice(0, 14) as chip}
          <button type="button" class:active={chip.active} onclick={() => onScopeChange(chip.scopeId)}>{chip.label}</button>
        {/each}
      </div>
    {:else if projectState.activeDomain === 'footprints'}
      <div class="map-studio-context-dock__parameters" aria-label="Parametri oggetto">
        {#each controlPlane.elementParameters as parameter}
          <button
            type="button"
            class:active={projectState.activeScope === parameter.scopeId}
            onclick={() => onScopeChange(parameter.scopeId)}
          >
            <span>{parameter.label}</span>
            <strong>{parameter.footprintMeters.toFixed(1).replace('.', ',')}m · clear {parameter.clearanceMeters.toFixed(1).replace('.', ',')}m</strong>
            <small>{parameter.affectedTracks.join(', ')}</small>
          </button>
        {/each}
      </div>
    {:else if projectState.activeDomain === 'metricConstraints'}
      <div class="map-studio-context-dock__constraints">
        {#each dock.constraintRows.slice(0, 4) as constraint}
          <button
            type="button"
            class:secondary={constraint.priority === 'secondary'}
            onclick={() => onScopeChange(`constraint:metric:${constraint.key}`)}
          >
            <span>{constraint.label}</span>
            <em>{setup.distanceRules[constraint.key].toFixed(1).replace('.', ',')}m</em>
          </button>
        {/each}
      </div>
    {/if}

    {#if dock.editingLabel}
      <div class="map-studio-context-dock__transaction">
        <span>{dock.editingLabel}</span>
        <strong>{dock.currentValue} -> {dock.proposedValue}</strong>
        <em>{projectState.draftTransaction?.previewOnly ? 'misura temporanea' : 'proposta draft'}</em>
      </div>
    {/if}

    {#if projectState.activeDomain !== 'metricConstraints' && projectState.activeDomain !== 'footprints'}
      <div class="map-studio-context-dock__metrics">
        {#each dock.metrics as metric}
          <div class:tone-warning={metric.tone === 'warning'} class:tone-positive={metric.tone === 'positive'}>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        {/each}
      </div>
    {:else if projectState.activeDomain === 'footprints'}
      <div class="map-studio-context-dock__metrics map-studio-context-dock__metrics--inline">
        {#each dock.metrics as metric}
          <div>
            <span>{metric.label}</span>
            <strong>{metric.value}</strong>
          </div>
        {/each}
      </div>
    {/if}
  </div>

  <div class="map-studio-context-dock__actions">
    {#if dock.primaryAction}
      <button
        type="button"
        class="primary"
        disabled={Boolean(dock.primaryAction.disabledReason)}
        title={actionButtonTitle(dock.primaryAction)}
        onclick={() => dock.primaryAction && onAction(dock.primaryAction)}
      >
        {dock.primaryAction.label}
      </button>
    {/if}
    {#each dock.secondaryActions as action}
      <button
        type="button"
        disabled={Boolean(action.disabledReason)}
        title={actionButtonTitle(action)}
        onclick={() => onAction(action)}
      >
        {action.label}
      </button>
    {/each}
  </div>
</section>
