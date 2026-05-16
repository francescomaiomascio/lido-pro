<script lang="ts">
  import AccountForm from './AccountForm.svelte'
  import AccountSummary from './AccountSummary.svelte'
  import PaymentForm from './PaymentForm.svelte'
  import PaymentTimeline from './PaymentTimeline.svelte'
  import type { Account, AccountInput, Payment, PaymentMethod } from '../../lib/types/account'
  import type { BeachItemAssignedCustomer } from '../../lib/types/customer'
  import type { Reservation } from '../../lib/types/reservation'
  import type { AccountLedger, LedgerPaymentRow } from '../../lib/types/reservationSummary'
  import type { PriceSuggestion } from '../../lib/types/tariff'
  import AccountLedgerPanel from './AccountLedgerPanel.svelte'
  import PriceSuggestionCard from '../tariffs/PriceSuggestionCard.svelte'

  type Mode = 'account' | 'payments'

  let {
    itemId,
    assignedCustomer,
    account,
    reservation = null,
    payments,
    ledger = null,
    priceSuggestion,
    panelMode = 'account',
    saving,
    onCreateAccount,
    onUpdateTotal,
    onAddPayment,
    onCloseAccount,
  }: {
    itemId: string
    assignedCustomer: BeachItemAssignedCustomer | null
    account: Account | null
    reservation?: Reservation | null
    payments: Payment[]
    ledger?: AccountLedger | null
    priceSuggestion: PriceSuggestion | null
    panelMode?: Mode
    saving: boolean
    onCreateAccount: (input: AccountInput) => void | Promise<void>
    onUpdateTotal: (accountId: string, totalAmountCents: number) => void | Promise<void>
    onAddPayment: (
      accountId: string,
      amountCents: number,
      paymentMethod: PaymentMethod,
      note: string,
    ) => void | Promise<void>
    onCloseAccount: (accountId: string) => void | Promise<void>
  } = $props()

  const paymentRows = $derived<LedgerPaymentRow[]>(
    ledger?.paymentRows ??
      payments.map((payment) => ({
        id: payment.id,
        amountCents: payment.amountCents,
        paidAt: payment.paidAt,
        method: payment.paymentMethod,
        note: payment.note,
      })),
  )
</script>

<section class="account-panel" aria-label="Conto">
  <div class="section-heading">
    <h3>{panelMode === 'payments' ? 'Pagamenti' : 'Conto'}</h3>
  </div>

  {#if !assignedCustomer}
    <p class="empty-customer">Assegna prima un cliente per creare un conto.</p>
  {:else if panelMode === 'payments' && !account}
    <p class="empty-customer">Apri prima un conto per registrare pagamenti.</p>
  {:else if panelMode === 'account' && !account}
    <AccountForm
      account={account}
      {itemId}
      customerId={assignedCustomer.customer.id}
      assignmentId={assignedCustomer.assignment.id}
      defaultAccountType={(reservation?.reservationType ?? assignedCustomer.assignment.assignmentType)}
      lockAccountType={Boolean(reservation)}
      {priceSuggestion}
      {saving}
      onSave={onCreateAccount}
      onCancel={null}
    />
  {:else if panelMode === 'payments' && account}
    <PaymentForm
      balanceAmountCents={account.balanceAmountCents}
      {saving}
      onSave={(amountCents, paymentMethod, note) => onAddPayment(account.id, amountCents, paymentMethod, note)}
      onCancel={null}
    />
    <PaymentTimeline payments={paymentRows} />
  {:else if account}
    {#if ledger}
      <AccountLedgerPanel {ledger} compact />
    {:else}
      <AccountSummary {account} />
    {/if}
    {#if priceSuggestion && priceSuggestion.confidence !== 'none' && priceSuggestion.amountCents !== account.totalAmountCents}
      <PriceSuggestionCard
        suggestion={priceSuggestion}
        showAction
        onUse={() => onUpdateTotal(account.id, priceSuggestion.amountCents)}
      />
    {/if}
    {#if account.notes}
      <p class="account-note">{account.notes}</p>
    {/if}
    <AccountForm
      account={account}
      {itemId}
      customerId={assignedCustomer.customer.id}
      assignmentId={assignedCustomer.assignment.id}
      defaultAccountType={(reservation?.reservationType ?? assignedCustomer.assignment.assignmentType)}
      lockAccountType={Boolean(reservation)}
      {priceSuggestion}
      {saving}
      onSave={(input) => onUpdateTotal(account.id, input.totalAmountCents)}
      onCancel={null}
    />
    <div class="customer-actions">
      <button type="button" disabled={saving} onclick={() => onCloseAccount(account.id)}>Chiudi conto</button>
    </div>
  {/if}
</section>
