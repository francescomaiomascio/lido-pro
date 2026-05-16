<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import type { MapStudioDomainId } from './mapStudioDomains'
  import MapStudioTopBar from './MapStudioTopBar.svelte'
  import MapStudioDomainTabs from './MapStudioDomainTabs.svelte'
  import MapStudioParametricBoardHost from './MapStudioParametricBoardHost.svelte'
  import MapStudioContextDock from './MapStudioContextDock.svelte'
  import type { BeachDistanceRules } from '../../../lib/map-canvas'
  import type { MapStudioLayerId } from './mapStudioLayers'

  let {
    setup,
    output = null,
    status,
    projectState,
    distanceRows,
    draftAvailable,
    disabledLayers,
    onDomainChange,
    onLayerToggle,
    onSelectedZoneChange,
    onSelectedRowChange,
    onSelectedItemChange,
    onSave,
    onCalculate,
    onShowDraft,
    onUpdateDistance,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    status: string
    projectState: MapStudioProjectState
    distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
    draftAvailable: boolean
    disabledLayers: MapStudioLayerId[]
    onDomainChange: (domain: MapStudioDomainId) => void
    onLayerToggle: (layer: MapStudioLayerId) => void
    onSelectedZoneChange: (id: string) => void
    onSelectedRowChange: (id: string) => void
    onSelectedItemChange: (code: string) => void
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
    onUpdateDistance: <K extends keyof ParametricSetupState['distanceRules']>(key: K, value: ParametricSetupState['distanceRules'][K]) => void
  } = $props()
</script>

<section class="map-studio-shell" aria-label="Studio mappa">
  <MapStudioTopBar {setup} {output} {status} {draftAvailable} {projectState} {onSave} {onCalculate} {onShowDraft} />
  <MapStudioDomainTabs activeDomain={projectState.activeDomain} onDomainChange={onDomainChange} />
  <div class="map-studio-workspace">
    <MapStudioParametricBoardHost
      {setup}
      {output}
      {projectState}
      {disabledLayers}
      {onLayerToggle}
      {onSelectedZoneChange}
      {onSelectedRowChange}
      {onSelectedItemChange}
    />
  </div>
  <MapStudioContextDock
    {setup}
    {output}
    {projectState}
    {distanceRows}
    {draftAvailable}
    {onSelectedZoneChange}
    {onSelectedRowChange}
    {onUpdateDistance}
    {onCalculate}
    {onShowDraft}
  />
</section>
