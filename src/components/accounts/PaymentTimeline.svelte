<script lang="ts">
  import { paymentMethodLabels } from '../../lib/format/accountLabels'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { LedgerPaymentRow } from '../../lib/types/reservationSummary'

  let {
    payments,
  }: {
    payments: LedgerPaymentRow[]
  } = $props()
</script>

<section class="ledger-section payment-timeline" aria-label="Timeline pagamenti">
  <div class="ledger-section__heading">
    <h4>Pagamenti</h4>
    <span>{payments.length}</span>
  </div>

  <div class="ledger-timeline">
    {#each payments as payment (payment.id)}
      <article class="ledger-timeline__row">
        <i aria-hidden="true"></i>
        <div>
          <strong>{formatEuroFromCents(payment.amountCents)}</strong>
          <span>{formatCompactDateTime(payment.paidAt)} · {paymentMethodLabels[payment.method]}</span>
          {#if payment.note}
            <small>{payment.note}</small>
          {/if}
        </div>
      </article>
    {:else}
      <p class="ledger-empty">Nessun pagamento registrato.</p>
    {/each}
  </div>
</section>
