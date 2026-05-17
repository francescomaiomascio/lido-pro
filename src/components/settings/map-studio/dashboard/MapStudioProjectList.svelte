<script lang="ts">
  import type { MapStudioDashboardProject } from '../state/mapStudioDashboardModel'

  let {
    projects,
    selectedProjectId,
    onSelect,
    onOpenDraft,
  }: {
    projects: MapStudioDashboardProject[]
    selectedProjectId: string
    onSelect: (projectId: string) => void
    onOpenDraft: (project: MapStudioDashboardProject) => void
  } = $props()

  let search = $state('')
  let statusFilter = $state('all')

  const filteredProjects = $derived(projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(search.trim().toLowerCase())
    const matchesStatus = statusFilter === 'all' || project.status === statusFilter
    return matchesSearch && matchesStatus
  }))

  const deltaLabel = (value?: number) => {
    if (value === undefined) return ''
    if (value > 0) return `+${value}`
    return `${value}`
  }

  const activateOnKey = (event: KeyboardEvent, projectId: string) => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    event.preventDefault()
    onSelect(projectId)
  }
</script>

<section class="map-studio-project-list" aria-label="Progetti e bozze Studio Mappa">
  <header>
    <label>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="6" />
        <path d="m20 20-3.5-3.5" />
      </svg>
      <input bind:value={search} placeholder="Cerca" />
    </label>
    <select bind:value={statusFilter} aria-label="Filtro stato progetto">
      <option value="all">Tutti gli stati</option>
      <option value="draft">Bozze</option>
      <option value="active">Attivo</option>
      <option value="base">Base</option>
      <option value="blocked">Bloccate</option>
      <option value="verified">Verificate</option>
    </select>
    <div class="map-studio-project-list__view-actions" aria-label="Vista lista">
      <button type="button" class="active" aria-label="Vista tabella">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
      </button>
      <button type="button" aria-label="Vista griglia">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z" /></svg>
      </button>
    </div>
  </header>

  <div class="map-studio-project-list__table" role="table" aria-label="Lista progetti">
    <div class="map-studio-project-list__head" role="row">
      <span role="columnheader">Nome</span>
      <span role="columnheader">Stato</span>
      <span role="columnheader">Dimensioni</span>
      <span role="columnheader">Elementi</span>
      <span role="columnheader">Warning</span>
      <span role="columnheader">Ultima modifica</span>
      <span role="columnheader">Azioni</span>
    </div>
    {#each filteredProjects as project}
      <div
        role="button"
        tabindex="0"
        class="map-studio-project-list__row"
        class:selected={selectedProjectId === project.id}
        onclick={() => onSelect(project.id)}
        onkeydown={(event) => activateOnKey(event, project.id)}
      >
        <span class="map-studio-project-list__name">
          <em class={`kind-${project.kind}`}>
            {#if project.kind === 'active'}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3 5 6v6c0 4 3 7 7 9 4-2 7-5 7-9V6z" /></svg>
            {:else}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 3h9l3 3v15H6zM15 3v4h4" /></svg>
            {/if}
          </em>
          <strong>{project.name}</strong>
          <small>{project.kind === 'active' ? 'Layout attivo protetto' : project.sourceLabel}</small>
        </span>
        <span><mark class={`status-${project.status}`}>{project.statusLabel}</mark></span>
        <span>{project.dimensionsLabel}</span>
        <span>{project.elementCount} <small class:positive={(project.elementDelta ?? 0) > 0} class:negative={(project.elementDelta ?? 0) < 0}>{deltaLabel(project.elementDelta)}</small></span>
        <span>{project.warningCount} <small class:positive={(project.warningDelta ?? 0) < 0} class:negative={(project.warningDelta ?? 0) > 0}>{deltaLabel(project.warningDelta)}</small></span>
        <span>{project.lastModifiedLabel}<small>{project.sourceLabel}</small></span>
        <span class="map-studio-project-list__actions">
          <button type="button" disabled={!project.canOpenDraft} title={project.canOpenDraft ? 'Apri bozza' : 'Il layout attivo non si apre come bozza'} onclick={(event) => {
            event.stopPropagation()
            onOpenDraft(project)
          }}>
            Apri
          </button>
        </span>
      </div>
    {/each}
  </div>

  <footer>
    <span>{filteredProjects.length} elementi</span>
    <div>
      <button type="button" disabled aria-label="Pagina precedente">‹</button>
      <strong>1</strong>
      <button type="button" disabled aria-label="Pagina successiva">›</button>
    </div>
  </footer>
</section>
