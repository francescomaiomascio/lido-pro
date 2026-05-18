<script lang="ts">
  import type { HomeOperationalModel } from './homeOperationalModel'

  let {
    model,
  }: {
    model: HomeOperationalModel
  } = $props()
</script>

<header class="home-cockpit-header" aria-label="Stato operativo">
  <strong>Console</strong>
  <dl>
    <div><dt>Lido</dt><dd>{model.lidoName}</dd></div>
    <div><dt>Oggi</dt><dd>{model.currentDate}</dd></div>
    <div><dt>Spiaggia</dt><dd>{model.header.beach}</dd></div>
    <div><dt>Bar</dt><dd>{model.header.bar}</dd></div>
    <div><dt>Conti</dt><dd>{model.header.accounts}</dd></div>
    <div><dt>Studio</dt><dd>{model.header.studio}</dd></div>
  </dl>
</header>
