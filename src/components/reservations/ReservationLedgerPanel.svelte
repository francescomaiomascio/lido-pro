<script lang="ts">
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import type { ReservationSummary } from '../../lib/types/reservationSummary'
  import AccountLedgerPanel from '../accounts/AccountLedgerPanel.svelte'
  import ReservationSummaryCard from './ReservationSummaryCard.svelte'

  let {
    summary,
  }: {
    summary: ReservationSummary | null
  } = $props()
</script>

<section class="reservation-ledger-panel" aria-label="Scheda prenotazione e conto">
  <ReservationSummaryCard {summary} />

  {#if summary?.ledger}
    <AccountLedgerPanel ledger={summary.ledger} />
  {/if}

  {#if summary}
    <section class="ledger-section">
      <div class="ledger-section__heading">
        <h4>Timeline</h4>
        <span>{summary.timeline.length}</span>
      </div>
      <div class="ledger-timeline">
        {#each summary.timeline as entry (entry.id)}
          <article class={`ledger-timeline__row tone-${entry.tone}`}>
            <i aria-hidden="true"></i>
            <div>
              <strong>{entry.label}</strong>
              <span>{formatCompactDateTime(entry.date)}</span>
              {#if entry.detail}
                <small>{entry.detail}</small>
              {/if}
            </div>
          </article>
        {/each}
      </div>
    </section>
  {/if}
</section>
