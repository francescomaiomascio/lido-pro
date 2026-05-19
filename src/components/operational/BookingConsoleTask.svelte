<script lang="ts">
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { paymentMethodLabels } from '../../lib/format/accountLabels'
  import type { SavePeriodAndEnsureAccountInput } from '../../lib/services/bookingFlowService'
  import type { OperatorBookingValidationResult } from '../../lib/booking/operatorBookingService'
  import type { AccountInput, Payment, PaymentMethod } from '../../lib/types/account'
  import type { BeachItem } from '../../lib/types/beach'
  import type { AccountExtraItem, AccountExtraItemInput, ExtraItemCatalogEntry, TariffIncludedItem } from '../../lib/types/extraItem'
  import type { ReservationSummary } from '../../lib/types/reservationSummary'
  import type { PriceSuggestion } from '../../lib/types/tariff'
  import type { BookingWorkspaceMode } from './bookingConsole.types'
  import AccountInlineEditor from './editors/AccountInlineEditor.svelte'
  import CustomerInlineEditor from './editors/CustomerInlineEditor.svelte'
  import ExtraInlineEditor from './editors/ExtraInlineEditor.svelte'
  import PaymentInlineEditor from './editors/PaymentInlineEditor.svelte'
  import PeriodInlineEditor from './editors/PeriodInlineEditor.svelte'

  let {
    mode,
    title,
    description,
    item,
    effectiveReservation,
    accountStateLabel,
    saving,
    payments,
    priceSuggestion,
    extraCatalog,
    accountExtras,
    includedEquipment,
    onClose,
    onAssignCustomer,
    onUnassignCustomer,
    onCreateAccount,
    onUpdateAccountTotal,
    onAddPayment,
    onSavePeriodAndEnsureAccount,
    onValidatePeriod,
    onAddExtraItem,
    onRemoveExtraItem,
    onOpenAccount,
    onOpenPayment,
    onCancelReservation,
  }: {
    mode: BookingWorkspaceMode
    title: string
    description: string
    item: BeachItem
    effectiveReservation: ReservationSummary['reservation'] | null
    accountStateLabel: string
    saving: boolean
    payments: Payment[]
    priceSuggestion: PriceSuggestion | null
    extraCatalog: ExtraItemCatalogEntry[]
    accountExtras: AccountExtraItem[]
    includedEquipment: TariffIncludedItem[]
    onClose: () => void
    onAssignCustomer: (customerId: string) => void | Promise<void>
    onUnassignCustomer: () => void | Promise<void>
    onCreateAccount: (input: AccountInput) => void | Promise<void>
    onUpdateAccountTotal: (accountId: string, totalAmountCents: number) => void | Promise<void>
    onAddPayment: (accountId: string, amountCents: number, paymentMethod: PaymentMethod, note: string) => void | Promise<void>
    onSavePeriodAndEnsureAccount: (input: Omit<SavePeriodAndEnsureAccountInput, 'item' | 'assignedCustomer'>) => void | Promise<void>
    onValidatePeriod: (input: Omit<SavePeriodAndEnsureAccountInput, 'item' | 'assignedCustomer'>) => Promise<OperatorBookingValidationResult>
    onAddExtraItem: (accountId: string, input: AccountExtraItemInput) => void | Promise<void>
    onRemoveExtraItem: (id: string) => void | Promise<void>
    onOpenAccount: () => void
    onOpenPayment: () => void
    onCancelReservation: (() => void | Promise<void>) | null
  } = $props()

  const totalPaid = $derived(payments.reduce((sum, payment) => sum + payment.amountCents, 0))
  const recentPayments = $derived(payments.slice(0, 3))
  const hasOpenBalance = $derived(Boolean(item.activeAccount && item.activeAccount.balanceAmountCents > 0))
</script>

