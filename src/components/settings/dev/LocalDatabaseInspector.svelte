<script lang="ts">
  import { onMount } from 'svelte'
  import {
    getDatabaseDiagnostics,
    readTableRows,
  } from '../../../lib/db/databaseDiagnostics'
  import type {
    DatabaseDiagnostics,
    DatabaseTableRows,
    DatabaseTableSummary,
  } from '../../../lib/types/db'
  import ActionActivity from '../../loading/ActionActivity.svelte'

  type CopyState = 'idle' | 'copied' | 'failed'

  const categoryLabels: Record<string, string> = {
    layout: 'Layout',
    booking: 'Booking',
    clienti: 'Clienti',
    conti: 'Conti',
    pagamenti: 'Pagamenti',
    articoli: 'Articoli',
    registro: 'Registro',
    staff: 'Staff',
    'sync-dev': 'Sync/dev',
    system: 'Sistema',
  }

  let diagnostics: DatabaseDiagnostics | null = $state(null)
  let selectedTableName: string | null = $state(null)
  let selectedTable: DatabaseTableRows | null = $state(null)
  let selectedRow: Record<string, unknown> | null = $state(null)
  let loading = $state(false)
  let rowsLoading = $state(false)
  let error: string | null = $state(null)
  let tableSearch = $state('')
  let rowSearch = $state('')
  let rowLimit = $state(100)
  let autoRefresh = $state(false)
  let copyState: CopyState = $state('idle')

  const filteredTables = $derived.by(() => {
    const query = tableSearch.trim().toLowerCase()
    const tables = diagnostics?.tables ?? []
    if (!query) return tables
    return tables.filter((table) =>
      `${table.name} ${categoryLabels[table.category] ?? table.category}`.toLowerCase().includes(query),
    )
  })

  const filteredRows = $derived.by(() => {
    const rows = selectedTable?.rows ?? []
    const query = rowSearch.trim().toLowerCase()
    if (!query) return rows
    return rows.filter((row) => JSON.stringify(row).toLowerCase().includes(query))
  })

  const visibleColumns = $derived.by(() => {
    const columns = new Set<string>()
    for (const row of filteredRows.slice(0, 20)) {
      for (const key of Object.keys(row)) {
        columns.add(key)
      }
    }
    return [...columns].slice(0, 12)
  })

  const selectedSummary = $derived.by((): DatabaseTableSummary | null => {
    if (!selectedTableName || !diagnostics) return null
    return diagnostics.tables.find((table) => table.name === selectedTableName) ?? null
  })

  const formatDateTime = (value: string | null | undefined) =>
    value ? new Date(value).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : 'N/D'

  const formatCell = (value: unknown) => {
    if (value == null) return 'null'
    if (typeof value === 'string') return value.length > 80 ? `${value.slice(0, 80)}...` : value
    if (typeof value === 'number' || typeof value === 'boolean') return String(value)
    const serialized = JSON.stringify(value)
    return serialized.length > 80 ? `${serialized.slice(0, 80)}...` : serialized
  }

  const refreshDiagnostics = async () => {
    loading = true
    error = null
    try {
      diagnostics = await getDatabaseDiagnostics()
      if (!selectedTableName) {
        selectedTableName = diagnostics.tables[0]?.name ?? null
      }
      if (selectedTableName) {
        await loadTable(selectedTableName)
      }
    } catch (currentError) {
      error = currentError instanceof Error ? currentError.message : 'Diagnostica database non disponibile.'
    } finally {
      loading = false
    }
  }

  const loadTable = async (tableName: string) => {
    rowsLoading = true
    error = null
    selectedTableName = tableName
    selectedRow = null
    try {
      selectedTable = await readTableRows(tableName, { limit: rowLimit, offset: 0 })
    } catch (currentError) {
      error = currentError instanceof Error ? currentError.message : 'Tabella non disponibile.'
    } finally {
      rowsLoading = false
    }
  }

  const refreshSelectedTable = async () => {
    if (!selectedTableName) return
    await loadTable(selectedTableName)
    diagnostics = await getDatabaseDiagnostics()
  }

  const copyText = async (value: string) => {
    copyState = 'idle'
    try {
      await navigator.clipboard.writeText(value)
      copyState = 'copied'
    } catch {
      copyState = 'failed'
    }
  }

  const copySelectedRow = () => {
    if (!selectedRow) return
    void copyText(JSON.stringify(selectedRow, null, 2))
  }

  const copyTableDiagnostics = () => {
    if (!selectedTable) return
    void copyText(JSON.stringify(selectedTable, null, 2))
  }

  $effect(() => {
    if (!autoRefresh) return
    const interval = window.setInterval(() => {
      void refreshDiagnostics()
    }, 5000)
    return () => window.clearInterval(interval)
  })

  onMount(() => {
    void refreshDiagnostics()
  })
</script>

