<script lang="ts">
  import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
  import type { HomePriorityQueueItem } from './homeOperationalModel'

  let {
    items,
    onOpenModule,
  }: {
    items: HomePriorityQueueItem[]
    onOpenModule: (module: LidoProModuleId) => void
  } = $props()

  const domainLabels: Record<HomePriorityQueueItem['domain'], string> = {
    account: 'Conti',
    bar: 'Bar',
    beach: 'Spiaggia',
    catalog: 'Articoli',
    employees: 'Dipendenti',
    reservation: 'Prenotazioni',
    studio: 'Studio',
    system: 'Sistema',
  }
</script>

<section class="home-panel home-panel--queue" aria-label="Da seguire">
  <header>
    <div>
      <span>Lavoro attivo</span>
      <h2>Da fare ora</h2>
    </div>
  </header>

  <div class="home-work-queue">
    {#if items.length > 0}
      {#each items as item}
        <button
          type="button"
          class={`severity-${item.severity}`}
          disabled={!item.targetModule}
          onclick={() => item.targetModule && onOpenModule(item.targetModule)}
        >
          <span>{domainLabels[item.domain]}</span>
          <strong>{item.title}</strong>
          <small>{item.description}</small>
          <em>{item.targetAction}</em>
        </button>
      {/each}
    {:else}
      <p>Nessuna criticità operativa.</p>
    {/if}
  </div>
</section>
