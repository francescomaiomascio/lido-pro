<script lang="ts">
  import type { LidoProModuleId } from '../../lib/navigation/lidoproNavigation'
  import type { HomeOperationalModel } from './homeOperationalModel'

  let {
    model,
    onOpenModule,
  }: {
    model: HomeOperationalModel
    onOpenModule: (module: LidoProModuleId) => void
  } = $props()
</script>

<aside class="home-domain-rail" aria-label="Stato domini operativi">
  <section>
    <span aria-hidden="true">●</span>
    <strong>Clienti</strong>
    <small>{model.customerStatus.assignedCustomers} assegnati</small>
    <em>{model.customerStatus.reservationsWithoutCustomer} prenotazioni senza cliente</em>
  </section>

  <section>
    <span aria-hidden="true">●</span>
    <strong>Dipendenti</strong>
    <small>{model.staffStatus.registeredEmployees} registrati</small>
    <em>{model.staffStatus.onShiftEmployees} in turno · {model.staffStatus.stateLabel}</em>
    <button type="button" onclick={() => onOpenModule('employees')}>Apri</button>
  </section>

  <section>
    <span aria-hidden="true">●</span>
    <strong>Bar</strong>
    <small>{model.barStatus.configured ? 'operativo' : 'non configurato'}</small>
    <em>{model.barStatus.barCatalogItems} articoli · comande previste</em>
  </section>

  <section>
    <span aria-hidden="true">●</span>
    <strong>Studio</strong>
    <small>{model.studioStatus.draftState}</small>
    <em>{model.studioStatus.warnings} avvisi · pubblicazione protetta</em>
  </section>

  <section>
    <span aria-hidden="true">●</span>
    <strong>Listino</strong>
    <small>{model.catalogStatus.syncWithLayoutStatus}</small>
    <em>{model.catalogStatus.beachItemsActive} articoli spiaggia · {model.catalogStatus.barItemsActive} bar</em>
  </section>

  <section>
    <span aria-hidden="true">●</span>
    <strong>Sistema</strong>
    <small>{model.header.runtime}</small>
    <em>{model.registryStatus.openIssues} attenzioni operative</em>
  </section>
</aside>
