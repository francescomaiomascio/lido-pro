<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { Account } from '../../lib/types/account'
  import type { PriceSuggestion } from '../../lib/types/tariff'
  import type { Snippet } from 'svelte'
  import PaymentProgressBar from './PaymentProgressBar.svelte'

  let {
    account,
    priceSuggestion,
    paymentCount,
    lastPaymentLabel,
    editing,
    paymentEditing,
    canEdit,
    onEditAmount,
    onAddPayment,
    children,
    paymentEditor,
  }: {
    account: Account | null
    priceSuggestion: PriceSuggestion | null
    paymentCount: number
    lastPaymentLabel: string | null
    editing: boolean
    paymentEditing: boolean
    canEdit: boolean
    onEditAmount: () => void
    onAddPayment: () => void
    children?: Snippet
    paymentEditor?: Snippet
  } = $props()

  const tariffLabel = $derived(
    priceSuggestion && priceSuggestion.confidence !== 'none'
      ? `Tariffa applicata: ${priceSuggestion.tariffRule?.name ?? 'Tariffa'} · ${formatEuroFromCents(priceSuggestion.amountCents)}`
      : null,
  )
  const needsAmount = $derived(Boolean(account && account.totalAmountCents === 0 && (!priceSuggestion || priceSuggestion.confidence === 'none')))
</script>

<section class="booking-block booking-block--account" class:booking-block--editing={editing || paymentEditing} aria-label="Conto">
  <div class="booking-block__head">
    <div>
      <span>Conto</span>
      {#if account}
        <strong>{needsAmount ? 'Importo da impostare' : 'Riepilogo conto'}</strong>
        {#if needsAmount}<small>Tariffa non trovata. Imposta il dovuto dal conto.</small>{/if}
      {:else}
        <strong>Imposta il periodo per generare il conto.</strong>
        <small>{tariffLabel ?? 'Il conto nasce da cliente, periodo e tariffario.'}</small>
      {/if}
    </div>
    {#if account && !editing && !paymentEditing}
      <div class="booking-block__actions">
        <button type="button" onclick={onAddPayment}>Registra pagamento</button>
        <button type="button" onclick={onEditAmount}>Modifica importo conto</button>
      </div>
    {:else if !account && canEdit && !editing}
      <button type="button" onclick={onEditAmount}>Ripara conto</button>
    {/if}
  </div>
  {#if account}
    <div class="booking-money-grid">
      <div><span>Totale conto</span><strong>{formatEuroFromCents(account.totalAmountCents)}</strong></div>
      <div><span>Pagato</span><strong>{formatEuroFromCents(account.paidAmountCents)}</strong></div>
      <div><span>Residuo</span><strong>{formatEuroFromCents(account.balanceAmountCents)}</strong></div>
    </div>
    <PaymentProgressBar totalAmountCents={account.totalAmountCents} paidAmountCents={account.paidAmountCents} />
    <small>{needsAmount ? 'Importo da impostare' : (tariffLabel ?? 'Totale modificabile')} · {paymentCount ? `${paymentCount} pagamenti` : 'Nessun pagamento'}{lastPaymentLabel ? ` · Ultimo ${lastPaymentLabel}` : ''}</small>
  {/if}
  {#if editing}
    <div class="booking-block__editor">
      {@render children?.()}
    </div>
  {/if}
  {#if paymentEditing}
    <div class="booking-block__editor">
      {@render paymentEditor?.()}
    </div>
  {/if}
</section>