<section class="booking-console-task" aria-label={title} data-mode={mode}>
  <header class="booking-console-task__head">
    <div>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
    <button type="button" onclick={onClose}>Panoramica</button>
  </header>

  {#if mode === 'assign-customer'}
    <CustomerInlineEditor
      assignedCustomer={item.assignedCustomer ?? null}
      {saving}
      onAssign={async (customerId) => {
        await onAssignCustomer(customerId)
        onClose()
      }}
      onRemove={async () => {
        await onUnassignCustomer()
        onClose()
      }}
      {onClose}
    />
  {:else if mode === 'edit-period' && item.assignedCustomer}
    <PeriodInlineEditor
      itemId={item.id}
      assignedCustomer={item.assignedCustomer}
      reservation={effectiveReservation}
      accountId={item.activeAccount?.id ?? null}
      {saving}
      onValidate={onValidatePeriod}
      onSave={async (reservationId, input) => {
        await onSavePeriodAndEnsureAccount({
          reservationId,
          reservationType: input.reservationType,
          startDate: input.startDate,
          endDate: input.endDate,
        })
        onClose()
      }}
      {onClose}
    />
  {:else if mode === 'edit-due' && item.assignedCustomer}
    <AccountInlineEditor
      itemId={item.id}
      assignedCustomer={item.assignedCustomer}
      reservation={effectiveReservation}
      account={item.activeAccount ?? null}
      {priceSuggestion}
      {saving}
      onSave={async (accountId, input) => {
        if (accountId) await onUpdateAccountTotal(accountId, input.totalAmountCents)
        else await onCreateAccount(input)
        onClose()
      }}
      {onClose}
    />
    {#if item.activeAccount}
      <section class="booking-account-embedded-payments" aria-label="Pagamenti conto">
        <header>
          <div>
            <span>Pagamenti nel conto</span>
            <strong>{payments.length ? `${payments.length} · ${formatEuroFromCents(totalPaid)}` : 'Nessun pagamento'}</strong>
          </div>
          {#if hasOpenBalance}
            <button type="button" onclick={onOpenPayment}>Registra pagamento</button>
          {/if}
        </header>
        {#each recentPayments as payment}
          <div class="booking-payment-line">
            <strong>{formatEuroFromCents(payment.amountCents)}</strong>
            <small>{paymentMethodLabels[payment.paymentMethod]} · {formatCompactDateTime(payment.paidAt)}</small>
          </div>
        {:else}
          <p>Registra il primo incasso dal conto quando il cliente paga.</p>
        {/each}
      </section>
    {/if}
  {:else if mode === 'add-payment' && item.activeAccount}
    <div class="booking-payment-context" aria-label="Contesto pagamento">
      <div>
        <span>Residuo</span>
        <strong>{formatEuroFromCents(item.activeAccount.balanceAmountCents)}</strong>
      </div>
      <div>
        <span>Pagato</span>
        <strong>{formatEuroFromCents(item.activeAccount.paidAmountCents)}</strong>
      </div>
      <div>
        <span>Stato</span>
        <strong>{accountStateLabel}</strong>
      </div>
    </div>
    <PaymentInlineEditor
      account={item.activeAccount}
      {saving}
      onSave={async (amount, method, note) => {
        await onAddPayment(item.activeAccount!.id, amount, method, note)
        onClose()
      }}
      {onClose}
    />
    <section class="booking-payments-list" aria-label="Ultimi pagamenti">
      <span>{payments.length ? `${payments.length} pagamenti · ${formatEuroFromCents(totalPaid)}` : 'Nessun pagamento registrato'}</span>
      {#each recentPayments as payment}
        <div>
          <strong>{formatEuroFromCents(payment.amountCents)}</strong>
          <small>{paymentMethodLabels[payment.paymentMethod]} · {formatCompactDateTime(payment.paidAt)}</small>
        </div>
      {/each}
    </section>
  {:else if mode === 'manage-extras' && item.activeAccount}
    <ExtraInlineEditor
      account={item.activeAccount}
      catalog={extraCatalog}
      items={accountExtras}
      includedItems={includedEquipment}
      {saving}
      onAdd={onAddExtraItem}
      onRemove={onRemoveExtraItem}
      {onClose}
    />
  {:else if mode === 'manage-extras'}
    <section class="booking-empty-task">
      <strong>Prepara prima il conto</strong>
      <p>Gli Articoli extra si collegano al conto del posto.</p>
      <button type="button" onclick={onOpenAccount}>Apri conto</button>
    </section>
  {:else}
    <section class="booking-empty-task">
      <strong>Azione non disponibile</strong>
      <p>Completa i passaggi precedenti dalla panoramica.</p>
      <button type="button" onclick={onClose}>Torna alla panoramica</button>
    </section>
  {/if}

  {#if onCancelReservation && mode !== 'add-payment'}
    <section class="booking-danger-zone" aria-label="Azioni prenotazione">
      <div>
        <strong>Annullamento prenotazione</strong>
        <span>Prima di procedere viene richiesta conferma. I pagamenti non vengono eliminati.</span>
      </div>
      <button type="button" onclick={onCancelReservation}>Annulla prenotazione</button>
    </section>
  {/if}
</section>
