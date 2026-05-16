<script lang="ts">
  import { DATABASE_NAME, SCHEMA_VERSION } from '../../lib/db/schema'
  import { resetBrowserDatabaseForDevelopmentOnly } from '../../lib/db/beachRepository'
  import type { BeachLayout } from '../../lib/types/beach'
  import type { DatabaseRuntime } from '../../lib/types/db'

  let {
    layout,
    itemCount,
    runtime,
  }: {
    layout: BeachLayout | null
    itemCount: number
    runtime: DatabaseRuntime | null
  } = $props()

  const adapterLabel = $derived(
    runtime === 'native-sqlite'
      ? 'Native SQLite'
      : runtime === 'web-persistent-sqlite'
        ? 'Web SQLite persistente'
        : 'Memoria temporanea',
  )
  const webStoreLabel = $derived(
    runtime === 'web-persistent-sqlite' ? 'Sì' : runtime === 'browser-memory-fallback' ? 'No' : 'N/D',
  )

  let resetError: string | null = $state(null)
  let resetInProgress = $state(false)

  const handleDevelopmentReset = async () => {
    resetError = null

    if (!import.meta.env.DEV || runtime === 'native-sqlite') {
      resetError = 'Reset disponibile solo in browser/dev.'
      return
    }

    const confirmed = window.confirm(
      'Reset database browser di sviluppo: cancella clienti, assegnazioni, conti, pagamenti, tariffe ed extra locali. Continuare?',
    )
    if (!confirmed) {
      return
    }

    resetInProgress = true
    try {
      await resetBrowserDatabaseForDevelopmentOnly()
      window.location.reload()
    } catch (error) {
      resetError = error instanceof Error ? error.message : 'Reset non riuscito.'
    } finally {
      resetInProgress = false
    }
  }
</script>

<section class="diagnostics-panel" aria-label="Diagnostica">
  <dl>
    <div>
      <dt>Database</dt>
      <dd>{DATABASE_NAME}</dd>
    </div>
    <div>
      <dt>Schema</dt>
      <dd>v{SCHEMA_VERSION}</dd>
    </div>
    <div>
      <dt>Adapter</dt>
      <dd>{adapterLabel}</dd>
    </div>
    <div>
      <dt>Web store initialized</dt>
      <dd>{webStoreLabel}</dd>
    </div>
    <div>
      <dt>Elementi caricati</dt>
      <dd>{itemCount}</dd>
    </div>
    <div>
      <dt>Dimensioni</dt>
      <dd>{layout ? `${layout.widthM}m x ${layout.depthM}m` : 'Non caricate'}</dd>
    </div>
  </dl>

  {#if runtime === 'browser-memory-fallback'}
    <p class="diagnostic-warning">
      Memoria temporanea: i dati verranno persi al reload.
    </p>
  {/if}

  {#if import.meta.env.DEV && runtime !== 'native-sqlite'}
    <button class="button-danger" type="button" onclick={handleDevelopmentReset} disabled={resetInProgress}>
      {resetInProgress ? 'Reset in corso...' : 'Reset database browser dev'}
    </button>
    {#if resetError}
      <p class="diagnostic-warning">{resetError}</p>
    {/if}
  {/if}
</section>
