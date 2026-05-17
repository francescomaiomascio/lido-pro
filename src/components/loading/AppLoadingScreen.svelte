<script lang="ts">
  import { APP_DISPLAY_NAME } from '../../lib/config/appConfig'
  import LoadingProgress from './LoadingProgress.svelte'
  import type { LoadingStep } from './loadingTypes'

  let {
    steps,
    activeIndex,
    runtimeLabel,
  }: {
    steps: LoadingStep[]
    activeIndex: number
    runtimeLabel: string
  } = $props()

  const boundedIndex = $derived(Math.min(Math.max(activeIndex, 0), Math.max(steps.length - 1, 0)))
  const activeStep = $derived(steps[boundedIndex] ?? steps.at(-1))
</script>

<section class="app-loading-screen" role="status" aria-live="polite" aria-label="Caricamento LidoPro">
  <div class="app-loading-screen__frame">
    <header class="app-loading-screen__brand">
      <img src="/brand/svg/lidopro-wordmark-color.svg" alt={APP_DISPLAY_NAME} />
      <span>{runtimeLabel}</span>
    </header>

    <div class="app-loading-screen__main">
      <div class="app-loading-screen__copy">
        <span>{activeStep?.owner ?? 'Sistema'}</span>
        <h1>Preparazione workspace operativo</h1>
        <p>{activeStep?.detail ?? 'Sincronizzazione runtime locale e interfaccia.'}</p>
      </div>

      <div class="app-loading-screen__asset" aria-hidden="true">
        <div class="boot-board">
          <span class="boot-board__shore"></span>
          <span class="boot-board__axis axis-a"></span>
          <span class="boot-board__axis axis-b"></span>
          <span class="boot-board__axis axis-c"></span>
          <span class="boot-board__lane lane-a"></span>
          <span class="boot-board__lane lane-b"></span>
          <span class="boot-board__lane lane-c"></span>
          <span class="boot-board__node node-a"></span>
          <span class="boot-board__node node-b"></span>
          <span class="boot-board__node node-c"></span>
          <span class="boot-board__node node-d"></span>
          <span class="boot-board__node node-e"></span>
          <span class="boot-board__node node-f"></span>
          <span class="boot-board__scan"></span>
        </div>
      </div>

      <LoadingProgress {steps} {activeIndex} />
    </div>
  </div>
</section>
