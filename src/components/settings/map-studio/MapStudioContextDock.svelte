<script lang="ts">
  import type { BeachDistanceRules } from '../../../lib/map-canvas'
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import { getMapStudioDomain } from './mapStudioDomains'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import { buildMapStudioContext } from './mapStudioSelectors'

  let {
    setup,
    output = null,
    projectState,
    distanceRows,
    draftAvailable,
    onSelectedZoneChange,
    onSelectedRowChange,
    onUpdateDistance,
    onCalculate,
    onShowDraft,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    projectState: MapStudioProjectState
    distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
    draftAvailable: boolean
    onSelectedZoneChange: (id: string) => void
    onSelectedRowChange: (id: string) => void
    onUpdateDistance: <K extends keyof ParametricSetupState['distanceRules']>(key: K, value: ParametricSetupState['distanceRules'][K]) => void
    onCalculate: () => void
    onShowDraft: () => void
  } = $props()

  const domain = $derived(getMapStudioDomain(projectState.activeDomain))
  const context = $derived(buildMapStudioContext({ setup, state: projectState, distanceRows }))
  const numberFromInput = (event: Event) => Number((event.currentTarget as HTMLInputElement).value)
</script>

<section class="map-studio-context-dock" aria-label="Pannello contestuale Studio mappa">
  <div class="map-studio-context-dock__scope">
    <span>{domain.label}</span>
    <strong>{context.title}</strong>
    <small>{context.scopeLabel} · {context.subtitle}</small>
  </div>

  {#if projectState.activeDomain === 'perimeter'}
    <div class="map-studio-context-dock__metrics">
      <div><span>Perimetro</span><strong>{setup.beach.widthM}m × {setup.beach.depthM}m</strong></div>
      <div><span>Lato mare</span><strong>{setup.beach.seaSide}</strong></div>
      <div><span>Margini</span><strong>{setup.beach.marginsM.top}/{setup.beach.marginsM.right}/{setup.beach.marginsM.bottom}/{setup.beach.marginsM.left}m</strong></div>
    </div>
  {:else if projectState.activeDomain === 'functional-areas'}
    <div class="map-studio-context-dock__chips" aria-label="Aree funzionali">
      {#each setup.zones as zone}
        <button type="button" class:active={projectState.selectedAreaId === zone.id} onclick={() => onSelectedZoneChange(zone.id)}>{zone.label}</button>
      {/each}
    </div>
  {:else if projectState.activeDomain === 'tracks'}
    <div class="map-studio-context-dock__chips" aria-label="Tracciati pertinenti">
      {#each context.tracks.slice(0, 14) as track}
        <button type="button" class:active={projectState.selectedTrackId === track.id} onclick={() => onSelectedRowChange(track.id)}>{track.label}</button>
      {/each}
    </div>
  {:else if projectState.activeDomain === 'footprints'}
    <div class="map-studio-context-dock__metrics">
      {#each context.assets.slice(0, 4) as asset}
        <div><span>{asset.label}</span><strong>{asset.defaultDiameterM ? `${asset.defaultDiameterM}m Ø` : `${asset.defaultWidthM}m × ${asset.defaultHeightM}m`}</strong></div>
      {/each}
    </div>
  {:else if projectState.activeDomain === 'constraints'}
    <div class="map-studio-context-dock__constraints">
      {#each context.constraints.slice(0, 3) as constraint}
        <label>
          <span>{constraint.label}</span>
          <em><input type="number" min="0" step="0.1" value={setup.distanceRules[constraint.key]} oninput={(event) => onUpdateDistance(constraint.key, numberFromInput(event))} /> m</em>
        </label>
      {/each}
    </div>
  {:else if projectState.activeDomain === 'validation'}
    <div class="map-studio-context-dock__metrics">
      <div><span>Input</span><strong>{setup.zones.length} aree · {setup.rows.length} tracciati</strong></div>
      <div><span>Warning</span><strong>{output?.warnings.length ?? 0}</strong></div>
      <div><span>Anteprima</span><strong>{draftAvailable ? 'disponibile' : 'non disponibile'}</strong></div>
    </div>
  {:else}
    <div class="map-studio-context-dock__metrics">
      <div><span>Layout attivo protetto</span><strong>{projectState.activeConfigurationId ?? setup.layoutVersionId}</strong></div>
      <div><span>Configurazione progetto</span><strong>{setup.status === 'draft_calculated' ? 'calcolata' : 'in modifica'}</strong></div>
      <div><span>Anteprima</span><strong>{draftAvailable ? 'disponibile' : 'da generare'}</strong></div>
    </div>
  {/if}

  <div class="map-studio-context-dock__actions">
    {#if projectState.activeDomain === 'versions'}
      <button type="button" class="primary" onclick={onShowDraft} disabled={!draftAvailable}>Apri anteprima</button>
      <button type="button" onclick={onShowDraft} disabled={!draftAvailable}>Confronta</button>
    {:else}
      <button type="button" class="primary" onclick={onCalculate}>{context.primaryActionLabel}</button>
    {/if}
  </div>
</section>
