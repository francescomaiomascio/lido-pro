<script lang="ts">
  import type { SeaSide } from '../../../lib/map-canvas/types'
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import type { MapStudioDomainId } from './mapStudioDomains'
  import MapStudioSketchCommandBar from './MapStudioSketchCommandBar.svelte'
  import MapStudioSketchHud from './MapStudioSketchHud.svelte'
  import MapStudioSketchPropertiesPanel from './MapStudioSketchPropertiesPanel.svelte'
  import MapStudioSketchStatusBar from './MapStudioSketchStatusBar.svelte'
  import MapStudioSketchToolbar from './MapStudioSketchToolbar.svelte'
  import MapStudioSketchViewport from './MapStudioSketchViewport.svelte'
  import type { MapStudioAction, MapStudioToolId } from './state/mapStudioActions'
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'
  import type { MapStudioSelectedHandle } from './state/mapStudioManipulation'
  import type { MapStudioProjectModel } from './state/mapStudioProjectModel'
  import type { MapStudioScopeId } from './state/mapStudioScope'
  import {
    createSketchViewportState,
    type SketchPoint,
    type SketchViewportState,
  } from './state/sketchCanvasState'
  import { commandStateLabel, type SketchCommandState } from './state/sketchCommands'
  import {
    createDefaultSketchDisplayState,
    type SketchDisplayId,
    type SketchDisplayState,
  } from './state/sketchDisplay'
  import {
    getSketchCommand,
    sketchCommandForStudioTool,
    type SketchCommandId,
  } from './state/sketchTools'

  let {
    projectModel,
    projectState,
    lifecycle,
    onDomainChange,
    onToolChange,
    onScopeChange,
    onScopeHover,
    onManipulationStart,
    onManipulationUpdate,
    onManipulationFinish,
    onSeaSideChange,
    onAction,
    onSave,
    onCalculate,
    onShowDraft,
    onExitProject,
  }: {
    projectModel: MapStudioProjectModel
    projectState: MapStudioProjectState
    lifecycle: MapStudioLifecycleModel
    onDomainChange: (domain: MapStudioDomainId) => void
    onToolChange: (tool: MapStudioToolId) => void
    onScopeChange: (scopeId: MapStudioScopeId) => void
    onScopeHover: (scopeId?: MapStudioScopeId) => void
    onManipulationStart: (handle: MapStudioSelectedHandle, previewOnly?: boolean) => void
    onManipulationUpdate: (handle: MapStudioSelectedHandle) => void
    onManipulationFinish: () => void
    onSeaSideChange: (seaSide: SeaSide) => void
    onAction: (action: MapStudioAction) => void
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
    onExitProject: () => void
  } = $props()

  let activeCommand = $state<SketchCommandId>('perimeter')
  let viewport = $state<SketchViewportState>(createSketchViewportState())
  let pointerWorld = $state<SketchPoint | undefined>(undefined)
  let display = $state<SketchDisplayState>(createDefaultSketchDisplayState())
  let fitRequest = $state(0)

  const commandState = $derived.by((): SketchCommandState => {
    if (projectState.activeManipulation !== 'none') return 'dragging'
    if (projectState.draftTransaction?.canCommit) return 'pendingConfirm'
    if (projectState.draftTransaction?.previewOnly) return 'editing'
    if (activeCommand === 'measure' || activeCommand === 'perimeter' || activeCommand === 'margin') return 'armed'
    return 'idle'
  })

  const activeCommandModel = $derived(getSketchCommand(activeCommand))

  $effect(() => {
    const mappedCommand = sketchCommandForStudioTool(projectState.activeTool)
    if (activeCommand === 'pan' || activeCommand === 'seaEdge' || activeCommand === 'margin') return
    if (activeCommand !== mappedCommand) activeCommand = mappedCommand
  })

  const changeCommand = (commandId: SketchCommandId) => {
    const command = getSketchCommand(commandId)
    if (commandId === 'fit') {
      fitRequest += 1
      activeCommand = 'select'
      return
    }
    activeCommand = commandId
    if (command.studioToolId) onToolChange(command.studioToolId)
  }

  const toggleDisplay = (displayId: SketchDisplayId) => {
    display = { ...display, [displayId]: !display[displayId] }
  }

  const changeSeaSide = (seaSide: SeaSide) => {
    onSeaSideChange(seaSide)
    activeCommand = 'seaEdge'
  }
</script>

<section class="map-sketch-shell" aria-label="Studio mappa sketch">
  <MapStudioSketchCommandBar
    {activeCommand}
    activeDomain={projectState.activeDomain}
    {lifecycle}
    {projectModel}
    {onDomainChange}
    {onExitProject}
  />

  <div class="map-sketch-canvas-frame">
    <MapStudioSketchToolbar
      {activeCommand}
      {lifecycle}
      onCommandChange={changeCommand}
    />

    <MapStudioSketchViewport
      {projectModel}
      {projectState}
      {activeCommand}
      {fitRequest}
      {display}
      {viewport}
      onViewportChange={(nextViewport) => (viewport = nextViewport)}
      onPointerWorldChange={(point) => (pointerWorld = point)}
      {onScopeChange}
      {onScopeHover}
      {onManipulationStart}
      {onManipulationUpdate}
      {onManipulationFinish}
      onSeaSideChange={changeSeaSide}
    />

    <MapStudioSketchHud {display} onToggle={toggleDisplay} />

    <MapStudioSketchPropertiesPanel
      {projectModel}
      {projectState}
      {lifecycle}
      {activeCommand}
      {onAction}
      {onSave}
      {onCalculate}
      {onShowDraft}
    />
  </div>

  <div class="map-sketch-command-note">
    <span>{activeCommandModel.label}</span>
    <strong>{commandStateLabel(commandState)}</strong>
    <em>{activeCommandModel.prompt}</em>
  </div>

  <MapStudioSketchStatusBar
    {viewport}
    {pointerWorld}
    {projectState}
    {lifecycle}
    {commandState}
  />
</section>
