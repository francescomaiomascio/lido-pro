<script lang="ts">
  import { APP_DISPLAY_NAME } from '../../lib/config/appConfig'
  let {
    onOpenList,
    onOpenFilters,
    onOpenTariffs,
    onOpenExtra,
  }: {
    onOpenList: () => void
    onOpenFilters: () => void
    onOpenTariffs: () => void
    onOpenExtra: () => void
  } = $props()
</script>

<section class="app-intro-banner" aria-label="Introduzione operativa">
  <div class="app-intro-banner__head">
    <span>{APP_DISPLAY_NAME}</span>
    <small>58 posti · offline locale · backup non configurato</small>
  </div>

  <div class="app-intro-banner__body">
    <h3>Seleziona un posto sulla mappa per gestire cliente, periodo, conto e pagamenti.</h3>
    <p>La mappa resta il contesto. Il pannello basso e il punto di lavoro operativo.</p>
  </div>

  <div class="app-intro-banner__actions">
    <button type="button" onclick={onOpenList}>Apri lista</button>
    <button type="button" onclick={onOpenFilters}>Filtri</button>
    <button type="button" onclick={onOpenTariffs}>Tariffe</button>
    <button type="button" onclick={onOpenExtra}>Extra</button>
  </div>
</section>
