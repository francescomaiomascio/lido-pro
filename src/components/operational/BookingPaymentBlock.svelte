<script lang="ts">
  import { paymentMethodLabels } from '../../lib/format/accountLabels'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { Payment } from '../../lib/types/account'

  let { payments }: { payments: Payment[] } = $props()

  const total = $derived(payments.reduce((sum, payment) => sum + payment.amountCents, 0))
  const recentPayments = $derived(payments.slice(0, 3))
</script>

<div class="booking-payment-mini" aria-label="Riepilogo pagamenti">
  <div class="booking-payment-mini__head">
    <span>Pagamenti</span>
    <strong>{payments.length ? `${payments.length} · ${formatEuroFromCents(total)}` : 'Nessun pagamento registrato'}</strong>
  </div>
  {#if recentPayments.length}
    <div class="booking-payment-mini__rows">
      {#each recentPayments as payment}
        <div>
          <strong>{formatEuroFromCents(payment.amountCents)}</strong>
          <span>{paymentMethodLabels[payment.paymentMethod]} · {formatCompactDateTime(payment.paidAt)}</span>
        </div>
      {/each}
    </div>
  {/if}
</div>
