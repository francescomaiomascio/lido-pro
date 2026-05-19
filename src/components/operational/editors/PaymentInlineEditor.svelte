<script lang="ts">
  import { paymentMethodLabels, paymentMethodOptions } from '../../../lib/format/accountLabels'
  import { formatEuroFromCents, parseEuroToCents } from '../../../lib/format/money'
  import type { Account, PaymentMethod } from '../../../lib/types/account'
  import ActionActivity from '../../loading/ActionActivity.svelte'

  let { account, saving, onSave, onClose }: {
    account: Account
    saving: boolean
    onSave: (amountCents: number, method: PaymentMethod, note: string) => void | Promise<void>
    onClose: () => void
  } = $props()
  let amount = $state('')
  let paymentMethod: PaymentMethod = $state('cash')
  let note = $state('')
  let error: string | null = $state(null)
  const suggestedAmount = $derived(
    account.balanceAmountCents > 0 ? formatEuroFromCents(account.balanceAmountCents).replace('€', '').trim() : '',
  )
  const submit = async () => {
    const cents = parseEuroToCents(amount)
    if (!Number.isFinite(cents) || cents <= 0) {
      error = 'Importo non valido'
      return
    }
    if (account.balanceAmountCents > 0 && cents > account.balanceAmountCents) {
      error = 'L’importo inserito supera il residuo del conto.'
      return
    }
    await onSave(cents, paymentMethod, note)
  }
</script>

<section class="inline-editor" aria-label="Pagamento">
  <header class="inline-editor__header">
    <div><strong>Registra pagamento</strong><span>Registra un movimento sul conto aperto.</span></div>
    <button type="button" onclick={onClose}>Annulla</button>
  </header>
  <div class="inline-editor__field-grid">
    <label>Importo<input bind:value={amount} inputmode="decimal" placeholder={suggestedAmount || '40,00'} /></label>
    <label>Nota<input bind:value={note} placeholder="Facoltativa" /></label>
  </div>
  <p class="inline-editor__hint">Residuo disponibile: {formatEuroFromCents(account.balanceAmountCents)}.</p>
  <div class="inline-editor__segment">
    {#each paymentMethodOptions as method}
      <button type="button" class:active={paymentMethod === method} onclick={() => (paymentMethod = method)}>{paymentMethodLabels[method]}</button>
    {/each}
  </div>
  {#if error}<p class="inline-editor__error">{error}</p>{/if}
  <div class="inline-editor__actions">
    <button type="button" disabled={saving} onclick={submit}>
      {#if saving}
        <ActionActivity label="Registrazione" />
      {:else}
        Registra pagamento
      {/if}
    </button>
  </div>
</section>