<section class="local-db-inspector" aria-label="Database locale">
  <header class="local-db-inspector__header">
    <div class="local-db-inspector__title">
      <div>
        <span>Strumento temporaneo di sviluppo</span>
        <h4>Database locale</h4>
        <p>Sola lettura · Dati locali del dispositivo</p>
      </div>

      {#if diagnostics}
        <dl class="local-db-inspector__summary" aria-label="Riepilogo database locale">
          <div>
            <dt>Adapter</dt>
            <dd>{diagnostics.runtime}</dd>
          </div>
          <div>
            <dt>Schema</dt>
            <dd>v{diagnostics.schemaVersion}</dd>
          </div>
          <div>
            <dt>Tabelle</dt>
            <dd>{diagnostics.tables.length}</dd>
          </div>
          <div>
            <dt>Righe</dt>
            <dd>{diagnostics.totalVisibleRows}</dd>
          </div>
          <div>
            <dt>Refresh</dt>
            <dd>{formatDateTime(diagnostics.refreshedAt)}</dd>
          </div>
        </dl>
      {/if}
    </div>

    <div class="local-db-inspector__actions">
      <label>
        <input type="checkbox" bind:checked={autoRefresh} />
        Auto-refresh
      </label>
      <button type="button" onclick={refreshDiagnostics} disabled={loading}>
        {#if loading}
          <ActionActivity label="Aggiorno" />
        {:else}
          Aggiorna
        {/if}
      </button>
    </div>
  </header>

  <div class="local-db-inspector__banner">
    <strong>Sola lettura.</strong>
    <span>Nessun SQL libero, modifica, cancellazione, seed o migrazione da questo pannello.</span>
  </div>

  {#if error}
    <p class="local-db-inspector__error">{error}</p>
  {/if}

  <div class="local-db-inspector__grid">
    <aside class="local-db-inspector__tables" aria-label="Tabelle database">
      <label>
        <span>Cerca tabella</span>
        <input type="search" bind:value={tableSearch} placeholder="booking, clienti, conti..." />
      </label>

      <div class="local-db-inspector__table-list">
        {#each filteredTables as table}
          <button
            type="button"
            class:active={table.name === selectedTableName}
            onclick={() => loadTable(table.name)}
          >
            <span>
              <strong>{table.name}</strong>
              <small>{categoryLabels[table.category] ?? table.category}</small>
            </span>
            <em>{table.rowCount}</em>
          </button>
        {/each}
      </div>
    </aside>

    <section class="local-db-inspector__viewer" aria-label="Righe tabella">
      <header>
        <div>
          <span>{selectedSummary ? categoryLabels[selectedSummary.category] : 'Tabella'}</span>
          <h5>{selectedTableName ?? 'Nessuna tabella'}</h5>
          <p>
            {selectedTable?.rowCount ?? 0} righe · {formatDateTime(selectedTable?.refreshedAt)}
          </p>
        </div>
        <div class="local-db-inspector__viewer-actions">
          <select bind:value={rowLimit} aria-label="Limite righe" onchange={refreshSelectedTable}>
            <option value={100}>100</option>
            <option value={250}>250</option>
            <option value={500}>500</option>
          </select>
          <button type="button" onclick={refreshSelectedTable} disabled={!selectedTableName || rowsLoading}>
            Aggiorna tabella
          </button>
          <button type="button" onclick={copyTableDiagnostics} disabled={!selectedTable}>
            Copia diagnostica
          </button>
        </div>
      </header>

      <label class="local-db-inspector__row-search">
        <span>Cerca nelle righe caricate</span>
        <input type="search" bind:value={rowSearch} placeholder="testo o JSON..." />
      </label>

      {#if rowsLoading}
        <div class="local-db-inspector__empty">
          <ActionActivity label="Caricamento righe" />
        </div>
      {:else if filteredRows.length === 0}
        <div class="local-db-inspector__empty">
          <strong>Nessuna riga caricata</strong>
          <span>La tabella può essere vuota o filtrata dalla ricerca locale.</span>
        </div>
      {:else}
        <div class="local-db-inspector__rows" role="region" aria-label="Righe caricate">
          <table>
            <thead>
              <tr>
                {#each visibleColumns as column}
                  <th>{column}</th>
                {/each}
              </tr>
            </thead>
            <tbody>
              {#each filteredRows as row}
                <tr
                  class:selected={row === selectedRow}
                  onclick={() => {
                    selectedRow = row
                  }}
                >
                  {#each visibleColumns as column}
                    <td>{formatCell(row[column])}</td>
                  {/each}
                </tr>
              {/each}
            </tbody>
          </table>
        </div>
      {/if}
    </section>

    <section class="local-db-inspector__detail" aria-label="Dettaglio riga JSON">
      <header>
        <div>
          <span>Dettaglio JSON</span>
          <strong>{selectedRow ? 'Riga selezionata' : 'Seleziona una riga'}</strong>
        </div>
        <button type="button" onclick={copySelectedRow} disabled={!selectedRow}>Copia riga JSON</button>
      </header>
      <pre>{selectedRow ? JSON.stringify(selectedRow, null, 2) : 'Seleziona una riga per vedere il JSON completo.'}</pre>
      {#if copyState === 'copied'}
        <small>Copiato negli appunti.</small>
      {:else if copyState === 'failed'}
        <small>Clipboard non disponibile in questo runtime.</small>
      {/if}
    </section>
  </div>
</section>
