<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from '../MapStudioProjectState'
  import BoardSvgDefs from './BoardSvgDefs.svelte'
  import { buildMetricBoardViewModel } from './metricBoardViewModel'
  import { layerVisible } from './metricBoardLayers'
  import BoardSurfaceLayer from './layers/BoardSurfaceLayer.svelte'
  import BoardBoundaryLayer from './layers/BoardBoundaryLayer.svelte'
  import BoardFunctionalAreaLayer from './layers/BoardFunctionalAreaLayer.svelte'
  import BoardTrackLayer from './layers/BoardTrackLayer.svelte'
  import BoardObjectLayer from './layers/BoardObjectLayer.svelte'
  import BoardConstraintLayer from './layers/BoardConstraintLayer.svelte'
  import BoardWarningLayer from './layers/BoardWarningLayer.svelte'
  import BoardSelectionLayer from './layers/BoardSelectionLayer.svelte'
  import BoardLabelLayer from './layers/BoardLabelLayer.svelte'

  let {
    setup,
    output = null,
    projectState,
    onSelectedZoneChange,
    onSelectedRowChange,
    onSelectedItemChange,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    projectState: MapStudioProjectState
    onSelectedZoneChange: (id: string) => void
    onSelectedRowChange: (id: string) => void
    onSelectedItemChange: (code: string) => void
  } = $props()

  const vm = $derived(buildMetricBoardViewModel(setup, output))
  const areaActive = $derived(layerVisible(projectState.activeLayerSet, 'functional.areas'))
  const trackActive = $derived(layerVisible(projectState.activeLayerSet, 'tracks.rows'))
  const objectActive = $derived(layerVisible(projectState.activeLayerSet, 'object.footprints') || projectState.activeDomain !== 'perimeter')
  const footprintActive = $derived(layerVisible(projectState.activeLayerSet, 'object.footprints'))
  const constraintActive = $derived(layerVisible(projectState.activeLayerSet, 'metric.constraints'))
  const warningActive = $derived(layerVisible(projectState.activeLayerSet, 'warnings'))
  const selectionActive = $derived(layerVisible(projectState.activeLayerSet, 'selection.focus'))
  const boundaryActive = $derived(layerVisible(projectState.activeLayerSet, 'usable.boundary'))
  const areaLabelsActive = $derived(projectState.activeDomain === 'functional-areas' || areaActive || selectionActive)
  const trackLabelsActive = $derived(projectState.activeDomain === 'tracks' || trackActive || projectState.activeDomain === 'constraints')
</script>

<section class="parametric-board" aria-label="Tavola parametrica professionale">
  <svg class="parametric-board__svg" viewBox={`0 0 ${vm.frame.width} ${vm.frame.height}`} role="img" aria-label="Tavola parametrica spiaggia 31m per 28m">
    <BoardSvgDefs />
    <BoardSurfaceLayer {vm} activeLayers={projectState.activeLayerSet} />
    <BoardBoundaryLayer {vm} active={boundaryActive} />
    <BoardFunctionalAreaLayer {vm} active={areaActive} selectedAreaId={projectState.selectedAreaId} {onSelectedZoneChange} />
    <BoardTrackLayer {vm} active={trackActive} selectedTrackId={projectState.selectedTrackId} selectedAreaId={projectState.selectedAreaId} {onSelectedRowChange} />
    <BoardObjectLayer
      {vm}
      active={objectActive}
      footprintsActive={footprintActive}
      selectedAreaId={projectState.selectedAreaId}
      selectedTrackId={projectState.selectedTrackId}
      selectedObjectCode={projectState.selectedObjectTypeId}
      {onSelectedItemChange}
    />
    <BoardConstraintLayer {vm} active={constraintActive} />
    <BoardWarningLayer {vm} active={warningActive} />
    <BoardSelectionLayer {vm} active={selectionActive} selectedAreaId={projectState.selectedAreaId} selectedTrackId={projectState.selectedTrackId} />
    <BoardLabelLayer {vm} {areaLabelsActive} {trackLabelsActive} selectedAreaId={projectState.selectedAreaId} selectedTrackId={projectState.selectedTrackId} />
  </svg>
</section>
