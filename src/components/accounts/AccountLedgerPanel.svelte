<script lang="ts">
  import { accountStatusLabels } from '../../lib/format/accountLabels'
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { AccountLedger } from '../../lib/types/reservationSummary'
  import ExtraItemsSummary from '../extras/ExtraItemsSummary.svelte'
  import PaymentTimeline from './PaymentTimeline.svelte'

  let {
    ledger,
    compact = false,
  }: {
    ledger: AccountLedger | null
    compact?: boolean
  } = $props()
</script>

<section class="account-ledger-panel" class:compact aria-label="Ledger conto">
  {#if ledger}
    <header class="ledger-header">
      <div>
        <span>Conto</span>
        <h3>{accountStatusLabels[ledger.accountStatus]}</h3>
        <p>
          {ledger.customer?.fullName ?? 'Cliente non disponibile'}
          {#if ledger.item}
            · {beachTypeLabels[ledger.item.type]} {ledger.item.code}
          {/if}
        </p>
      </div>
      <strong>{formatEuroFromCents(ledger.balanceAmountCents)}</strong>
    </header>

    <dl class="ledger-metrics">
      <div><dt>Base</dt><dd>{formatEuroFromCents(ledger.baseAmountCents)}</dd></div>
      <div><dt>Extra</dt><dd>{formatEuroFromCents(ledger.extrasAmountCents)}</dd></div>
      <div><dt>Totale</dt><dd>{formatEuroFromCents(ledger.totalAmountCents)}</dd></div>
      <div><dt>Pagato</dt><dd>{formatEuroFromCents(ledger.paidAmountCents)}</dd></div>
      <div><dt>Saldo</dt><dd>{formatEuroFromCents(ledger.balanceAmountCents)}</dd></div>
    </dl>

    {#if !compact}
      <div class="ledger-detail-grid">
        <PaymentTimeline payments={ledger.paymentRows} />
        <ExtraItemsSummary extras={ledger.extraRows} />
      </div>
    {/if}
  {:else}
    <p class="ledger-empty">Nessun conto collegato.</p>
  {/if}
</section>
