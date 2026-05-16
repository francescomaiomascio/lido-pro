<script lang="ts">
  import { paymentMethodLabels } from '../../lib/format/accountLabels'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import type {
    CustomerAccountSummary,
    CustomerPaymentSummary,
  } from '../../lib/types/customerProfile'

  let {
    summary,
    recentPayments = [],
  }: {
    summary: CustomerAccountSummary
    recentPayments?: CustomerPaymentSummary[]
  } = $props()
</script>

<section class="customer-profile-section customer-ledger-summary" aria-label="Conti">
  <div class="settings-subheader">
    <h3>Conti</h3>
  </div>

  <dl class="customer-metric-grid">
    <div><dt>Conti</dt><dd>{summary.totalAccounts}</dd></div>
    <div><dt>Aperti</dt><dd>{summary.openAccounts}</dd></div>
    <div><dt>Dovuto</dt><dd>{formatEuroFromCents(summary.totalAmountCents)}</dd></div>
    <div><dt>Pagato</dt><dd>{formatEuroFromCents(summary.paidAmountCents)}</dd></div>
    <div><dt>Saldo</dt><dd>{formatEuroFromCents(summary.balanceAmountCents)}</dd></div>
    {#each recentPayments as payment (payment.id)}
      <div class="customer-metric-grid__history-row">
        <dt>{formatEuroFromCents(payment.amountCents)}</dt>
        <dd>{formatCompactDateTime(payment.paidAt)}</dd>
        <dd>{paymentMethodLabels[payment.paymentMethod]}</dd>
        <dd>{payment.itemCode || '—'}</dd>
        <dd>Pagamento</dd>
      </div>
    {:else}
      <div class="customer-metric-grid__history-row customer-metric-grid__history-row--empty">
        <dt>Ultimi pagamenti</dt>
        <dd>Nessun pagamento registrato.</dd>
      </div>
    {/each}
  </dl>
</section>
