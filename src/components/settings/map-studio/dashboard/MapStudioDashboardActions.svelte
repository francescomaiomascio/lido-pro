<script lang="ts">
  import type { MapStudioProjectEntryMode } from '../state/mapStudioProjectModel'

  let {
    canCompare,
    canPublish,
    onStart,
    onCompare,
  }: {
    canCompare: boolean
    canPublish: boolean
    onStart: (mode: MapStudioProjectEntryMode) => void
    onCompare: () => void
  } = $props()

  const actions = $derived.by<Array<{
    id: string
    label: string
    detail: string
    icon: string
    primary?: boolean
    disabledReason?: string
    run: () => void
  }>>(() => [
    {
      id: 'new',
      label: 'Nuovo progetto',
      detail: 'Crea da zero',
      icon: 'M12 5v14M5 12h14',
      primary: true,
      run: () => onStart('empty'),
    },
    {
      id: 'template',
      label: 'Usa layout base',
      detail: 'Crea da layout canonico',
      icon: 'M4 6h16M4 12h16M4 18h16M8 6v12',
      run: () => onStart('template'),
    },
    {
      id: 'open',
      label: 'Apri bozza',
      detail: 'Continua un lavoro',
      icon: 'M4 6h7l2 2h7v10H4z',
      run: () => onStart('existing'),
    },
    {
      id: 'compare',
      label: 'Confronta con attivo',
      detail: 'Analizza differenze',
      icon: 'M7 4v16M17 4v16M4 8h6M14 8h6M4 16h6M14 16h6',
      disabledReason: canCompare ? undefined : 'Serve una bozza disponibile per confrontare.',
      run: onCompare,
    },
    {
      id: 'publish',
      label: 'Attiva bozza',
      detail: 'Rendi operativa',
      icon: 'M20 6 9 17l-5-5',
      primary: true,
      disabledReason: canPublish ? undefined : 'Attivazione disabilitata: manca verifica/pubblicazione sicura.',
      run: () => undefined,
    },
  ])
</script>

<section class="map-studio-dashboard-actions" aria-label="Azioni principali Studio Mappa">
  {#each actions as action}
    <button
      type="button"
      class:primary={action.primary}
      disabled={Boolean(action.disabledReason)}
      title={action.disabledReason ?? action.label}
      onclick={action.run}
    >
      <span aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d={action.icon} />
        </svg>
      </span>
      <strong>{action.label}</strong>
      <small>{action.detail}</small>
    </button>
  {/each}
</section>
