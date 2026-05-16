<script lang="ts">
  let {
    metrics,
  }: {
    metrics: Array<{ label: string; value: string | number }>
  } = $props()
</script>

<dl class="settings-metric-grid">
  {#each metrics as metric}
    <div>
      <dt>{metric.label}</dt>
      <dd>{metric.value}</dd>
    </div>
  {/each}
</dl>
