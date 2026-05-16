<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { LedgerExtraRow } from '../../lib/types/reservationSummary'

  let {
    extras,
  }: {
    extras: LedgerExtraRow[]
  } = $props()
</script>

<section class="ledger-section extra-items-summary" aria-label="Extra">
  <div class="ledger-section__heading">
    <h4>Extra</h4>
    <span>{extras.length}</span>
  </div>

  <div class="ledger-rows">
    {#each extras as extra (extra.id)}
      <article class="ledger-row">
        <div>
          <strong>{extra.name}</strong>
          <span>{extra.quantity} x {formatEuroFromCents(extra.unitAmountCents)}</span>
          <small>Incluso/pagato: non ancora modellato</small>
        </div>
        <b>{formatEuroFromCents(extra.totalAmountCents)}</b>
      </article>
    {:else}
      <p class="ledger-empty">Nessun extra collegato.</p>
    {/each}
  </div>
</section>
