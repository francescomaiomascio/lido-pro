<script lang="ts">
  import { formatEuroFromCents } from '../../lib/format/money'
  import type { PriceSuggestion } from '../../lib/types/tariff'

  let {
    suggestion,
    showAction = false,
    onUse,
  }: {
    suggestion: PriceSuggestion | null
    showAction?: boolean
    onUse?: () => void
  } = $props()
</script>

{#if suggestion && suggestion.confidence !== 'none'}
  <section class="price-suggestion-card" aria-label="Tariffa suggerita">
    <span>Tariffa suggerita</span>
    <strong>{formatEuroFromCents(suggestion.amountCents)}</strong>
    <p>{suggestion.reason}</p>
    {#if showAction && onUse}
      <button type="button" onclick={onUse}>Usa tariffa suggerita</button>
    {/if}
  </section>
{/if}
