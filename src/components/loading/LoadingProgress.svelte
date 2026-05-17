<script lang="ts">
  import type { LoadingStep } from './loadingTypes'

  let {
    steps,
    activeIndex,
    compact = false,
  }: {
    steps: LoadingStep[]
    activeIndex: number
    compact?: boolean
  } = $props()

  const boundedIndex = $derived(Math.min(Math.max(activeIndex, 0), Math.max(steps.length - 1, 0)))
  const progressValue = $derived(steps.length ? Math.round(((boundedIndex + 1) / steps.length) * 100) : 0)
</script>

<div class="loading-progress-system" class:compact style={`--loading-progress-value: ${progressValue}%`}>
  <div class="loading-progress-system__meter" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={progressValue}>
    <span></span>
  </div>
  <span class="loading-progress-system__value">{progressValue}%</span>
</div>

<ol class="loading-step-list" class:compact aria-label="Avanzamento caricamento">
  {#each steps as step, index}
    <li class:active={index === boundedIndex} class:done={index < boundedIndex}>
      <span class="loading-step-list__marker" aria-hidden="true"></span>
      <span class="loading-step-list__copy">
        <strong>{step.label}</strong>
        <small>{step.owner}</small>
      </span>
    </li>
  {/each}
</ol>
