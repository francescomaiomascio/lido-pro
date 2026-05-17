<script lang="ts">
  import type { MapStudioProjectState } from './MapStudioProjectState'
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'
  import type { SketchPoint, SketchViewportState } from './state/sketchCanvasState'
  import { commandStateLabel, type SketchCommandState } from './state/sketchCommands'

  let {
    viewport,
    pointerWorld,
    projectState,
    lifecycle,
    commandState,
  }: {
    viewport: SketchViewportState
    pointerWorld?: SketchPoint
    projectState: MapStudioProjectState
    lifecycle: MapStudioLifecycleModel
    commandState: SketchCommandState
  } = $props()
</script>

<footer class="map-sketch-statusbar" aria-label="Stato sketch">
  <span>{lifecycle.modeLabel}</span>
  <span>{commandStateLabel(commandState)}</span>
  <span>{Math.round(viewport.scale * 4.5)}%</span>
  <span>{pointerWorld ? `${pointerWorld.x.toFixed(2)}m, ${pointerWorld.y.toFixed(2)}m` : 'puntatore fuori canvas'}</span>
  <span>{projectState.dirtyState === 'dirty' || projectState.projectDraft.dirty ? 'bozza modificata' : 'bozza pulita'}</span>
  <strong>layout attivo protetto</strong>
</footer>
