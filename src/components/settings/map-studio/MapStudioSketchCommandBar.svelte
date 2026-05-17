<script lang="ts">
  import type { MapStudioDomainId } from './mapStudioDomains'
  import type { MapStudioLifecycleModel } from './state/mapStudioLifecycle'
  import { getSketchCommand, type SketchCommandId } from './state/sketchTools'
  import type { MapStudioProjectModel } from './state/mapStudioProjectModel'
  import { sketchProjectSubtitle } from './state/sketchProjectModel'

  let {
    activeCommand,
    activeDomain,
    lifecycle,
    projectModel,
    onDomainChange,
    onExitProject,
  }: {
    activeCommand: SketchCommandId
    activeDomain: MapStudioDomainId
    lifecycle: MapStudioLifecycleModel
    projectModel: MapStudioProjectModel
    onDomainChange: (domain: MapStudioDomainId) => void
    onExitProject: () => void
  } = $props()

  const command = $derived(getSketchCommand(activeCommand))
</script>

<header class="map-sketch-commandbar" aria-label="Comando sketch">
  <div class="map-sketch-commandbar__project">
    <button type="button" onclick={onExitProject} aria-label="Torna ai progetti">
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M15 18 9 12l6-6" />
      </svg>
    </button>
    <div>
      <span>Studio Mappa Sketch</span>
      <strong>{lifecycle.stageLabel}</strong>
      <small>{sketchProjectSubtitle(projectModel)}</small>
    </div>
  </div>

  <div class="map-sketch-commandbar__prompt">
    <span>{command.label}</span>
    <strong>{command.prompt}</strong>
  </div>

  <div class="map-sketch-spine" aria-label="Lifecycle progetto">
    {#each lifecycle.domainStates as domain}
      <button
        type="button"
        class:active={domain.id === activeDomain}
        class:complete={!domain.disabledReason}
        disabled={Boolean(domain.disabledReason)}
        title={domain.disabledReason ?? domain.description}
        onclick={() => onDomainChange(domain.id)}
      >
        <span></span>
        <em>{domain.shortLabel}</em>
      </button>
    {/each}
  </div>
</header>
