<script lang="ts">
  import { paymentMethodLabels } from '../../lib/format/accountLabels'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { Payment } from '../../lib/types/account'

  let {
    payments,
  }: {
    payments: Payment[]
  } = $props()
</script>

<section class="payment-list" aria-label="Pagamenti">
  <h4>Pagamenti</h4>
  {#each payments as payment (payment.id)}
    <article>
      <strong>{formatEuroFromCents(payment.amountCents)}</strong>
      <span>{paymentMethodLabels[payment.paymentMethod]} · {formatCompactDateTime(payment.paidAt)}</span>
      {#if payment.note}
        <small>{payment.note}</small>
      {/if}
    </article>
  {:else}
    <p>Nessun pagamento registrato.</p>
  {/each}
</section>
