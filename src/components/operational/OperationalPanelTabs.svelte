<script lang="ts">
  import type { OperationalPanelTab } from '../../lib/state/operationalPanelState'

  let {
    activeTab,
    disabled = false,
    onChange,
  }: {
    activeTab: OperationalPanelTab
    disabled?: boolean
    onChange: (tab: OperationalPanelTab) => void
  } = $props()

  const tabs: { id: OperationalPanelTab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'customer', label: 'Cliente' },
    { id: 'period', label: 'Periodo' },
    { id: 'tariff', label: 'Tariffa' },
    { id: 'account', label: 'Conto' },
    { id: 'payments', label: 'Pagamenti' },
    { id: 'extra', label: 'Extra' },
    { id: 'history', label: 'Storico' },
    { id: 'technical', label: 'Tecnico' },
  ]
</script>

<nav class="operational-tabs" aria-label="Sezioni operative">
  {#each tabs as tab}
    <button
      type="button"
      disabled={disabled}
      class:active={activeTab === tab.id}
      onclick={() => onChange(tab.id)}
    >
      {tab.label}
    </button>
  {/each}
</nav>
