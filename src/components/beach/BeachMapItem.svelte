<script lang="ts">
  import {
    getBeachItemStatusLabel,
    getBeachItemUsageTypeLabel,
    getMapDisplayCode,
  } from '../../lib/format/beachLabels'
  import { toPercentHeight, toPercentWidth, toPercentX, toPercentY } from '../../lib/layout/layoutMath'
  import type { BeachItem, BeachLayout } from '../../lib/types/beach'

  let {
    item,
    layout,
    selected,
    dimmed,
    onSelect,
  }: {
    item: BeachItem
    layout: BeachLayout
    selected: boolean
    dimmed: boolean
    onSelect: (itemId: string) => void
  } = $props()
</script>

<button
  type="button"
  class={`map-item map-item--${item.type} map-item--${item.status}`}
  class:seasonal={item.usageType === 'seasonal'}
  class:has-customer={Boolean(item.assignedCustomer)}
  class:has-account={Boolean(item.activeAccount)}
  class:account-paid={item.activeAccount?.status === 'paid'}
  class:has-reservation={Boolean(item.currentReservation)}
  class:selected
  class:dimmed
  style={`left: ${toPercentX(item, layout)}%; top: ${toPercentY(item, layout)}%; width: ${toPercentWidth(item, layout)}%; height: ${toPercentHeight(item, layout)}%; transform: translate(-50%, -50%) rotate(${item.rotationDeg}deg);`}
  aria-label={`${item.code}, ${getBeachItemStatusLabel(item.status)}, ${getBeachItemUsageTypeLabel(item.usageType)}`}
  onclick={() => onSelect(item.id)}
>
  {#if item.operationalNote}
    <small>N</small>
  {/if}
  {#if item.assignedCustomer}
    <small class="customer-marker">C</small>
  {/if}
  {#if item.activeAccount}
    <small class="account-marker">{item.activeAccount.status === 'paid' ? 'OK' : '€'}</small>
  {/if}
  {#if item.currentReservation}
    <small class="reservation-marker">R</small>
  {/if}
  <span>{getMapDisplayCode(item)}</span>
  <em>{item.usageType === 'seasonal' ? 'S' : 'G'}</em>
</button>
