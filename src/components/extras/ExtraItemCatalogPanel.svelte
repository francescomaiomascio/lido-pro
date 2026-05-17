<script lang="ts">
  import { formatEuroFromCents, parseEuroToCents } from '../../lib/format/money'
  import { loadExtraItemCatalog, saveExtraItemCatalogEntry } from '../../lib/services/extraItemService'
  import type { ExtraItemCatalogEntry, ExtraItemCatalogInput } from '../../lib/types/extraItem'
  import ActionActivity from '../loading/ActionActivity.svelte'

  let {
    catalog,
    onCatalogChange,
  }: {
    catalog: ExtraItemCatalogEntry[]
    onCatalogChange?: (catalog: ExtraItemCatalogEntry[]) => void
  } = $props()

  let editableCatalog = $state<ExtraItemCatalogEntry[]>([])
  let savingId: string | null = $state(null)
  let createOpen = $state(false)
  let newName = $state('')
  let newUnitLabel = $state('pz')
  let newAmount = $state('')
  let newNotes = $state('')
  let message: string | null = $state(null)
  let error: string | null = $state(null)

  $effect(() => {
    editableCatalog = catalog
  })

  const refreshCatalog = async () => {
    editableCatalog = await loadExtraItemCatalog()
    onCatalogChange?.(editableCatalog)
  }

  const saveEntry = async (entry: ExtraItemCatalogEntry, amount: string) => {
    savingId = entry.id
    message = null
    error = null
    try {
      const cents = parseEuroToCents(amount)
      await saveExtraItemCatalogEntry(
        {
          name: entry.name,
          unitLabel: entry.unitLabel,
          defaultAmountCents: Number.isFinite(cents) ? cents : 0,
          sortOrder: entry.sortOrder,
          notes: entry.notes,
        },
        entry.id,
      )
      await refreshCatalog()
      message = 'Extra aggiornato'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore salvataggio extra.'
    } finally {
      savingId = null
    }
  }

  const createEntry = async () => {
    if (!newName.trim()) {
      error = 'Nome extra obbligatorio'
      return
    }

    savingId = 'new'
    message = null
    error = null
    try {
      const cents = parseEuroToCents(newAmount)
      const input: ExtraItemCatalogInput = {
        name: newName,
        unitLabel: newUnitLabel,
        defaultAmountCents: Number.isFinite(cents) ? cents : 0,
        sortOrder: editableCatalog.length * 10 + 40,
        notes: newNotes,
      }
      await saveExtraItemCatalogEntry(input)
      await refreshCatalog()
      newName = ''
      newUnitLabel = 'pz'
      newAmount = ''
      newNotes = ''
      createOpen = false
      message = 'Extra creato'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore creazione extra.'
    } finally {
      savingId = null
    }
  }
</script>

<section class="settings-panel extra-catalog-panel" aria-label="Extra">
  <div class="settings-view-header settings-panel__header">
    <div>
      <h2>Extra</h2>
      <p>Catalogo globale per articoli extra. Gli extra assegnati a un conto restano nel pannello operativo.</p>
    </div>
    <button type="button" class="button-primary" onclick={() => (createOpen = !createOpen)}>
      Nuovo extra
    </button>
  </div>

  {#if createOpen}
    <form
      class="extra-create-form"
      onsubmit={(event) => {
        event.preventDefault()
        createEntry()
      }}
    >
      <label>
        Nome extra
        <input bind:value={newName} />
      </label>
      <label>
        Unità
        <input bind:value={newUnitLabel} />
      </label>
      <label>
        Prezzo predefinito
        <input bind:value={newAmount} inputmode="decimal" />
      </label>
      <label>
        Note
        <input bind:value={newNotes} />
      </label>
      <div class="settings-form-actions">
        <button type="submit" class="button-primary" disabled={savingId === 'new'}>Crea extra</button>
        <button type="button" class="button-secondary" disabled={savingId === 'new'} onclick={() => (createOpen = false)}>
          Annulla
        </button>
      </div>
    </form>
  {/if}

  <div class="extra-catalog-table">
    <div class="extra-catalog-table__head" aria-hidden="true">
      <span>Nome</span>
      <span>Prezzo default</span>
      <span>Stato</span>
      <span></span>
    </div>
    {#each editableCatalog as entry}
      {@const initialAmount = formatEuroFromCents(entry.defaultAmountCents).replace('EUR', '').replace('€', '').trim()}
      <form
        class="extra-catalog-row"
        onsubmit={(event) => {
          event.preventDefault()
          const form = event.currentTarget
          const amount = new FormData(form).get('amount')?.toString() ?? initialAmount
          saveEntry(entry, amount)
        }}
      >
        <div>
          <strong>{entry.name}</strong>
          <small>/{entry.unitLabel}</small>
        </div>
        <label>
          Prezzo
          <input name="amount" inputmode="decimal" value={initialAmount} />
        </label>
        <span>{entry.active ? 'Attivo' : 'Non attivo'}</span>
        <button type="submit" disabled={savingId === entry.id}>
          {#if savingId === entry.id}
            <ActionActivity label="Salvataggio" />
          {:else}
            Salva
          {/if}
        </button>
      </form>
    {:else}
      <p class="empty-customer">Nessun extra configurato.</p>
    {/each}
  </div>

  {#if message}
    <p class="inline-confirmation">{message}</p>
  {/if}
  {#if error}
    <p class="form-error">{error}</p>
  {/if}
</section>
