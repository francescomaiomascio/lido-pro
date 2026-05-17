<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../../lib/map-canvas/parametric/parametricSetupState'
  import type { MapStudioProjectEntryMode } from '../state/mapStudioProjectModel'
  import {
    buildMapStudioDashboardModel,
    type MapStudioDashboardProject,
    type MapStudioDashboardSummaryItem,
    type MapStudioDashboardView,
  } from '../state/mapStudioDashboardModel'
  import MapStudioDashboardActions from './MapStudioDashboardActions.svelte'
  import MapStudioDashboardBands from './MapStudioDashboardBands.svelte'
  import MapStudioDashboardNav from './MapStudioDashboardNav.svelte'
  import MapStudioDashboardSummary from './MapStudioDashboardSummary.svelte'
  import MapStudioProjectDetailPanel from './MapStudioProjectDetailPanel.svelte'
  import MapStudioProjectList from './MapStudioProjectList.svelte'

  let {
    setup,
    output = null,
    draftAvailable,
    onStart,
    onShowDraft,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
    draftAvailable: boolean
    onStart: (mode: MapStudioProjectEntryMode) => void
    onShowDraft: () => void
  } = $props()

  let activeView = $state<MapStudioDashboardView>('projects')
  let selectedProjectId = $state('draft-current')

  const dashboard = $derived(buildMapStudioDashboardModel(setup, { output, draftAvailable }))
  const selectedProject = $derived(
    dashboard.projects.find((project) => project.id === selectedProjectId) ?? dashboard.projects[0],
  )

  const openProject = (project: MapStudioDashboardProject) => {
    if (project.kind === 'base') {
      onStart('template')
      return
    }
    if (project.kind === 'active') return
    onStart('existing')
  }

  const handleSummaryAction = (summary: MapStudioDashboardSummaryItem) => {
    if (summary.disabledReason) return
    if (summary.id === 'draft') {
      onStart('existing')
      return
    }
    if (summary.id === 'diff') {
      activeView = 'drafts'
      return
    }
    if (summary.id === 'history') {
      activeView = 'versions'
      return
    }
    if (summary.id === 'state') {
      activeView = 'publish'
    }
  }

  const compare = () => {
    if (!draftAvailable) return
    activeView = 'drafts'
  }
</script>

<section class="map-studio-dashboard" aria-label="Dashboard Studio Mappa">
  <MapStudioDashboardNav {activeView} onViewChange={(view) => (activeView = view)} />

  <div class="map-studio-dashboard__body">
    <MapStudioDashboardSummary summaries={dashboard.summaries} onSummaryAction={handleSummaryAction} />

    <MapStudioDashboardActions
      canCompare={draftAvailable}
      canPublish={false}
      {onStart}
      onCompare={compare}
    />

    <div class="map-studio-dashboard__workbench">
      <MapStudioProjectList
        projects={dashboard.projects}
        {selectedProjectId}
        onSelect={(projectId) => (selectedProjectId = projectId)}
        onOpenDraft={openProject}
      />

      <MapStudioProjectDetailPanel
        project={selectedProject}
        onOpenDraft={openProject}
        onClose={() => (selectedProjectId = dashboard.projects[0]?.id ?? selectedProjectId)}
      />
    </div>

    <MapStudioDashboardBands versions={dashboard.versions} backups={dashboard.backups} />
  </div>
</section>
