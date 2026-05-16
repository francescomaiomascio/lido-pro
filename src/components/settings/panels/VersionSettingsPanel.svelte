<script lang="ts">
  import { APP_DISPLAY_NAME, appConfig } from '../../../lib/config/appConfig'

  let {
    runtimeLabel,
  }: {
    runtimeLabel: string
  } = $props()
</script>

<section class="settings-panel" aria-label="Versione app">
  <div class="settings-view-header settings-panel__header">
    <div>
      <h2>Versione app</h2>
      <p>Informazioni locali di build e identificazione applicazione.</p>
    </div>
  </div>

  <dl class="settings-definition-list">
    <div><dt>Nome prodotto</dt><dd>{APP_DISPLAY_NAME}</dd></div>
    <div><dt>Package Android</dt><dd>{appConfig.appId}</dd></div>
    <div><dt>Database</dt><dd>beach_bdf.db</dd></div>
    <div><dt>Runtime</dt><dd>{runtimeLabel}</dd></div>
    <div><dt>Canale</dt><dd>Locale</dd></div>
  </dl>
</section>
