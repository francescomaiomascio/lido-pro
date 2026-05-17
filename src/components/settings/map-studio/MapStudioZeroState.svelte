<script lang="ts">
  import type { MapStudioProjectModel } from './state/mapStudioProjectModel'

  let { projectModel }: { projectModel: MapStudioProjectModel } = $props()

  const title = $derived(
    projectModel.stage === 'perimeter'
      ? 'Definisci il perimetro per iniziare'
      : projectModel.stage === 'areas'
        ? 'Aggiungi aree funzionali'
        : projectModel.stage === 'tracks'
          ? 'Definisci tracciati e distribuzione'
          : 'Costruisci la preview dal modello',
  )
  const subtitle = $derived(
    projectModel.sourceMode === 'empty'
      ? 'Progetto vuoto: la board non contiene una spiaggia precaricata.'
      : projectModel.sourceMode === 'template'
        ? 'Bozza generata da template base, non layout attivo.'
        : 'Configurazione progetto aperta, layout attivo protetto.',
  )
</script>

{#if projectModel.sourceMode === 'empty' && !projectModel.functionalAreas.length}
  <g class="parametric-board__zero-state">
    <g transform="translate(550, 390)">
      <rect x="-190" y="-50" width="380" height="100" rx="18" />
      <text class="title" y="-12">{title}</text>
      <text class="subtitle" y="16">{subtitle}</text>
      <text class="hint" y="39">Tool Perimetro · larghezza · profondita · lato mare · margini</text>
    </g>
  </g>
{/if}
