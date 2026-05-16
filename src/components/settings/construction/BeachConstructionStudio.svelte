<script lang="ts">
  import type { MapCanvasConfig } from '../../../lib/map-canvas'
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type {
    ParametricSetupAssetMetric,
    ParametricSetupRow,
    ParametricSetupState,
    ParametricSetupZone,
  } from '../../../lib/map-canvas/parametric/parametricSetupState'
  import type { BeachDistanceRules } from '../../../lib/map-canvas'
  import SettingsFieldRow from '../SettingsFieldRow.svelte'
  import ConstructionMaplet from './ConstructionMaplet.svelte'

  type StudioMode = 'surface' | 'zones' | 'rows' | 'assets' | 'distances' | 'view' | 'calculate'

  let {
    setup,
    output = null,
    status,
    distanceRows,
    draftAvailable,
    gridVisible,
    gridOpacity,
    assetScale,
    labelMode,
    shadowsEnabled,
    onReload,
    onSave,
    onCalculate,
    onShowDraft,
    onShowActive,
    onUpdateBeach,
    onUpdateMargin,
    onUpdateZone,
    onAddZone,
    onDeleteZone,
    onUpdateRow,
    onAddRow,
    onDeleteRow,
    onUpdateAsset,
    onUpdateDistance,
    onUpdateGridVisible,
    onUpdateGridOpacity,
    onUpdateAssetScale,
    onUpdateLabelMode,
    onUpdateShadows,
  }: {
    setup: ParametricSetupState | null
    output?: ParametricLayoutOutput | null
    status: string
    distanceRows: Array<{ label: string; key: keyof BeachDistanceRules; hint: string }>
    draftAvailable: boolean
    gridVisible: boolean
    gridOpacity: number
    assetScale: number
    labelMode: MapCanvasConfig['assets']['labelMode']
    shadowsEnabled: boolean
    onReload: () => void
    onSave: () => void
    onCalculate: () => void
    onShowDraft: () => void
    onShowActive: () => void
    onUpdateBeach: <K extends keyof ParametricSetupState['beach']>(key: K, value: ParametricSetupState['beach'][K]) => void
    onUpdateMargin: <K extends keyof ParametricSetupState['beach']['marginsM']>(key: K, value: ParametricSetupState['beach']['marginsM'][K]) => void
    onUpdateZone: (id: string, patch: Partial<ParametricSetupZone>) => void
    onAddZone: () => void
    onDeleteZone: (id: string) => void
    onUpdateRow: (id: string, patch: Partial<ParametricSetupRow>) => void
    onAddRow: () => void
    onDeleteRow: (id: string) => void
    onUpdateAsset: (assetId: string, patch: Partial<ParametricSetupAssetMetric>) => void
    onUpdateDistance: <K extends keyof ParametricSetupState['distanceRules']>(key: K, value: ParametricSetupState['distanceRules'][K]) => void
    onUpdateGridVisible: (value: boolean) => void
    onUpdateGridOpacity: (value: number) => void
    onUpdateAssetScale: (value: number) => void
    onUpdateLabelMode: (value: MapCanvasConfig['assets']['labelMode']) => void
    onUpdateShadows: (value: boolean) => void
  } = $props()

  let mode = $state<StudioMode>('zones')

  const modes: Array<{ id: StudioMode; label: string; hint: string }> = [
    { id: 'surface', label: 'Superficie', hint: 'Forma e margini' },
    { id: 'zones', label: 'Zone', hint: 'Aree metriche' },
    { id: 'rows', label: 'File', hint: 'Righe e count' },
    { id: 'assets', label: 'Elementi', hint: 'Ingombri' },
    { id: 'distances', label: 'Distanze', hint: 'Vincoli' },
    { id: 'view', label: 'Vista', hint: 'Griglia/render' },
    { id: 'calculate', label: 'Calcolo', hint: 'Output bozza' },
  ]

  const numberFromInput = (event: Event) => Number((event.currentTarget as HTMLInputElement).value)
  const textFromInput = (event: Event) => (event.currentTarget as HTMLInputElement).value
  const selectFromInput = (event: Event) => (event.currentTarget as HTMLSelectElement).value
</script>

