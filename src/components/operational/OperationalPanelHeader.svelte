<script lang="ts">
  import OperationalPanelTabs from './OperationalPanelTabs.svelte'
  import type { OperationalPanelTab } from '../../lib/state/operationalPanelState'

  let {
    isExpanded,
    activeTab,
    tabsDisabled,
    onTabChange,
    onToggleExpand,
  }: {
    isExpanded: boolean
    activeTab: OperationalPanelTab
    tabsDisabled: boolean
    onTabChange: (tab: OperationalPanelTab) => void
    onToggleExpand: () => void
  } = $props()
</script>

<header class="operational-header">
  <div class="operational-header__tabs">
    <OperationalPanelTabs
      activeTab={activeTab}
      disabled={tabsDisabled}
      onChange={onTabChange}
    />
  </div>

  <div class="operational-header__actions">
    <button type="button" onclick={onToggleExpand}>
      {isExpanded ? '−' : '+'}
    </button>
  </div>
</header>
