<script lang="ts">
  import { getBeachItemStatusLabel } from '../../lib/format/beachLabels'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import type { BeachItemStatusEvent } from '../../lib/types/beach'

  let { events }: { events: BeachItemStatusEvent[] } = $props()
</script>

<section class="item-history" aria-label="Ultimi cambiamenti">
  <h3>Ultimi cambiamenti</h3>
  {#if events.length > 0}
    <ul>
      {#each events as event (event.id)}
        <li>
          <strong>{getBeachItemStatusLabel(event.nextStatus)}</strong>
          <span>{formatCompactDateTime(event.createdAt)}</span>
        </li>
      {/each}
    </ul>
  {:else}
    <p>Nessun cambiamento registrato.</p>
  {/if}
</section>
