<script lang="ts">
  import type { OperationalPanelTab } from '../../lib/state/operationalPanelState'
  import type { BookingFlowStep } from './bookingConsole.types'

  let {
    steps,
    onSelect,
  }: {
    steps: BookingFlowStep[]
    onSelect: (tab: OperationalPanelTab) => void
  } = $props()
</script>

<nav class="booking-console-actions" aria-label="Azioni prenotazione">
  {#each steps as step, index}
    <button
      type="button"
      class:done={step.done}
      class:active={step.active}
      disabled={step.enabled === false}
      title={step.enabled === false ? step.reason : undefined}
      onclick={() => {
        if (step.enabled === false) return
        onSelect(step.action)
      }}
      aria-current={step.active ? 'step' : undefined}
    >
      <span>{index + 1}</span>
      <span class="booking-console-actions__copy">
        <strong>{step.label}</strong>
        <em>{step.reason ?? (step.done ? 'Fatto' : step.active ? 'In corso' : 'Pronto')}</em>
      </span>
    </button>
  {/each}
</nav>
