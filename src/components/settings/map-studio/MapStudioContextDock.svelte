<script lang="ts">
  import type { BeachDistanceRules } from '../../../lib/map-canvas'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import { actionButtonTitle, type MapStudioAction } from './state/mapStudioActions'
  import type { MapStudioControlPlane } from './state/mapStudioControlPlane'
  import type { MapStudioScopeId } from './state/mapStudioScope'

  let {
    setup,
    projectState,
    controlPlane,
    onScopeChange,
    onAction,
    onUpdateDistance,
  }: {
    setup: ParametricSetupState
    projectState: MapStudioProjectState
    controlPlane: MapStudioControlPlane
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onClearScope: () => void
    onAction: (action: MapStudioAction) => void
    onUpdateDistance: <K extends keyof ParametricSetupState['distanceRules']>(key: K, value: ParametricSetupState['distanceRules'][K]) => void
  } = $props()

  const dock = $derived(controlPlane.dockModel)
  const numberFromInput = (event: Event) => Number((event.currentTarget as HTMLInputElement).value)
</script>

<section class="map-studio-context-dock" aria-label="Pannello contestuale Studio mappa">
  <div class="map-studio-context-dock__scope">
    <span>{dock.domainLabel}</span>
    <strong>{dock.title}</strong>
    <small>{dock.scopeLabel} · {dock.subtitle}</small>
    {#if dock.hint}
      <em>{dock.hint}</em>
    {/if}
  </div>

  <div class="map-studio-context-dock__body">
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
      <div class="map-studio-context-dock__chips" aria-label="Tipi oggetto pertinenti">
        {#each dock.objectTypeChips as chip}
          <button type="button" class:active={chip.active} onclick={() => onScopeChange(chip.scopeId)}>{chip.label}</button>
        {/each}
      </div>
    {:else if projectState.activeDomain === 'metricConstraints'}
      <div class="map-studio-context-dock__constraints">
        {#each dock.constraintRows.slice(0, 4) as constraint}
          <label class:secondary={constraint.priority === 'secondary'}>
            <span>{constraint.label}</span>
            <em><input type="number" min="0" step="0.1" value={setup.distanceRules[constraint.key]} oninput={(event) => onUpdateDistance(constraint.key, numberFromInput(event))} /> m</em>
          </label>
        {/each}
      </div>
    {/if}

    {#if projectState.activeDomain !== 'metricConstraints'}
      <div class="map-studio-context-dock__metrics">
        {#each dock.metrics as metric}
          <div class:tone-warning={metric.tone === 'warning'} class:tone-positive={metric.tone === 'positive'}>
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
