<script lang="ts">
  import { accountTypeLabels } from '../../../lib/format/accountLabels'
  import { formatEuroFromCents, parseEuroToCents } from '../../../lib/format/money'
  import PaymentProgressBar from '../PaymentProgressBar.svelte'
  import type { Account, AccountInput, AccountType } from '../../../lib/types/account'
  import type { BeachItemAssignedCustomer } from '../../../lib/types/customer'
  import type { Reservation } from '../../../lib/types/reservation'
  import type { PriceSuggestion } from '../../../lib/types/tariff'
  import ActionActivity from '../../loading/ActionActivity.svelte'

  let { itemId, assignedCustomer, reservation, account, priceSuggestion, saving, onSave, onClose }: {
    itemId: string
    assignedCustomer: BeachItemAssignedCustomer
    reservation: Reservation | null
    account: Account | null
    priceSuggestion: PriceSuggestion | null
    saving: boolean
    onSave: (accountId: string | null, input: AccountInput) => void | Promise<void>
    onClose: () => void
  } = $props()

  let loadedId = $state<string | null>(null)
  let accountType: AccountType = $state('daily')
  let total = $state('')
  let error: string | null = $state(null)

  $effect(() => {
    const nextId = account?.id ?? null
    if (nextId === loadedId) return
    loadedId = nextId
    accountType = account?.accountType ?? reservation?.reservationType ?? assignedCustomer.assignment.assignmentType
    total = account
      ? formatEuroFromCents(account.totalAmountCents).replace('€', '').trim()
      : priceSuggestion && priceSuggestion.confidence !== 'none'
        ? formatEuroFromCents(priceSuggestion.amountCents).replace('€', '').trim()
        : ''
    error = null
  })

  const submit = async () => {
    const cents = parseEuroToCents(total)
    if (!Number.isFinite(cents) || cents < 0) {
      error = 'Importo non valido'
      return
    }
    await onSave(account?.id ?? null, {
      itemId,
      customerId: assignedCustomer.customer.id,
      assignmentId: assignedCustomer.assignment.id,
      accountType,
      totalAmountCents: cents,
      notes: 'Manuale',
    })
  }
  const accountSource = $derived.by(() => {
    if (account?.notes?.toLowerCase().includes('manuale')) return 'Manuale'
    if (account?.notes?.toLowerCase().includes('da listino')) return account.notes
    if (priceSuggestion && priceSuggestion.confidence !== 'none') return `Da listino: ${priceSuggestion.tariffRule?.name ?? 'Tariffa'}`
    return 'Totale modificabile.'
  })
</script>

<section class="inline-editor" aria-label="Conto">
  <header class="inline-editor__header">
    <div>
      <strong>Conto prenotazione</strong>
      <span>{accountSource}{!account && priceSuggestion && priceSuggestion.confidence !== 'none' ? ` · ${formatEuroFromCents(priceSuggestion.amountCents)}` : ''}</span>
    </div>
    <button type="button" onclick={onClose}>Annulla</button>
  </header>
  {#if account}
    <div class="inline-editor__money-summary">
      <span>Totale conto <strong>{formatEuroFromCents(account.totalAmountCents)}</strong></span>
      <span>Pagato <strong>{formatEuroFromCents(account.paidAmountCents)}</strong></span>
      <span>Residuo <strong>{formatEuroFromCents(account.balanceAmountCents)}</strong></span>
    </div>
    <PaymentProgressBar totalAmountCents={account.totalAmountCents} paidAmountCents={account.paidAmountCents} />
  {/if}
  <div class="inline-editor__field-grid">
    <label>Tipo<input value={accountTypeLabels[accountType]} disabled /></label>
    <label>Importo conto<input bind:value={total} inputmode="decimal" placeholder="100,00" /></label>
  </div>
  {#if error}<p class="inline-editor__error">{error}</p>{/if}
  <div class="inline-editor__actions">
    <button type="button" disabled={saving} onclick={submit}>
      {#if saving}
        <ActionActivity label="Salvataggio conto" />
      {:else}
        Modifica importo conto
      {/if}
    </button>
  </div>
</section>
