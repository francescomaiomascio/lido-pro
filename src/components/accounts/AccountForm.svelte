<script lang="ts">
  import { accountTypeLabels } from '../../lib/format/accountLabels'
  import { formatEuroFromCents, parseEuroToCents } from '../../lib/format/money'
  import type { Account, AccountInput, AccountType } from '../../lib/types/account'
  import type { PriceSuggestion } from '../../lib/types/tariff'
  import ActionActivity from '../loading/ActionActivity.svelte'
  import PriceSuggestionCard from '../tariffs/PriceSuggestionCard.svelte'

  let {
    account = null,
    itemId,
    customerId,
    assignmentId = null,
    defaultAccountType = 'daily',
    lockAccountType = false,
    priceSuggestion = null,
    saving,
    onSave,
    onCancel = null,
  }: {
    account?: Account | null
    itemId: string
    customerId: string
    assignmentId?: string | null
    defaultAccountType?: AccountType
    lockAccountType?: boolean
    priceSuggestion?: PriceSuggestion | null
    saving: boolean
    onSave: (input: AccountInput) => void | Promise<void>
    onCancel?: (() => void) | null
  } = $props()

  let loadedAccountId = $state<string | null>(null)
  let accountType: AccountType = $state('daily')
  let total = $state('')
  let notes = $state('')
  let error: string | null = $state(null)

  $effect(() => {
    const nextAccountId = account?.id ?? null

    if (nextAccountId === loadedAccountId) {
      return
    }

    loadedAccountId = nextAccountId
    accountType = account?.accountType ?? defaultAccountType
    total = account ? formatEuroFromCents(account.baseAmountCents).replace('€', '').trim() : ''
    if (!account && priceSuggestion && priceSuggestion.confidence !== 'none') {
      total = formatEuroFromCents(priceSuggestion.amountCents).replace('€', '').trim()
    }
    notes = account?.notes ?? ''
    error = null
  })

  const submit = () => {
    const cents = parseEuroToCents(total)

    if (!Number.isFinite(cents) || cents < 0) {
      error = 'Importo non valido'
      return
    }

    error = null
    onSave({
      itemId,
      customerId,
      assignmentId,
      accountType,
      totalAmountCents: cents,
      notes,
    })
  }
</script>

<form
  class="account-form"
  onsubmit={(event) => {
    event.preventDefault()
    submit()
  }}
>
  <PriceSuggestionCard
    suggestion={priceSuggestion}
    showAction={Boolean(account && priceSuggestion && priceSuggestion.amountCents !== account.baseAmountCents)}
    onUse={() => {
      if (priceSuggestion) {
        total = formatEuroFromCents(priceSuggestion.amountCents).replace('€', '').trim()
      }
    }}
  />

  {#if lockAccountType}
    <dl class="readonly-context">
      <div><dt>Tipo conto</dt><dd>{accountTypeLabels[accountType]}</dd></div>
    </dl>
  {:else}
    <fieldset class="account-type-field">
      <legend>Tipo conto</legend>
      <div class="assignment-type">
      <button type="button" class:active={accountType === 'daily'} onclick={() => (accountType = 'daily')}>
        {accountTypeLabels.daily}
      </button>
      <button
        type="button"
        class:active={accountType === 'seasonal'}
        onclick={() => (accountType = 'seasonal')}
      >
        {accountTypeLabels.seasonal}
      </button>
      </div>
    </fieldset>
  {/if}

  <label>
    Tariffa/base conto
    <input bind:value={total} inputmode="decimal" placeholder="100,00" />
  </label>

  <label>
    Nota conto
    <textarea bind:value={notes} placeholder="Es. saldo stagione, acconto o accordo speciale"></textarea>
  </label>

  {#if error}
    <p class="form-error">{error}</p>
  {/if}

  <div class="customer-form-actions">
    <button type="submit" disabled={saving}>
      {#if saving}
        <ActionActivity label="Salvataggio conto" />
      {:else}
        Salva conto
      {/if}
    </button>
    {#if onCancel}
      <button type="button" disabled={saving} onclick={onCancel}>Annulla</button>
    {/if}
  </div>
</form>
