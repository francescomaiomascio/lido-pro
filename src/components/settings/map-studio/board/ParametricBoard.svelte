<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from '../MapStudioProjectState'
  import type { MapStudioBoardEmphasisModel } from '../state/mapStudioSelectors'
  import type { MapStudioScopeId } from '../state/mapStudioScope'
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
    emphasis,
    onScopeChange,
    onScopeHover,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    projectState: MapStudioProjectState
    emphasis: MapStudioBoardEmphasisModel
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
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
  const areaLabelsActive = $derived(projectState.activeDomain === 'functionalAreas' || areaActive || selectionActive)
  const trackLabelsActive = $derived(projectState.activeDomain === 'tracks' || trackActive || projectState.activeDomain === 'metricConstraints')
</script>

<section class="parametric-board" aria-label="Tavola parametrica professionale">
  <svg class="parametric-board__svg" viewBox={`0 0 ${vm.frame.width} ${vm.frame.height}`} role="img" aria-label="Tavola parametrica spiaggia 31m per 28m">
    <BoardSvgDefs />
    <BoardSurfaceLayer {vm} activeLayers={projectState.activeLayerSet} />
    <BoardBoundaryLayer {vm} active={boundaryActive} {emphasis} />
    <BoardFunctionalAreaLayer {vm} active={areaActive} {emphasis} {onScopeChange} {onScopeHover} />
    <BoardTrackLayer {vm} active={trackActive} {emphasis} {onScopeChange} {onScopeHover} />
    <BoardObjectLayer
      {vm}
      active={objectActive}
      footprintsActive={footprintActive}
      {emphasis}
      {onScopeChange}
      {onScopeHover}
    />
    <BoardConstraintLayer {vm} active={constraintActive} {emphasis} {onScopeChange} {onScopeHover} />
    <BoardWarningLayer {vm} active={warningActive} {emphasis} {onScopeChange} {onScopeHover} />
    <BoardSelectionLayer {vm} active={selectionActive} {emphasis} />
    <BoardLabelLayer {vm} {areaLabelsActive} {trackLabelsActive} {emphasis} />
  </svg>
</section>
