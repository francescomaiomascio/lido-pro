<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { RegistrySummary } from '../../lib/types/registry'

  let {
    summary,
  }: {
    summary: RegistrySummary
  } = $props()
</script>

<dl class="registry-summary-strip" aria-label="Riepilogo registro">
  <div><dt>Prenotazioni</dt><dd>{summary.totalReservations}</dd></div>
  <div><dt>Clienti</dt><dd>{summary.totalCustomers}</dd></div>
  <div><dt>Dovuto</dt><dd>{formatEuroFromCents(summary.totalDueCents)}</dd></div>
  <div><dt>Incassato</dt><dd>{formatEuroFromCents(summary.totalPaidCents)}</dd></div>
  <div><dt>Saldo aperto</dt><dd>{formatEuroFromCents(summary.totalBalanceCents)}</dd></div>
  <div><dt>Conti aperti</dt><dd>{summary.openAccounts}</dd></div>
</dl>
