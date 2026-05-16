<script lang="ts">
  import { normalizeCustomerInput, validateCustomerInput } from '../../lib/customers/customerValidation'
  import type { Customer, CustomerInput } from '../../lib/types/customer'

  let {
    customer = null,
    saving,
    onSave,
    onCancel,
  }: {
    customer?: Customer | null
    saving: boolean
    onSave: (input: CustomerInput) => void | Promise<void>
    onCancel: () => void
  } = $props()

  let loadedCustomerId = $state<string | null>(null)
  let fullName = $state('')
  let phone = $state('')
  let email = $state('')
  let notes = $state('')
  let error = $state<string | null>(null)

  $effect(() => {
    const nextCustomerId = customer?.id ?? null

    if (nextCustomerId === loadedCustomerId) {
      return
    }

    loadedCustomerId = nextCustomerId
    fullName = customer?.fullName ?? ''
    phone = customer?.phone ?? ''
    email = customer?.email ?? ''
    notes = customer?.notes ?? ''
    error = null
  })

  const submit = () => {
    const input = normalizeCustomerInput({
      fullName,
      phone,
      email,
      notes,
    })
    const validationError = validateCustomerInput(input)
    if (validationError) {
      error = validationError
      return
    }

    error = null
    onSave(input)
  }
</script>

<form
  class="customer-form"
  onsubmit={(event) => {
    event.preventDefault()
    submit()
  }}
>
  <label>
    Nome e cognome
    <input bind:value={fullName} autocomplete="name" />
  </label>

  <label>
    Telefono
    <input bind:value={phone} autocomplete="tel" inputmode="tel" />
  </label>

  <label>
    Email
    <input bind:value={email} autocomplete="email" inputmode="email" />
  </label>

  {#if error}
    <p class="form-error">{error}</p>
  {/if}

  <div class="customer-form-actions">
    <button type="submit" disabled={saving}>{saving ? 'Salvataggio' : 'Salva'}</button>
    <button type="button" disabled={saving} onclick={onCancel}>Annulla</button>
  </div>
</form>
