<script lang="ts">
  import type { RegistryRecord } from '../../lib/types/registry'
  import RegistryRow from './RegistryRow.svelte'

  let {
    records,
    selectedRecord,
    title = 'Registro',
    onSelect,
    onReset,
  }: {
    records: RegistryRecord[]
    selectedRecord: RegistryRecord | null
    title?: string
    onSelect: (record: RegistryRecord) => void
    onReset?: () => void
  } = $props()
</script>

<section class="registry-table" aria-label="Movimenti registro">
  <div class="registry-table__caption">
    <strong>{title}</strong>
    <span>{records.length} righe</span>
  </div>

  <div class="registry-table__head" aria-hidden="true">
    <span>Cliente</span>
    <span>Posto / extra</span>
    <span>Periodo</span>
    <span>Totale</span>
    <span>Pagato</span>
    <span>Saldo</span>
    <span>Stato</span>
  </div>

  <div class="registry-table__body">
    {#each records as record (record.id)}
      <RegistryRow
        {record}
        selected={selectedRecord?.id === record.id}
        {onSelect}
      />
    {:else}
      <div class="registry-empty">
        <h3>Nessun movimento trovato.</h3>
        <p>Modifica i filtri o crea una prenotazione/conto per visualizzare il registro.</p>
        {#if onReset}
          <button type="button" class="button-ghost" onclick={onReset}>Reset filtri</button>
        {/if}
      </div>
    {/each}
  </div>
</section>
