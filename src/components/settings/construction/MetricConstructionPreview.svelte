<script lang="ts">
  import type { ParametricLayoutOutput } from '../../../lib/map-canvas/parametric/parametricLayoutEngine'
  import type { ParametricSetupState } from '../../../lib/map-canvas/parametric/parametricSetupState'

  let {
    setup,
    output = null,
  }: {
    setup: ParametricSetupState
    output?: ParametricLayoutOutput | null
  } = $props()

  const canvasWidth = 720
  const canvasHeight = 520
  const pad = 34
  const usableW = canvasWidth - pad * 2
  const usableH = canvasHeight - pad * 2
  const scale = $derived(Math.min(usableW / Math.max(setup.beach.widthM, 1), usableH / Math.max(setup.beach.depthM, 1)))
  const frameW = $derived(setup.beach.widthM * scale)
  const frameH = $derived(setup.beach.depthM * scale)
  const frameX = $derived((canvasWidth - frameW) / 2)
  const frameY = $derived((canvasHeight - frameH) / 2)

  const x = (value: number) => frameX + value * scale
  const y = (value: number) => frameY + value * scale
  const w = (value: number) => value * scale
  const h = (value: number) => value * scale

  const familyColor = (family: string) =>
    family === 'umbrella' ? '#c7923e' : family === 'small_palm' ? '#266e57' : '#0f7a61'

  const zoneColor = (type: string) =>
    type.includes('umbrella')
      ? 'rgba(219, 166, 78, 0.22)'
      : type.includes('small')
        ? 'rgba(38, 110, 87, 0.18)'
        : type.includes('palm')
          ? 'rgba(23, 132, 99, 0.18)'
          : 'rgba(88, 124, 126, 0.14)'

  const metricForFamily = (family: string) => setup.assetMetrics.find((metric) => metric.family === family)

  const previewRows = $derived(
    setup.rows.flatMap((row) => {
      const zone = setup.zones.find((candidate) => candidate.id === row.zoneId)
      if (!zone || row.itemCount <= 0) return []
      const metric = metricForFamily(row.family)
      const radius = Math.max(2.6, Math.min(8.5, ((metric?.defaultDiameterM ?? metric?.defaultWidthM ?? 1) * scale) / 2))
      const centerY = row.yM ?? zone.yM + zone.heightM / 2
      const points = Array.from({ length: row.itemCount }, (_, index) => {
        const centerX = row.itemCount === 1 ? zone.xM + zone.widthM / 2 : zone.xM + ((index + 0.5) * zone.widthM) / row.itemCount
        return { cx: x(centerX), cy: y(centerY), index: index + 1 }
      })
      return [{ row, zone, points, radius }]
    }),
  )

  const warningCount = $derived(output?.warnings.length ?? 0)
  const elementCount = $derived(output?.elements.length ?? setup.rows.reduce((total, row) => total + row.itemCount, 0))
</script>

<section class="metric-preview" aria-label="Anteprima metrica costruzione">
  <header class="metric-preview__header">
    <div>
      <span>Anteprima metrica</span>
      <strong>{setup.beach.widthM}m × {setup.beach.depthM}m</strong>
    </div>
    <dl>
      <div><dt>Elementi</dt><dd>{elementCount}</dd></div>
      <div><dt>Zone</dt><dd>{setup.zones.length}</dd></div>
      <div class:warning={warningCount > 0}><dt>Warning</dt><dd>{warningCount}</dd></div>
    </dl>
  </header>

  <svg class="metric-preview__svg" viewBox={`0 0 ${canvasWidth} ${canvasHeight}`} role="img" aria-label="Schema tecnico spiaggia">
    <defs>
      <pattern id="metric-grid" width="24" height="24" patternUnits="userSpaceOnUse">
        <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(35,64,66,.12)" stroke-width="1" />
      </pattern>
    </defs>

    <rect x={frameX} y={frameY} width={frameW} height={frameH} rx="10" fill="rgba(246,230,180,.64)" stroke="rgba(28,60,61,.34)" stroke-width="1.4" />
    <rect x={frameX} y={frameY} width={frameW} height={Math.min(58, frameH * 0.18)} rx="10" fill="rgba(91,205,216,.42)" />
    <rect x={frameX} y={frameY} width={frameW} height={frameH} fill="url(#metric-grid)" />

    {#each setup.zones as zone}
      <g>
        <rect x={x(zone.xM)} y={y(zone.yM)} width={w(zone.widthM)} height={h(zone.heightM)} rx="8" fill={zoneColor(zone.type)} stroke="rgba(6,86,79,.34)" stroke-dasharray={zone.locked ? '0' : '6 5'} />
        <text x={x(zone.xM) + 8} y={y(zone.yM) + 18}>{zone.label}</text>
      </g>
    {/each}

    {#each previewRows as preview}
      <g>
        <line x1={x(preview.zone.xM)} x2={x(preview.zone.xM + preview.zone.widthM)} y1={preview.points[0]?.cy ?? 0} y2={preview.points[0]?.cy ?? 0} stroke={familyColor(preview.row.family)} stroke-opacity=".28" stroke-width="2" />
        <text class="metric-preview__row-label" x={x(preview.zone.xM) - 10} y={(preview.points[0]?.cy ?? 0) + 4}>{preview.row.label}</text>
        {#each preview.points as point}
          <circle cx={point.cx} cy={point.cy} r={preview.radius} fill={familyColor(preview.row.family)} fill-opacity=".74" stroke="rgba(255,255,255,.78)" stroke-width="1.5" />
        {/each}
      </g>
    {/each}
  </svg>

  {#if output?.warnings.length}
    <div class="metric-preview__warnings">
      {#each output.warnings.slice(0, 4) as warning}
        <p><strong>{warning.code}</strong><span>{warning.message}</span></p>
      {/each}
    </div>
  {/if}
</section>