{#if !setup}
  <section class="construction-studio construction-studio--loading">
    <div><strong>Setup non caricato</strong><span>{status}</span></div>
    <button type="button" onclick={onReload}>Ricarica setup</button>
  </section>
{:else}
  <section class="construction-studio construction-studio--map-first" aria-label="Map Studio">
    <aside class="construction-mode-rail" aria-label="Modalità studio">
      {#each modes as item}
        <button type="button" class:active={mode === item.id} onclick={() => (mode = item.id)}>
          <strong>{item.label}</strong>
          <span>{item.hint}</span>
        </button>
      {/each}
    </aside>

    <main class="construction-studio__maplet">
      <ConstructionMaplet {setup} {output} />
      <div class="construction-output construction-output--maplet">
        <span>{status}</span>
        <strong>{output ? `${output.elements.length} elementi · ${output.warnings.length} warning` : `${setup.rows.reduce((total, row) => total + row.itemCount, 0)} elementi previsti`}</strong>
      </div>
    </main>

    <aside class="construction-inspector" aria-label="Inspector studio mappa">
      {#if mode === 'surface'}
        <header><span>Superficie</span><strong>{setup.beach.widthM}m × {setup.beach.depthM}m</strong></header>
        <div class="construction-fields">
          <SettingsFieldRow label="Nome"><input value={setup.beach.name} oninput={(event) => onUpdateBeach('name', textFromInput(event))} /></SettingsFieldRow>
          <SettingsFieldRow label="Larghezza"><input type="number" min="1" step="0.5" value={setup.beach.widthM} oninput={(event) => onUpdateBeach('widthM', numberFromInput(event))} /></SettingsFieldRow>
          <SettingsFieldRow label="Profondità"><input type="number" min="1" step="0.5" value={setup.beach.depthM} oninput={(event) => onUpdateBeach('depthM', numberFromInput(event))} /></SettingsFieldRow>
          <SettingsFieldRow label="Lato mare"><select value={setup.beach.seaSide} onchange={(event) => onUpdateBeach('seaSide', selectFromInput(event) as ParametricSetupState['beach']['seaSide'])}><option value="top">Alto</option><option value="right">Destra</option><option value="bottom">Basso</option><option value="left">Sinistra</option></select></SettingsFieldRow>
          <div class="construction-grid-2">
            <input aria-label="Margine alto" type="number" step="0.25" value={setup.beach.marginsM.top} oninput={(event) => onUpdateMargin('top', numberFromInput(event))} />
            <input aria-label="Margine destro" type="number" step="0.25" value={setup.beach.marginsM.right} oninput={(event) => onUpdateMargin('right', numberFromInput(event))} />
            <input aria-label="Margine basso" type="number" step="0.25" value={setup.beach.marginsM.bottom} oninput={(event) => onUpdateMargin('bottom', numberFromInput(event))} />
            <input aria-label="Margine sinistro" type="number" step="0.25" value={setup.beach.marginsM.left} oninput={(event) => onUpdateMargin('left', numberFromInput(event))} />
          </div>
        </div>
      {:else if mode === 'zones'}
        <header><span>Zone</span><strong>{setup.zones.length} aree</strong></header>
        <div class="construction-entity-list">
          {#each setup.zones as zone}
            <article class="construction-entity-card">
              <header>
                <input class="construction-entity-title" value={zone.label} aria-label="Nome zona" oninput={(event) => onUpdateZone(zone.id, { label: textFromInput(event) })} />
                <input class="construction-entity-type" value={zone.type} aria-label="Tipo zona" oninput={(event) => onUpdateZone(zone.id, { type: textFromInput(event) })} />
                <button type="button" aria-label="Elimina zona" onclick={() => onDeleteZone(zone.id)}>×</button>
              </header>
              <div class="construction-measure-grid">
                <label><span>X</span><input type="number" step="0.25" value={zone.xM} aria-label="X metri" oninput={(event) => onUpdateZone(zone.id, { xM: numberFromInput(event) })} /></label>
                <label><span>Y</span><input type="number" step="0.25" value={zone.yM} aria-label="Y metri" oninput={(event) => onUpdateZone(zone.id, { yM: numberFromInput(event) })} /></label>
                <label><span>Larghezza</span><input type="number" step="0.25" value={zone.widthM} aria-label="Larghezza metri" oninput={(event) => onUpdateZone(zone.id, { widthM: numberFromInput(event) })} /></label>
                <label><span>Profondità</span><input type="number" step="0.25" value={zone.heightM} aria-label="Profondità metri" oninput={(event) => onUpdateZone(zone.id, { heightM: numberFromInput(event) })} /></label>
              </div>
            </article>
          {/each}
        </div>
        <button type="button" class="construction-link-button" onclick={onAddZone}>+ Crea zona</button>
      {:else if mode === 'rows'}
        <header><span>File</span><strong>{setup.rows.reduce((total, row) => total + row.itemCount, 0)} elementi</strong></header>
        <div class="construction-entity-list">
          {#each setup.rows as row}
            <article class="construction-entity-card construction-entity-card--row">
              <header>
                <input class="construction-entity-title" value={row.label} aria-label="Label fila" oninput={(event) => onUpdateRow(row.id, { label: textFromInput(event) })} />
                <select class="construction-entity-type" value={row.family} aria-label="Famiglia" onchange={(event) => onUpdateRow(row.id, { family: selectFromInput(event) as ParametricSetupRow['family'] })}><option value="palm">Palme</option><option value="umbrella">Ombrelloni</option><option value="small_palm">Palme piccole</option></select>
                <button type="button" aria-label="Elimina fila" onclick={() => onDeleteRow(row.id)}>×</button>
              </header>
              <div class="construction-measure-grid construction-measure-grid--row">
                <label><span>Zona</span><select value={row.zoneId} aria-label="Zona" onchange={(event) => onUpdateRow(row.id, { zoneId: selectFromInput(event) })}><option value="">Nessuna</option>{#each setup.zones as zone}<option value={zone.id}>{zone.label}</option>{/each}</select></label>
                <label><span>Posti</span><input type="number" min="0" step="1" value={row.itemCount} aria-label="Posti" oninput={(event) => onUpdateRow(row.id, { itemCount: Math.max(0, Math.round(numberFromInput(event))) })} /></label>
              </div>
            </article>
          {/each}
        </div>
        <button type="button" class="construction-link-button" onclick={onAddRow}>+ Aggiungi fila</button>
      {:else if mode === 'assets'}
        <header><span>Elementi</span><strong>{setup.assetMetrics.length} metriche</strong></header>
        <div class="construction-entity-list">
          {#each setup.assetMetrics as asset}
            <article class="construction-entity-card construction-entity-card--asset">
              <header><strong>{asset.label}</strong><span>{asset.family}</span></header>
              <div class="construction-measure-grid">
                <label><span>Larghezza</span><input type="number" step="0.05" value={asset.defaultWidthM} aria-label="Larghezza asset" oninput={(event) => onUpdateAsset(asset.assetId, { defaultWidthM: numberFromInput(event) })} /></label>
                <label><span>Altezza</span><input type="number" step="0.05" value={asset.defaultHeightM} aria-label="Altezza asset" oninput={(event) => onUpdateAsset(asset.assetId, { defaultHeightM: numberFromInput(event) })} /></label>
                <label><span>Diametro</span><input type="number" step="0.05" value={asset.defaultDiameterM ?? 0} aria-label="Diametro asset" oninput={(event) => onUpdateAsset(asset.assetId, { defaultDiameterM: numberFromInput(event) || undefined })} /></label>
              </div>
            </article>
          {/each}
        </div>
      {:else if mode === 'distances'}
        <header><span>Distanze</span><strong>Vincoli di calcolo</strong></header>
        <div class="construction-fields">{#each distanceRows as row}<SettingsFieldRow label={row.label} hint={row.hint}><input type="number" min="0" step="0.1" value={setup.distanceRules[row.key]} oninput={(event) => onUpdateDistance(row.key, numberFromInput(event))} /></SettingsFieldRow>{/each}</div>
      {:else if mode === 'view'}
        <header><span>Controlli vista</span><strong>Griglia e rendering</strong></header>
        <div class="construction-fields">
          <label class="settings-row-toggle"><span>Mostra griglia</span><input type="checkbox" checked={gridVisible} onchange={(event) => onUpdateGridVisible((event.currentTarget as HTMLInputElement).checked)} /></label>
          <SettingsFieldRow label="Opacità griglia"><input type="range" min="0" max="1" step="0.05" value={gridOpacity} oninput={(event) => onUpdateGridOpacity(numberFromInput(event))} /></SettingsFieldRow>
          <SettingsFieldRow label="Scala oggetti"><input type="range" min="0.5" max="2" step="0.05" value={assetScale} oninput={(event) => onUpdateAssetScale(numberFromInput(event))} /></SettingsFieldRow>
          <SettingsFieldRow label="Label"><select value={labelMode} onchange={(event) => onUpdateLabelMode(selectFromInput(event) as MapCanvasConfig['assets']['labelMode'])}><option value="always">Sempre visibili</option><option value="selected">Solo selezionato</option><option value="hidden">Nascoste</option></select></SettingsFieldRow>
          <label class="settings-row-toggle"><span>Ombre</span><input type="checkbox" checked={shadowsEnabled} onchange={(event) => onUpdateShadows((event.currentTarget as HTMLInputElement).checked)} /></label>
        </div>
      {:else}
        <header><span>Calcolo</span><strong>{output ? `${output.elements.length} elementi` : 'Bozza non calcolata'}</strong></header>
        <div class="construction-calc-stack"><button type="button" onclick={onSave}>Salva bozza</button><button type="button" class="primary" onclick={onCalculate}>Calcola bozza</button><button type="button" onclick={onShowDraft} disabled={!draftAvailable}>Visualizza bozza sulla mappa</button><button type="button" onclick={onShowActive}>Torna al layout attivo</button></div>
        {#if output?.warnings.length}<div class="metric-preview__warnings">{#each output.warnings.slice(0, 6) as warning}<p><strong>{warning.code}</strong><span>{warning.message}</span></p>{/each}</div>{/if}
      {/if}
    </aside>

    <footer class="construction-studio__actions"><button type="button" onclick={onSave}>Salva bozza</button><button type="button" class="primary" onclick={onCalculate}>Calcola bozza</button><button type="button" onclick={onShowDraft} disabled={!draftAvailable}>Visualizza bozza</button><button type="button" onclick={onShowActive}>Layout attivo</button></footer>
  </section>
{/if}
