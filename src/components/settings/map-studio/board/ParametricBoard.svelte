<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectState } from '../MapStudioProjectState'
  import MapStudioZeroState from '../MapStudioZeroState.svelte'
  import type { MapStudioSelectedHandle } from '../state/mapStudioManipulation'
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
  import BoardHoverOverlay from './overlays/BoardHoverOverlay.svelte'
  import BoardSelectionOverlay from './overlays/BoardSelectionOverlay.svelte'
  import BoardMeasurementOverlay from './overlays/BoardMeasurementOverlay.svelte'
  import BoardPerimeterHandlesOverlay from './overlays/BoardPerimeterHandlesOverlay.svelte'
  import BoardAreaHandlesOverlay from './overlays/BoardAreaHandlesOverlay.svelte'
  import BoardTrackHandlesOverlay from './overlays/BoardTrackHandlesOverlay.svelte'
  import BoardFootprintHandlesOverlay from './overlays/BoardFootprintHandlesOverlay.svelte'
  import BoardConstraintHandlesOverlay from './overlays/BoardConstraintHandlesOverlay.svelte'
  import BoardDraftGhostOverlay from './overlays/BoardDraftGhostOverlay.svelte'

  let {
    setup,
    output = null,
    projectState,
    emphasis,
    onScopeChange,
    onScopeHover,
    onManipulationStart,
    onManipulationUpdate,
    onManipulationFinish,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    projectState: MapStudioProjectState
    emphasis: MapStudioBoardEmphasisModel
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
    onManipulationStart: (handle: MapStudioSelectedHandle, previewOnly?: boolean) => void
    onManipulationUpdate: (handle: MapStudioSelectedHandle) => void
    onManipulationFinish: () => void
  } = $props()

  const vm = $derived(buildMetricBoardViewModel(setup, output))
  const hasAreas = $derived(setup.zones.length > 0)
  const hasTracks = $derived(setup.rows.length > 0)
  const hasObjects = $derived(projectState.projectModel.objectParameters.length > 0)
  const areaActive = $derived(hasAreas && (layerVisible(projectState.activeLayerSet, 'functional.areas') || ['functionalAreas', 'tracks', 'footprints', 'metricConstraints'].includes(projectState.activeDomain)))
  const trackActive = $derived(hasTracks && (layerVisible(projectState.activeLayerSet, 'tracks.rows') || ['tracks', 'footprints', 'metricConstraints'].includes(projectState.activeDomain)))
  const objectActive = $derived(hasObjects && (layerVisible(projectState.activeLayerSet, 'object.footprints') || ['footprints', 'metricConstraints', 'verification', 'versionsPublication'].includes(projectState.activeDomain)))
  const footprintActive = $derived(layerVisible(projectState.activeLayerSet, 'object.footprints'))
  const constraintActive = $derived(hasTracks && layerVisible(projectState.activeLayerSet, 'metric.constraints'))
  const warningActive = $derived(layerVisible(projectState.activeLayerSet, 'warnings'))
  const selectionActive = $derived(layerVisible(projectState.activeLayerSet, 'selection.focus'))
  const boundaryActive = $derived(layerVisible(projectState.activeLayerSet, 'usable.boundary'))
  const areaLabelsActive = $derived(projectState.activeDomain === 'functionalAreas' || areaActive || selectionActive)
  const trackLabelsActive = $derived(projectState.activeDomain === 'tracks' || trackActive || projectState.activeDomain === 'metricConstraints')
  const technicalZeroState = $derived(projectState.projectModel.sourceMode === 'empty' && projectState.projectModel.functionalAreas.length === 0)
</script>

<section class="parametric-board" aria-label="Tavola parametrica professionale">
  <svg class="parametric-board__svg" viewBox={`0 0 ${vm.frame.width} ${vm.frame.height}`} role="img" aria-label="Tavola parametrica spiaggia 31m per 28m">
    <BoardSvgDefs />
    <BoardSurfaceLayer {vm} activeLayers={projectState.activeLayerSet} technicalMode={technicalZeroState} />
    <BoardBoundaryLayer {vm} active={boundaryActive} {emphasis} />
    <MapStudioZeroState projectModel={projectState.projectModel} />
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
    <BoardMeasurementOverlay {vm} {projectState} {onManipulationStart} {onManipulationUpdate} {onManipulationFinish} />
    <BoardPerimeterHandlesOverlay {vm} {projectState} {onScopeChange} {onManipulationStart} {onManipulationUpdate} {onManipulationFinish} />
    <BoardAreaHandlesOverlay {vm} {projectState} {onScopeChange} {onManipulationStart} {onManipulationUpdate} {onManipulationFinish} />
    <BoardTrackHandlesOverlay {vm} {projectState} {onScopeChange} {onManipulationStart} {onManipulationUpdate} {onManipulationFinish} />
    <BoardFootprintHandlesOverlay {vm} {projectState} {onScopeChange} {onManipulationStart} {onManipulationUpdate} {onManipulationFinish} />
    <BoardConstraintHandlesOverlay {vm} {projectState} {onScopeChange} {onManipulationStart} {onManipulationUpdate} {onManipulationFinish} />
    <BoardSelectionOverlay {vm} {projectState} />
    <BoardHoverOverlay {vm} {projectState} />
    <BoardDraftGhostOverlay {vm} {projectState} />
  </svg>
</section>
