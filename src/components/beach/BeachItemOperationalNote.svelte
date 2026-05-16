<script lang="ts">
  let {
    value,
    saving,
    compact = false,
    onSave,
  }: {
    value: string
    saving: boolean
    compact?: boolean
    onSave: (note: string) => void
  } = $props()

  let draft = $state('')
  let editing = $state(false)

  $effect(() => {
    draft = value
    if (!compact) {
      editing = true
    }
  })
</script>

<section class="operational-note" aria-label="Nota operativa">
  <label for="operational-note">Nota</label>

  {#if compact && !editing}
    <div class="operational-note__preview">
      <p>{value?.trim() ? value : 'Nessuna nota operativa'}</p>
      <button type="button" class="button-ghost" onclick={() => (editing = true)}>
        {value?.trim() ? 'Modifica nota' : 'Aggiungi nota'}
      </button>
    </div>
  {:else}
    <textarea
      id="operational-note"
      rows="3"
      placeholder="Es. Riservato verbalmente"
      bind:value={draft}
    ></textarea>
    <div class="operational-note__actions">
      <button type="button" disabled={saving || draft.trim() === value.trim()} onclick={() => onSave(draft)}>
        Salva nota
      </button>
      {#if compact}
        <button type="button" class="button-ghost" disabled={saving} onclick={() => {
          draft = value
          editing = false
        }}>
          Annulla
        </button>
      {/if}
    </div>
  {/if}
</section>
