<script lang="ts">
  import BeachItemHistory from './BeachItemHistory.svelte'
  import BeachItemOperationalNote from './BeachItemOperationalNote.svelte'
  import AccountPanel from '../accounts/AccountPanel.svelte'
  import CustomerAssignmentPanel from '../customers/CustomerAssignmentPanel.svelte'
  import ReservationPanel from '../reservations/ReservationPanel.svelte'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import {
    getBeachItemStatusLabel,
    getBeachItemTypeLabel,
  } from '../../lib/format/beachLabels'
  import type {
    BeachItem,
    BeachItemStatusEvent,
  } from '../../lib/types/beach'
  import type { AccountInput, Payment, PaymentMethod } from '../../lib/types/account'
  import type { ReservationInput } from '../../lib/types/reservation'
  import type { PriceSuggestion } from '../../lib/types/tariff'

  let {
    item,
    saving,
    confirmation,
    events,
    onNoteSave,
    onAssignCustomer,
    onUnassignCustomer,
    payments,
    priceSuggestion,
    onCreateAccount,
    onUpdateAccountTotal,
    onAddPayment,
    onCloseAccount,
    onCreateReservation,
    onUpdateReservation,
    onCancelReservation,
  }: {
    item: BeachItem | null
    saving: boolean
    confirmation: string | null
    events: BeachItemStatusEvent[]
    onNoteSave: (note: string) => void
    onAssignCustomer: (customerId: string) => void | Promise<void>
    onUnassignCustomer: () => void | Promise<void>
    payments: Payment[]
    priceSuggestion: PriceSuggestion | null
    onCreateAccount: (input: AccountInput) => void | Promise<void>
    onUpdateAccountTotal: (accountId: string, totalAmountCents: number) => void | Promise<void>
    onAddPayment: (
      accountId: string,
      amountCents: number,
      paymentMethod: PaymentMethod,
      note: string,
    ) => void | Promise<void>
    onCloseAccount: (accountId: string) => void | Promise<void>
    onCreateReservation: (input: ReservationInput) => void | Promise<void>
    onUpdateReservation: (
      reservationId: string,
      input: ReservationInput,
    ) => void | Promise<void>
    onCancelReservation: (reservationId: string) => void | Promise<void>
  } = $props()

  let showTechnicalDetails = $state(false)
</script>

<aside class="detail-panel" aria-label="Dettaglio posto">
  {#if item}
    <div class="detail-header">
      <span>{getBeachItemTypeLabel(item.type)}</span>
      <h2>{item.code}</h2>
      <strong class={`status-text status-text--${item.status}`}>
        {getBeachItemStatusLabel(item.status)}
      </strong>
    </div>

    <dl class="detail-list">
      <div>
        <dt>Fila</dt>
        <dd>{item.rowLabel}</dd>
      </div>
      <div>
        <dt>Numero</dt>
        <dd>{item.numberIndex}</dd>
      </div>
      <div>
        <dt>Ultimo aggiornamento</dt>
        <dd>{formatCompactDateTime(item.statusUpdatedAt)}</dd>
      </div>
    </dl>

    <CustomerAssignmentPanel
      assignedCustomer={item.assignedCustomer ?? null}
      {saving}
      {onAssignCustomer}
      {onUnassignCustomer}
    />

    <AccountPanel
      itemId={item.id}
      assignedCustomer={item.assignedCustomer ?? null}
      account={item.activeAccount ?? null}
      {payments}
      {priceSuggestion}
      {saving}
      {onCreateAccount}
      onUpdateTotal={onUpdateAccountTotal}
      {onAddPayment}
      {onCloseAccount}
    />

    <ReservationPanel
      itemId={item.id}
      itemCode={item.code}
      assignedCustomer={item.assignedCustomer ?? null}
      account={item.activeAccount ?? null}
      reservation={item.currentReservation ?? null}
      {saving}
      {onCreateReservation}
      {onUpdateReservation}
      {onCancelReservation}
    />

    <BeachItemOperationalNote value={item.operationalNote} {saving} onSave={onNoteSave} />

    <details class="technical-details" bind:open={showTechnicalDetails}>
      <summary>Dettagli tecnici</summary>
      <p>x: {item.xM}m · y: {item.yM}m</p>
      <p>ingombro: {item.widthM}m x {item.heightM}m · rotazione: {item.rotationDeg}°</p>
    </details>

    <BeachItemHistory {events} />

    {#if confirmation}
      <p class="inline-confirmation">{confirmation}</p>
    {/if}
  {:else}
    <div class="empty-detail">
      <h2>Nessun posto selezionato</h2>
      <p>Tocca una palma, un ombrellone o una palmetta per vedere i dettagli.</p>
    </div>
  {/if}
</aside>
