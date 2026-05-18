<script lang="ts">
  import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
  import type { BeachItem, BeachLayout, BeachStatusSummary } from '../../lib/types/beach'
  import type { DatabaseRuntime } from '../../lib/types/db'
  import type { ExtraItemCatalogEntry } from '../../lib/types/extraItem'
  import HomeAccountsPanel from './HomeAccountsPanel.svelte'
  import HomeActivityFeed from './HomeActivityFeed.svelte'
  import HomeBeachPanel from './HomeBeachPanel.svelte'
  import HomeCockpitHeader from './HomeCockpitHeader.svelte'
  import HomeCommandBar from './HomeCommandBar.svelte'
  import HomeDomainStatusRail from './HomeDomainStatusRail.svelte'
  import HomeReservationsPanel from './HomeReservationsPanel.svelte'
  import HomeWorkQueue from './HomeWorkQueue.svelte'
  import { buildHomeOperationalModel, type HomeAction } from './homeOperationalModel'

  let {
    layout,
    items,
    summary,
    typeSummary,
    workspaceSummary,
    runtime,
    extraCatalog,
    onOpenModule,
  }: {
    layout: BeachLayout | null
    items: BeachItem[]
    summary: BeachStatusSummary
    typeSummary: { palms: number; umbrellas: number; smallPalms: number }
    workspaceSummary: {
      total: number
      assignedCustomers: number
      openAccounts: number
      activeReservations: number
    }
    runtime: DatabaseRuntime | null
    extraCatalog: ExtraItemCatalogEntry[]
    onOpenModule: (module: LidoProModuleId) => void
  } = $props()

  const home = $derived(
    buildHomeOperationalModel({
      layout,
      items,
      summary,
      typeSummary,
      workspaceSummary,
      runtime,
      extraCatalog,
    }),
  )

  const runAction = (action: HomeAction) => {
    if (action.module) {
      onOpenModule(action.module)
    }
  }
</script>

<section class="lidopro-dashboard lidopro-home" aria-label="Home operativa LidoPro">
  <HomeCockpitHeader model={home} />
  <HomeCommandBar actions={home.commandActions} onAction={runAction} />

  <div class="home-cockpit-grid">
    <HomeBeachPanel beach={home.beachStatus} />
    <HomeWorkQueue items={home.priorityQueue} {onOpenModule} />
    <HomeDomainStatusRail model={home} {onOpenModule} />
    <HomeAccountsPanel financial={home.financialStatus} rows={home.accountRows} {onOpenModule} />
    <HomeReservationsPanel reservations={home.reservationsStatus} rows={home.reservationRows} {onOpenModule} />
    <HomeActivityFeed rows={home.recentActivity} {onOpenModule} />
  </div>
</section>
