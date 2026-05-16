<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'

  let { totalAmountCents, paidAmountCents }: { totalAmountCents: number; paidAmountCents: number } = $props()

  const percent = $derived(totalAmountCents > 0 ? Math.min(100, Math.round((paidAmountCents / totalAmountCents) * 100)) : 0)
</script>

<div class="payment-progress" aria-label={`Avanzamento pagamenti ${percent}%`}>
  <div class="payment-progress__line">
    <span>Pagato {formatEuroFromCents(paidAmountCents)} su {formatEuroFromCents(totalAmountCents)}</span>
    <strong>{percent}%</strong>
  </div>
  <div class="payment-progress__track" aria-hidden="true">
    <span style={`width: ${percent}%`}></span>
  </div>
</div>
