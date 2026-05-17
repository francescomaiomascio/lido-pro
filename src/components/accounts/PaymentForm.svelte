<script lang="ts">
  import { Dialog } from '@capacitor/dialog'
  import { paymentMethodLabels, paymentMethodOptions } from '../../lib/format/accountLabels'
  import { parseEuroToCents } from '../../lib/format/money'
  import type { PaymentMethod } from '../../lib/types/account'
  import ActionActivity from '../loading/ActionActivity.svelte'

  let {
    balanceAmountCents,
    saving,
    onSave,
    onCancel = null,
  }: {
    balanceAmountCents: number
    saving: boolean
    onSave: (amountCents: number, paymentMethod: PaymentMethod, note: string) => void | Promise<void>
    onCancel?: (() => void) | null
  } = $props()

  let amount = $state('')
  let paymentMethod: PaymentMethod = $state('cash')
  let note = $state('')
  let error: string | null = $state(null)

  const submit = async () => {
    const cents = parseEuroToCents(amount)

    if (!Number.isFinite(cents) || cents <= 0) {
      error = 'Importo non valido'
      return
    }

    if (balanceAmountCents > 0 && cents > balanceAmountCents) {
      const result = await Dialog.confirm({
        title: 'Conferma pagamento',
        message: 'Il pagamento supera il saldo. Continuare?',
        okButtonTitle: 'Continua',
        cancelButtonTitle: 'Annulla',
      })

      if (!result.value) {
        return
      }
    }

    error = null
    await onSave(cents, paymentMethod, note)
  }
</script>

<form
  class="payment-form"
  onsubmit={(event) => {
    event.preventDefault()
    submit()
  }}
>
  <label>
    Importo €
    <input bind:value={amount} inputmode="decimal" placeholder="40,00" />
  </label>

  <div class="assignment-type">
    {#each paymentMethodOptions as method}
      <button
        type="button"
        class:active={paymentMethod === method}
        onclick={() => (paymentMethod = method)}
      >
        {paymentMethodLabels[method]}
      </button>
    {/each}
  </div>

  <label>
    Nota
    <textarea bind:value={note} placeholder="Facoltativa"></textarea>
  </label>

  {#if error}
    <p class="form-error">{error}</p>
  {/if}

  <div class="customer-form-actions">
    <button type="submit" disabled={saving}>
      {#if saving}
        <ActionActivity label="Registrazione" />
      {:else}
        Registra pagamento
      {/if}
    </button>
    {#if onCancel}
      <button type="button" disabled={saving} onclick={onCancel}>Annulla</button>
    {/if}
  </div>
</form>
