<script lang="ts">
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { paymentMethodLabels } from '../../lib/format/accountLabels'
  import type { OperationalPanelTab } from '../../lib/state/operationalPanelState'
  import type { BeachItem } from '../../lib/types/beach'
  import type { Payment } from '../../lib/types/account'
  import PaymentProgressBar from './PaymentProgressBar.svelte'

  let {
    item,
    accountSourceLabel,
    hasReservation,
    hasArticles,
    payments,
    totalPaid,
    onSelect,
    onCancelReservation,
  }: {
    item: BeachItem
    accountSourceLabel: string
    hasReservation: boolean
    hasArticles: boolean
    payments: Payment[]
    totalPaid: number
    onSelect: (tab: OperationalPanelTab) => void
    onCancelReservation: (() => void | Promise<void>) | null
  } = $props()

  const recentPayments = $derived(payments.slice(0, 3))
  const hasCustomer = $derived(Boolean(item.assignedCustomer))
  const hasAccount = $derived(Boolean(item.activeAccount))
  const hasOpenBalance = $derived(Boolean(item.activeAccount && item.activeAccount.balanceAmountCents > 0))
  const nextActionLabel = $derived.by(() => {
    if (!hasCustomer) return 'Assegna cliente'
    if (!hasReservation) return 'Imposta periodo'
    if (!hasAccount) return 'Prepara conto'
    if (!hasArticles) return 'Articoli'
    if (hasOpenBalance) return 'Registra pagamento'
    return 'Controlla conto'
  })
  const nextActionDescription = $derived.by(() => {
    if (!hasCustomer) return 'Inizia collegando il cliente al posto selezionato.'
    if (!hasReservation) return 'Poi scegli il periodo e verifica la disponibilita.'
    if (!hasAccount) return 'Il conto si prepara dopo cliente e periodo.'
    if (!hasArticles) return 'Seleziona Articoli e quantita.'
    if (hasOpenBalance) return 'Il pagamento resta dentro il conto.'
    return 'Prenotazione e conto sono completi.'
  })
</script>

<section class="booking-console-overview" aria-label="Riepilogo prenotazione">
  <section class="booking-next-step" aria-label="Prossimo passaggio">
    <span>Prossimo passaggio</span>
    <strong>{nextActionLabel}</strong>
    <p>{nextActionDescription}</p>
  </section>

  {#if item.activeAccount}
    <div class="booking-money-row" aria-label="Conto">
      <div>
        <span>Totale</span>
        <strong>{formatEuroFromCents(item.activeAccount.totalAmountCents)}</strong>
      </div>
      <div>
        <span>Pagato</span>
        <strong>{formatEuroFromCents(item.activeAccount.paidAmountCents)}</strong>
      </div>
      <div>
        <span>Residuo</span>
        <strong>{formatEuroFromCents(item.activeAccount.balanceAmountCents)}</strong>
      </div>
    </div>
    <PaymentProgressBar totalAmountCents={item.activeAccount.totalAmountCents} paidAmountCents={item.activeAccount.paidAmountCents} />
  {/if}

  <div class="booking-primary-actions">
    {#if !hasCustomer}
      <button type="button" class="primary" onclick={() => onSelect('customer')}>Assegna cliente</button>
    {:else if !hasReservation}
      <button type="button" class="primary" onclick={() => onSelect('period')}>Imposta periodo</button>
      <button type="button" onclick={() => onSelect('customer')}>Cambia cliente</button>
    {:else if !hasAccount}
      <button type="button" class="primary" onclick={() => onSelect('account')}>Prepara conto</button>
      <button type="button" onclick={() => onSelect('period')}>Modifica periodo</button>
    {:else if !hasArticles}
      <button type="button" class="primary" onclick={() => onSelect('extra')}>Articoli</button>
      <button type="button" onclick={() => onSelect('account')}>Apri conto</button>
      {#if hasOpenBalance}
        <button type="button" onclick={() => onSelect('payments')}>Registra pagamento</button>
      {/if}
    {:else if hasOpenBalance}
      <button type="button" class="primary" onclick={() => onSelect('account')}>Apri conto</button>
      <button type="button" onclick={() => onSelect('payments')}>Registra pagamento</button>
      <button type="button" onclick={() => onSelect('extra')}>Articoli</button>
    {:else}
      <button type="button" class="primary" onclick={() => onSelect('account')}>Visualizza conto</button>
      <button type="button" onclick={() => onSelect('extra')}>Articoli</button>
      <button type="button" onclick={() => onSelect('period')}>Periodo</button>
    {/if}
  </div>

  {#if item.activeAccount}
    <p class="booking-console-note">{accountSourceLabel}</p>
  {/if}

  {#if onCancelReservation}
    <section class="booking-danger-zone" aria-label="Azioni prenotazione">
      <div>
        <strong>Annullamento prenotazione</strong>
        <span>Richiede conferma. Conto e pagamenti restano tracciati.</span>
      </div>
      <button type="button" onclick={onCancelReservation}>Annulla prenotazione</button>
    </section>
  {/if}

  <section class="booking-payments-list" aria-label="Ultimi pagamenti">
    <span>{payments.length ? `${payments.length} pagamenti · ${formatEuroFromCents(totalPaid)}` : 'Nessun pagamento registrato'}</span>
    {#each recentPayments as payment}
      <div>
        <strong>{formatEuroFromCents(payment.amountCents)}</strong>
        <small>{paymentMethodLabels[payment.paymentMethod]} · {formatCompactDateTime(payment.paidAt)}</small>
      </div>
    {/each}
  </section>
</section>
