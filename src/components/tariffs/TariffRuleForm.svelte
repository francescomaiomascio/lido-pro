<script lang="ts">
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatEuroFromCents, parseEuroToCents } from '../../lib/format/money'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { TariffRule, TariffRuleInput, TariffReservationType } from '../../lib/types/tariff'

  let {
    rule,
    saving,
    onSave,
    onCancel,
  }: {
    rule: TariffRule
    saving: boolean
    onSave: (input: TariffRuleInput) => void | Promise<void>
    onCancel: () => void
  } = $props()

  let loadedRuleId = $state<string | null>(null)
  let name = $state('')
  let amount = $state('')
  let reservationType: TariffReservationType = $state('seasonal')
  let error: string | null = $state(null)

  $effect(() => {
    if (rule.id === loadedRuleId) {
      return
    }

    loadedRuleId = rule.id
    name = rule.name
    amount = formatEuroFromCents(rule.amountCents).replace('€', '').trim()
    reservationType = rule.reservationType
    error = null
  })

  const submit = () => {
    const cents = parseEuroToCents(amount)
    if (!name.trim() || !Number.isFinite(cents) || cents < 0) {
      error = 'Importo o nome non valido'
      return
    }
    error = null
    onSave({
      name,
      itemType: rule.itemType,
      rowLabel: rule.rowLabel,
      reservationType,
      amountCents: cents,
      seasonYear: rule.seasonYear,
      validFrom: rule.validFrom,
      validTo: rule.validTo,
      priority: rule.priority,
      notes: rule.notes,
    })
  }
</script>

<form
  class="tariff-form"
  onsubmit={(event) => {
    event.preventDefault()
    submit()
  }}
>
  <p>{beachTypeLabels[rule.itemType]} · {rule.rowLabel ?? 'tutte le file'}</p>
  <label>
    Nome tariffa
    <input bind:value={name} />
  </label>
  <fieldset class="account-type-field">
    <legend>Tipo</legend>
    <div class="assignment-type">
      <button
        type="button"
        class:active={reservationType === 'seasonal'}
        onclick={() => (reservationType = 'seasonal')}
      >
        {reservationTypeLabels.seasonal}
      </button>
      <button
        type="button"
        class:active={reservationType === 'daily'}
        onclick={() => (reservationType = 'daily')}
      >
        {reservationTypeLabels.daily}
      </button>
    </div>
  </fieldset>
  <label>
    Importo
    <input bind:value={amount} inputmode="decimal" />
  </label>
  {#if error}
    <p class="form-error">{error}</p>
  {/if}
  <div class="customer-form-actions">
    <button type="submit" disabled={saving}>Salva tariffa</button>
    <button type="button" disabled={saving} onclick={onCancel}>Annulla</button>
  </div>
</form>
