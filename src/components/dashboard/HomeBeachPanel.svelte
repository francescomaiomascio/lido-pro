<script lang="ts">
  import type { HomeOperationalModel } from './homeOperationalModel'

  let {
    beach,
  }: {
    beach: HomeOperationalModel['beachStatus']
  } = $props()

  const beachMarkers = $derived.by(() => {
    const total = Math.min(beach.totalPlaces, 72)
    if (total <= 0) return []

    const fromCount = (count: number) =>
      beach.totalPlaces > total ? Math.round((count / beach.totalPlaces) * total) : count

    const maintenance = Math.min(total, fromCount(beach.maintenancePlaces))
    const occupied = Math.min(total - maintenance, fromCount(beach.occupiedPlaces))
    const reserved = Math.min(total - maintenance - occupied, fromCount(beach.reservedPlaces))
    const free = Math.max(0, total - maintenance - occupied - reserved)

    return [
      ...Array.from({ length: occupied }, () => 'occupied'),
      ...Array.from({ length: reserved }, () => 'reserved'),
      ...Array.from({ length: maintenance }, () => 'maintenance'),
      ...Array.from({ length: free }, () => 'free'),
    ]
  })
</script>

<section class="home-panel home-panel--beach" aria-label="Spiaggia oggi">
  <header>
    <div>
      <span>Spiaggia live</span>
      <h2>Stato spiaggia</h2>
    </div>
  </header>

  <div class="home-beach-snapshot">
    <div class="home-beach-snapshot__visual" aria-hidden="true">
      {#each beachMarkers as marker}
        <span class={`status-${marker}`}></span>
      {/each}
    </div>
    <div class="home-beach-snapshot__state">
      <strong>{beach.totalPlaces} posti</strong>
      <span>{beach.occupancyRate}% occupazione</span>
      <small>{beach.composition}</small>
    </div>
  </div>

  <div class="home-occupancy" aria-label={`Occupazione ${beach.occupancyRate}%`}>
    <span style={`width: ${beach.occupancyRate}%`}></span>
  </div>

  <dl class="home-metrics home-metrics--beach">
    <div><dt>Posti</dt><dd>{beach.totalPlaces}</dd></div>
    <div><dt>Liberi</dt><dd>{beach.freePlaces}</dd></div>
    <div><dt>Occupati</dt><dd>{beach.occupiedPlaces}</dd></div>
    <div><dt>Riservati</dt><dd>{beach.reservedPlaces}</dd></div>
    <div><dt>Manut.</dt><dd>{beach.maintenancePlaces}</dd></div>
    <div><dt>Prenot.</dt><dd>{beach.activeReservations}</dd></div>
    <div><dt>Conti</dt><dd>{beach.openAccounts}</dd></div>
  </dl>
</section>
