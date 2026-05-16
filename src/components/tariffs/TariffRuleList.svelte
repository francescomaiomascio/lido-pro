<script lang="ts">
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { TariffRule } from '../../lib/types/tariff'

  let {
    rules,
    onEdit,
  }: {
    rules: TariffRule[]
    onEdit: (rule: TariffRule) => void
  } = $props()
</script>

<div class="tariff-rule-list">
  <div class="tariff-rule-list__head" aria-hidden="true">
    <span>Nome tariffa</span>
    <span>Categoria / fila</span>
    <span>Tipo periodo</span>
    <span>Importo</span>
    <span></span>
  </div>
  {#each rules as rule (rule.id)}
    <article class="tariff-rule-row">
      <div class="tariff-rule-row__name">
        <strong>{rule.name}</strong>
      </div>
      <span>{beachTypeLabels[rule.itemType]} / {rule.rowLabel ?? 'tutte le file'}</span>
      <span>{reservationTypeLabels[rule.reservationType]}</span>
      <strong class="tariff-rule-row__amount">{formatEuroFromCents(rule.amountCents)}</strong>
      <button type="button" onclick={() => onEdit(rule)}>Modifica</button>
    </article>
  {:else}
    <p class="empty-customer">Nessuna tariffa attiva.</p>
  {/each}
</div>
