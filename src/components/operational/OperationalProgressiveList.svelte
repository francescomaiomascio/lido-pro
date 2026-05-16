<script lang="ts">
  import { getBeachItemStatusLabel, getBeachItemTypeLabel } from '../../lib/format/beachLabels'
  import { buildOperationalRows } from '../../lib/operational/operationalRows'
  import type { SavePeriodAndEnsureAccountInput } from '../../lib/services/bookingFlowService'
  import { requestOpenRegistry } from '../../lib/state/registryFilters'
  import type { OperationalPanelTab } from '../../lib/state/operationalPanelState'
  import type { AccountInput, Payment, PaymentMethod } from '../../lib/types/account'
  import type { BeachItem, BeachItemStatusEvent } from '../../lib/types/beach'
  import type { AccountExtraItem, AccountExtraItemInput, ExtraItemCatalogEntry, TariffIncludedItem } from '../../lib/types/extraItem'
  import type { ReservationInput } from '../../lib/types/reservation'
  import type { PriceSuggestion } from '../../lib/types/tariff'
  import type { ReservationSummary } from '../../lib/types/reservationSummary'
  import AccountInlineEditor from './editors/AccountInlineEditor.svelte'
  import CustomerInlineEditor from './editors/CustomerInlineEditor.svelte'
  import ExtraInlineEditor from './editors/ExtraInlineEditor.svelte'
  import PaymentInlineEditor from './editors/PaymentInlineEditor.svelte'
  import PeriodInlineEditor from './editors/PeriodInlineEditor.svelte'
  import OperationalStepRow from './OperationalStepRow.svelte'

  let {
    item, activeTab, saving, confirmation: _confirmation, events, payments, priceSuggestion, reservationSummary, operationalError, extraCatalog, accountExtras, includedEquipment,
    onTabChange, onToggleExpand, onAssignCustomer, onUnassignCustomer, onCreateAccount, onUpdateAccountTotal,
    onAddPayment, onCreateReservation, onUpdateReservation, onSavePeriodAndEnsureAccount, onAddExtraItem, onRemoveExtraItem,
  }: {
    item: BeachItem
    activeTab: OperationalPanelTab
    saving: boolean
    confirmation: string | null
    events: BeachItemStatusEvent[]
    payments: Payment[]
    priceSuggestion: PriceSuggestion | null
    reservationSummary: ReservationSummary | null
    operationalError: string | null
    extraCatalog: ExtraItemCatalogEntry[]
    accountExtras: AccountExtraItem[]
    includedEquipment: TariffIncludedItem[]
    onTabChange: (tab: OperationalPanelTab) => void
    onToggleExpand: () => void
    onAssignCustomer: (customerId: string) => void | Promise<void>
    onUnassignCustomer: () => void | Promise<void>
    onCreateAccount: (input: AccountInput) => void | Promise<void>
    onUpdateAccountTotal: (accountId: string, totalAmountCents: number) => void | Promise<void>
    onAddPayment: (accountId: string, amountCents: number, paymentMethod: PaymentMethod, note: string) => void | Promise<void>
    onCreateReservation: (input: ReservationInput) => void | Promise<void>
    onUpdateReservation: (reservationId: string, input: ReservationInput) => void | Promise<void>
    onSavePeriodAndEnsureAccount: (input: Omit<SavePeriodAndEnsureAccountInput, 'item' | 'assignedCustomer'>) => void | Promise<void>
    onAddExtraItem: (accountId: string, input: AccountExtraItemInput) => void | Promise<void>
    onRemoveExtraItem: (id: string) => void | Promise<void>
  } = $props()

  const effectiveReservation = $derived(reservationSummary?.reservation ?? item.currentReservation ?? null)
  const rows = $derived(buildOperationalRows({ item, reservation: effectiveReservation, priceSuggestion, payments, extras: accountExtras, includedEquipment, events }))
  const openRegistry = () => requestOpenRegistry({
    customerId: item.assignedCustomer?.customer.id,
    customerName: item.assignedCustomer?.customer.fullName,
    itemId: item.id,
    itemCode: item.code,
    reservationId: item.currentReservation?.id,
  })
  const handleRowAction = (row: (typeof rows)[number]) => {
    if (!row.enabled) return
    if (row.key === 'registry') {
      openRegistry()
      return
    }
    if (row.editorType) onTabChange(activeTab === row.editorType ? 'overview' : row.editorType)
  }
</script>

<div class="operational-progressive-list">
  <header class="operational-progressive-list__header">
    <strong>{item.code}</strong>
    <span>{getBeachItemTypeLabel(item.type)}</span>
    <em>{getBeachItemStatusLabel(item.status)}</em>
    <button type="button" onclick={onToggleExpand} aria-label="Riduci pannello">−</button>
  </header>

  {#each rows as row (row.key)}
    <OperationalStepRow {row} expanded={activeTab === row.editorType} onAction={() => handleRowAction(row)}>
      {#if row.key === 'customer'}
        <CustomerInlineEditor assignedCustomer={item.assignedCustomer ?? null} {saving} onAssign={onAssignCustomer} onRemove={onUnassignCustomer} onClose={() => onTabChange('overview')} />
      {:else if row.key === 'period' && item.assignedCustomer}
        <PeriodInlineEditor itemId={item.id} assignedCustomer={item.assignedCustomer} reservation={effectiveReservation} accountId={item.activeAccount?.id ?? null} {saving} onSave={async (reservationId, input) => {
          await onSavePeriodAndEnsureAccount({
            reservationId,
            reservationType: input.reservationType,
            startDate: input.startDate,
            endDate: input.endDate,
          })
        }} onClose={() => onTabChange('overview')} />
      {:else if row.key === 'account' && item.assignedCustomer}
        <AccountInlineEditor itemId={item.id} assignedCustomer={item.assignedCustomer} reservation={effectiveReservation} account={item.activeAccount ?? null} {priceSuggestion} {saving} onSave={async (accountId, input) => {
          if (accountId) await onUpdateAccountTotal(accountId, input.totalAmountCents)
          else await onCreateAccount(input)
          onTabChange('overview')
        }} onClose={() => onTabChange('overview')} />
      {:else if row.key === 'payments' && item.activeAccount}
        <PaymentInlineEditor account={item.activeAccount} {saving} onSave={async (amount, method, note) => {
          await onAddPayment(item.activeAccount!.id, amount, method, note)
          onTabChange('overview')
        }} onClose={() => onTabChange('overview')} />
      {:else if row.key === 'extra' && item.activeAccount}
        <ExtraInlineEditor account={item.activeAccount} catalog={extraCatalog} items={accountExtras} includedItems={includedEquipment} {saving} onAdd={onAddExtraItem} onRemove={onRemoveExtraItem} onClose={() => onTabChange('overview')} />
      {:else if row.key === 'technical'}
        <div class="operational-technical-inline">
          <span>ID {item.id}</span>
          <span>Layout {item.layoutId}</span>
          <span>{item.xM}m, {item.yM}m · {item.widthM}m x {item.heightM}m</span>
        </div>
      {/if}
    </OperationalStepRow>
  {/each}

  {#if operationalError}
    <p class="inline-error">{operationalError}</p>
  {/if}
</div>
