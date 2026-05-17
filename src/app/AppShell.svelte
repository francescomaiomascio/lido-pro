<script lang="ts">
  import { Dialog } from '@capacitor/dialog'
  import { onMount } from 'svelte'
  import BeachItemList from '../components/beach/BeachItemList.svelte'
  import BeachMap from '../components/beach/BeachMap.svelte'
  import LidoProDashboard from '../components/dashboard/LidoProDashboard.svelte'
  import AppTopBar from '../components/layout/AppTopBar.svelte'
  import FilterSheet from '../components/layout/FilterSheet.svelte'
  import ViewSwitcher from '../components/layout/ViewSwitcher.svelte'
  import AppLoadingScreen from '../components/loading/AppLoadingScreen.svelte'
  import SetupStatePanel from '../components/loading/SetupStatePanel.svelte'
  import OperationalBottomPanel from '../components/operational/OperationalBottomPanel.svelte'
  import CustomersSettingsPanel from '../components/settings/panels/CustomersSettingsPanel.svelte'
  import MapStudioSettingsPanel from '../components/settings/panels/MapStudioSettingsPanel.svelte'
  import RegistrySettingsPanel from '../components/settings/panels/RegistrySettingsPanel.svelte'
  import SystemSettingsPanel from '../components/settings/panels/SystemSettingsPanel.svelte'
  import TariffsSettingsPanel from '../components/settings/panels/TariffsSettingsPanel.svelte'
  import AppToast from '../components/ui/AppToast.svelte'
  import { DEFAULT_WORKSPACE_NAME } from '../lib/config/appConfig'
  import { getBeachDisplayCode } from '../lib/format/beachDisplayCodes'
  import { getBeachItemSearchText, sortBeachItems } from '../lib/format/beachLabels'
  import { loadInitialLanguage, saveLanguage, setLanguage, type AppLanguage } from '../lib/i18n/languageStore'
  import type { LidoProModuleId } from '../lib/navigation/lidoproNavigation'
  import { createBeachViewState } from '../lib/state/beachViewState'
  import {
    OPEN_REGISTRY_EVENT,
    type OpenRegistryRequest,
  } from '../lib/state/registryFilters'
  import { loadInitialTheme, saveTheme, setTheme } from '../lib/theme/themeStore'
  import type { AppTheme } from '../lib/theme/themeTokens'
  import {
    BEACH_LAYOUT_VIEW_CHANGED_EVENT,
    loadBeachItemStatusEvents,
    loadBeachState,
    updateBeachItemOperationalNoteAndReload,
  } from '../lib/services/beachLayoutService'
  import { unassignCustomerFromItem } from '../lib/services/customerService'
  import { PARAMETRIC_LAYOUT_CHANGED_EVENT } from '../lib/map-canvas/parametric/parametricLayoutRepository'
  import { showToast } from '../lib/state/toastState'
  import {
    assignCustomerAndAdvance,
    calculateIncludedEquipmentForItem,
    savePeriodAndEnsureAccount,
    type SavePeriodAndEnsureAccountInput,
  } from '../lib/services/bookingFlowService'
  import {
    addPaymentAndReload,
    closeAccountAndReload,
    createAccountAndReload,
    loadPaymentsForAccount,
    updateAccountTotalAndReload,
  } from '../lib/services/accountService'
  import {
    cancelReservationAndReload,
    createReservationAndReload,
    updateReservationAndReload,
  } from '../lib/services/reservationService'
  import { suggestPriceForBeachItem } from '../lib/services/tariffService'
  import {
    addAccountExtraItemAndReload,
    loadAccountExtraItems,
    loadExtraItemCatalog,
    removeAccountExtraItemAndReload,
  } from '../lib/services/extraItemService'
  import {
    getAccountLedger,
    getReservationSummaryForItem,
  } from '../lib/services/reservationSummaryService'
  import { createOperationalPanelState } from '../lib/state/operationalPanelState'
  import type { AccountInput, Payment, PaymentMethod } from '../lib/types/account'
  import type {
    BeachItem,
    BeachItemStatusEvent,
    BeachLayout,
    BeachStatusSummary as BeachStatusSummaryType,
  } from '../lib/types/beach'
  import type { ReservationInput } from '../lib/types/reservation'
  import type { PriceSuggestion, TariffReservationType } from '../lib/types/tariff'
  import type { DatabaseRuntime } from '../lib/types/db'
  import type { AccountExtraItem, AccountExtraItemInput, ExtraItemCatalogEntry, TariffIncludedItem } from '../lib/types/extraItem'
  import type { AccountLedger, ReservationSummary } from '../lib/types/reservationSummary'
  import type { LoadingStep } from '../components/loading/loadingTypes'

  let viewState = $state(createBeachViewState())
  let activeModule: LidoProModuleId = $state('dashboard')
  let operationalPanel = $state(createOperationalPanelState())
  let layout: BeachLayout | null = $state(null)
  let items: BeachItem[] = $state([])
  let runtime: DatabaseRuntime | null = $state(null)
  let errorMessage: string | null = $state(null)
  let confirmation: string | null = $state(null)
  let operationalError: string | null = $state(null)
  let isLoading = $state(true)
  let isSaving = $state(false)
  let itemEvents: BeachItemStatusEvent[] = $state([])
  let accountPayments: Payment[] = $state([])
  let reservationSummary: ReservationSummary | null = $state(null)
  let accountLedger: AccountLedger | null = $state(null)
  let priceSuggestion: PriceSuggestion | null = $state(null)
  let extraCatalog: ExtraItemCatalogEntry[] = $state([])
  let accountExtras: AccountExtraItem[] = $state([])
  let includedEquipment = $state<TariffIncludedItem[]>([])
  let theme: AppTheme = $state(loadInitialTheme())
  let language: AppLanguage = $state(loadInitialLanguage())
  let registryOpenRequest: OpenRegistryRequest | null = $state(null)
  let loadingStepIndex = $state(0)
  let loadingTimer: number | null = null
  const MIN_BOOT_SCREEN_MS = 620
  const loadingSteps: LoadingStep[] = [
    {
      owner: 'Runtime',
      label: 'Avvio interfaccia',
      detail: 'Preparazione shell, tema e superficie operativa.',
    },
    {
      owner: 'Database',
      label: 'Apertura locale',
      detail: 'Apertura database locale e selezione runtime disponibile.',
    },
    {
      owner: 'Persistenza',
      label: 'Verifica storage',
      detail: 'Controllo dello storage persistente e fallback browser.',
    },
    {
      owner: 'Layout',
      label: 'Layout attivo',
      detail: 'Caricamento configurazione spiaggia e elementi operativi.',
    },
    {
      owner: 'Workspace',
      label: 'Dashboard pronta',
      detail: 'Preparazione indicatori, moduli e viste di lavoro.',
    },
  ]

  const selectedItem = $derived(
    items.find((item) => item.id === viewState.selectedItemId) ?? null,
  )
  const selectedDisplayCode = $derived(selectedItem ? getBeachDisplayCode(selectedItem, items) : '')
  const filteredItems = $derived(
    items
      .filter((item) => {
        const query = viewState.searchQuery.trim().toLowerCase()
        const matchesSearch = query.length === 0 || getBeachItemSearchText(item).includes(query)
        const matchesStatus =
          viewState.statusFilter === 'all' || item.status === viewState.statusFilter
        const matchesUsage =
          viewState.usageFilter === 'all' || item.usageType === viewState.usageFilter
        return matchesSearch && matchesStatus && matchesUsage
      })
      .toSorted(sortBeachItems),
  )
  const summary = $derived<BeachStatusSummaryType>({
    total: items.length,
    daily: items.filter((item) => item.usageType === 'daily').length,
    seasonal: items.filter((item) => item.usageType === 'seasonal').length,
    free: items.filter((item) => item.status === 'free').length,
    occupied: items.filter((item) => item.status === 'occupied').length,
    reserved: items.filter((item) => item.status === 'reserved').length,
    maintenance: items.filter((item) => item.status === 'maintenance').length,
  })
  const typeSummary = $derived({
    palms: items.filter((item) => item.type === 'palm').length,
    umbrellas: items.filter((item) => item.type === 'umbrella').length,
    smallPalms: items.filter((item) => item.type === 'small_palm').length,
  })
  const workspaceSummary = $derived({
    total: items.length,
    assignedCustomers: items.filter((item) => item.assignedCustomer).length,
    openAccounts: items.filter((item) => item.activeAccount?.active).length,
    activeReservations: items.filter((item) => item.currentReservation?.active).length,
  })
  const runtimeLabel = $derived(
    runtime === 'native-sqlite'
      ? 'SQLite nativo'
      : runtime === 'web-persistent-sqlite'
        ? 'Persistenza web'
        : runtime === 'browser-memory-fallback'
          ? 'Memoria browser temporanea'
          : 'Non disponibile',
  )

  const loadState = async () => {
    const state = await loadBeachState()
    layout = state.layout
    items = state.items
    runtime = state.runtime
  }

  const startLoadingTimer = () => {
    if (loadingTimer) {
      window.clearInterval(loadingTimer)
    }
    loadingStepIndex = 0
    loadingTimer = window.setInterval(() => {
      loadingStepIndex = Math.min(loadingStepIndex + 1, loadingSteps.length - 1)
    }, 1100)
  }

  const stopLoadingTimer = () => {
    if (!loadingTimer) {
      return
    }
    window.clearInterval(loadingTimer)
    loadingTimer = null
  }

  const shouldHoldBootScreen = () =>
    import.meta.env.DEV && new URLSearchParams(window.location.search).has('holdBoot')

  const bootWorkspace = async () => {
    isLoading = true
    errorMessage = null
    const bootStartedAt = window.performance.now()
    startLoadingTimer()
    try {
      await loadState()
      loadingStepIndex = loadingSteps.length - 1
    } catch (error: unknown) {
      errorMessage = error instanceof Error ? error.message : 'Errore caricamento spiaggia.'
    } finally {
      const remainingBootTime = MIN_BOOT_SCREEN_MS - (window.performance.now() - bootStartedAt)
      if (remainingBootTime > 0) {
        await new Promise((resolve) => window.setTimeout(resolve, remainingBootTime))
      }
      stopLoadingTimer()
      if (!shouldHoldBootScreen()) {
        isLoading = false
      }
    }
  }

  const retryBootstrap = () => {
    void bootWorkspace()
  }

  const loadSelectedAccountPayments = async (item: BeachItem | null) => {
    if (!item?.activeAccount) {
      accountPayments = []
      accountExtras = []
      includedEquipment = []
      return
    }

    accountPayments = await loadPaymentsForAccount(item.activeAccount.id)
    accountExtras = await loadAccountExtraItems(item.activeAccount.id)
  }

  const loadSelectedIncludedEquipment = async (item: BeachItem | null) => {
    if (!item?.currentReservation) {
      includedEquipment = []
      return
    }
    includedEquipment = await calculateIncludedEquipmentForItem(item, item.currentReservation.reservationType)
  }

  const loadSelectedPriceSuggestion = async (item: BeachItem | null) => {
    if (!item?.assignedCustomer) {
      priceSuggestion = null
      return
    }

    const selectedReservation = item.currentReservation ?? (await getReservationSummaryForItem(item.id))?.reservation ?? null
    const reservationType = (selectedReservation?.reservationType ??
      item.assignedCustomer.assignment.assignmentType) as TariffReservationType
    priceSuggestion = await suggestPriceForBeachItem(
      item,
      reservationType,
      selectedReservation?.startDate,
    )
  }

  const loadSelectedOperationalReadModels = async (item: BeachItem | null) => {
    if (!item) {
      reservationSummary = null
      accountLedger = null
      return
    }

    const [nextReservationSummary, nextAccountLedger] = await Promise.all([
      getReservationSummaryForItem(item.id),
      item.activeAccount ? getAccountLedger(item.activeAccount.id) : Promise.resolve(null),
    ])
    reservationSummary = nextReservationSummary
    accountLedger = nextAccountLedger ?? nextReservationSummary?.ledger ?? null
  }

  const selectItem = (itemId: string) => {
    viewState.selectedItemId = itemId
    operationalPanel.isOpen = true
    operationalPanel.isExpanded = true
    operationalPanel.panelSize = 'medium'
    operationalPanel.activeTab = 'overview'
    operationalPanel.focusedItemId = itemId
    confirmation = null
    operationalError = null
    loadBeachItemStatusEvents(itemId)
      .then((events) => {
        itemEvents = events
      })
      .catch(() => {
        itemEvents = []
      })
    const item = items.find((current) => current.id === itemId) ?? null
    loadSelectedAccountPayments(item).catch(() => {
      accountPayments = []
    })
    loadSelectedPriceSuggestion(item).catch(() => {
      priceSuggestion = null
    })
    loadSelectedOperationalReadModels(item).catch(() => {
      reservationSummary = null
      accountLedger = null
    })
    loadSelectedIncludedEquipment(item).catch(() => {
      includedEquipment = []
    })
  }

  const clearSelection = () => {
    viewState.selectedItemId = null
    operationalPanel.focusedItemId = null
    operationalPanel.isExpanded = false
    operationalPanel.panelSize = 'compact'
    itemEvents = []
    accountPayments = []
    accountExtras = []
    reservationSummary = null
    accountLedger = null
    priceSuggestion = null
    includedEquipment = []
    confirmation = null
    operationalError = null
  }

  const openOperationalPanel = (tab = operationalPanel.activeTab) => {
    operationalPanel.isOpen = true
    operationalPanel.isExpanded = true
    operationalPanel.panelSize = tab === 'overview' || operationalPanel.panelSize === 'compact' ? 'medium' : operationalPanel.panelSize
    operationalPanel.focusedItemId = selectedItem?.id ?? null
    operationalPanel.activeTab = tab
  }

  const openItemFromList = (itemId: string) => {
    selectItem(itemId)
    viewState.activeView = 'map'
  }

  const selectModule = (module: LidoProModuleId) => {
    activeModule = module
    if (module !== 'activeLayout') {
      viewState.filtersOpen = false
    }
  }

  const handleOpenRegistryRequest = (event: Event) => {
    registryOpenRequest = (event as CustomEvent<OpenRegistryRequest>).detail
    selectModule('registry')
  }

  const updateNote = async (note: string) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await updateBeachItemOperationalNoteAndReload(selectedItem.id, note)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      confirmation = 'Nota salvata'
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante il salvataggio nota.'
    } finally {
      isSaving = false
    }
  }

  const assignCustomerForSelection = async (customerId: string) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const assignmentType = selectedItem.currentReservation?.reservationType ?? selectedItem.usageType
      const state = await assignCustomerAndAdvance(selectedItem.id, customerId, assignmentType)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      itemEvents = await loadBeachItemStatusEvents(selectedItem.id)
      showToast('Cliente assegnato')
      operationalPanel.activeTab = 'period'
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedAccountPayments(nextItem)
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      await loadSelectedIncludedEquipment(nextItem)
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante assegnazione cliente.'
    } finally {
      isSaving = false
    }
  }

  const unassignCustomerForSelection = async () => {
    if (!selectedItem) {
      return
    }

    const result = await Dialog.confirm({
      title: 'Rimuovi cliente',
      message:
        selectedItem.status === 'occupied'
          ? 'Rimuovere il cliente e segnare il posto come libero?'
          : 'Rimuovere il cliente da questo posto?',
      okButtonTitle: 'Rimuovi',
      cancelButtonTitle: 'Annulla',
    })

    if (!result.value) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await unassignCustomerFromItem(selectedItem.id)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      itemEvents = await loadBeachItemStatusEvents(selectedItem.id)
      confirmation = 'Cliente rimosso'
      accountPayments = []
      accountExtras = []
      reservationSummary = null
      accountLedger = null
      priceSuggestion = null
      includedEquipment = []
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante rimozione cliente.'
    } finally {
      isSaving = false
    }
  }

  const createAccountForSelection = async (input: AccountInput) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await createAccountAndReload(input)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedAccountPayments(nextItem)
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      showToast('Conto aggiornato')
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante creazione conto.'
    } finally {
      isSaving = false
    }
  }

  const addExtraItemForSelection = async (
    accountId: string,
    input: AccountExtraItemInput,
  ) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await addAccountExtraItemAndReload(accountId, input)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedAccountPayments(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      await loadSelectedIncludedEquipment(nextItem)
      showToast('Extra aggiunto')
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante salvataggio extra.'
    } finally {
      isSaving = false
    }
  }

  const removeExtraItemForSelection = async (extraItemId: string) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await removeAccountExtraItemAndReload(extraItemId)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedAccountPayments(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      showToast('Extra aggiornati')
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante rimozione extra.'
    } finally {
      isSaving = false
    }
  }

  const updateAccountTotalForSelection = async (
    accountId: string,
    totalAmountCents: number,
  ) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await updateAccountTotalAndReload(accountId, totalAmountCents)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedAccountPayments(nextItem)
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      showToast('Conto aggiornato')
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante aggiornamento conto.'
    } finally {
      isSaving = false
    }
  }

  const addPaymentForSelection = async (
    accountId: string,
    amountCents: number,
    paymentMethod: PaymentMethod,
    note: string,
  ) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await addPaymentAndReload(accountId, amountCents, paymentMethod, note)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedAccountPayments(nextItem)
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      showToast('Pagamento registrato')
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante salvataggio pagamento.'
    } finally {
      isSaving = false
    }
  }

  const closeAccountForSelection = async (accountId: string) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await closeAccountAndReload(accountId)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      accountPayments = []
      confirmation = 'Conto chiuso'
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
    } catch (error: unknown) {
      operationalError = error instanceof Error ? error.message : 'Errore durante chiusura conto.'
    } finally {
      isSaving = false
    }
  }

  const createReservationForSelection = async (input: ReservationInput) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await createReservationAndReload(input)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      showToast('Prenotazione creata')
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      await loadSelectedIncludedEquipment(nextItem)
    } catch (error: unknown) {
      operationalError =
        error instanceof Error ? error.message : 'Errore durante creazione prenotazione.'
    } finally {
      isSaving = false
    }
  }

  const updateReservationForSelection = async (
    reservationId: string,
    input: ReservationInput,
  ) => {
    if (!selectedItem) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await updateReservationAndReload(reservationId, input)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      showToast('Prenotazione aggiornata')
      const nextItem = state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      await loadSelectedIncludedEquipment(nextItem)
    } catch (error: unknown) {
      operationalError =
        error instanceof Error ? error.message : 'Errore durante aggiornamento prenotazione.'
    } finally {
      isSaving = false
    }
  }

  const cancelReservationForSelection = async (reservationId: string) => {
    if (!selectedItem) {
      return
    }

    const selectedItemId = selectedItem.id
    const result = await Dialog.confirm({
      title: 'Annulla prenotazione',
      message: 'Annullare questa prenotazione?',
      okButtonTitle: 'Annulla prenotazione',
      cancelButtonTitle: 'Indietro',
    })

    if (!result.value) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const state = await cancelReservationAndReload(reservationId)
      layout = state.layout
      items = state.items
      runtime = state.runtime
      confirmation = 'Prenotazione annullata'
      const nextItem = state.items.find((item) => item.id === selectedItemId) ?? null
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
    } catch (error: unknown) {
      operationalError =
        error instanceof Error ? error.message : 'Errore durante annullamento prenotazione.'
    } finally {
      isSaving = false
    }
  }

  const savePeriodAndAccountForSelection = async (
    input: Omit<SavePeriodAndEnsureAccountInput, 'item' | 'assignedCustomer'>,
  ) => {
    if (!selectedItem?.assignedCustomer) {
      return
    }

    isSaving = true
    confirmation = null

    try {
      const result = await savePeriodAndEnsureAccount({
        ...input,
        item: selectedItem,
        assignedCustomer: selectedItem.assignedCustomer,
      })
      layout = result.state.layout
      items = result.state.items
      runtime = result.state.runtime
      const nextItem = result.state.items.find((item) => item.id === selectedItem.id) ?? null
      await loadSelectedAccountPayments(nextItem)
      await loadSelectedPriceSuggestion(nextItem)
      await loadSelectedOperationalReadModels(nextItem)
      await loadSelectedIncludedEquipment(nextItem)
      operationalPanel.activeTab = 'payments'
      showToast(result.createdReservation ? 'Prenotazione creata' : 'Prenotazione aggiornata')
    } catch (error: unknown) {
      operationalError =
        error instanceof Error ? error.message : 'Errore durante salvataggio prenotazione.'
    } finally {
      isSaving = false
    }
  }

  onMount(() => {
    saveTheme(theme)
    window.addEventListener(OPEN_REGISTRY_EVENT, handleOpenRegistryRequest)
    window.addEventListener(BEACH_LAYOUT_VIEW_CHANGED_EVENT, loadState)
    window.addEventListener(PARAMETRIC_LAYOUT_CHANGED_EVENT, loadState)

    void bootWorkspace()
    loadExtraItemCatalog()
      .then((catalog) => {
        extraCatalog = catalog
      })
      .catch(() => {
        extraCatalog = []
      })

    return () => {
      stopLoadingTimer()
      window.removeEventListener(OPEN_REGISTRY_EVENT, handleOpenRegistryRequest)
      window.removeEventListener(BEACH_LAYOUT_VIEW_CHANGED_EVENT, loadState)
      window.removeEventListener(PARAMETRIC_LAYOUT_CHANGED_EVENT, loadState)
    }
  })
</script>

<div class="app-shell" data-theme={theme}>
  {#if isLoading}
    <AppLoadingScreen steps={loadingSteps} activeIndex={loadingStepIndex} {runtimeLabel} />
  {:else}
  <AppTopBar
    searchQuery={viewState.searchQuery}
    {activeModule}
    workspaceName={DEFAULT_WORKSPACE_NAME}
    {runtimeLabel}
    onSearchChange={(searchQuery) => (viewState.searchQuery = searchQuery)}
    onModuleSelect={selectModule}
    onOpenSystem={() => selectModule('system')}
  />

  <main
    class="product-shell"
    class:panel-expanded={activeModule === 'activeLayout' && operationalPanel.isExpanded}
  >
    <section
      class="primary-workspace"
      class:map-mode={activeModule === 'activeLayout' && viewState.activeView === 'map'}
      class:workspace-mode={activeModule !== 'activeLayout'}
      class:filters-open={viewState.filtersOpen}
      aria-label="Area principale"
    >
      {#if errorMessage}
        <SetupStatePanel
          eyebrow="Bootstrap locale"
          title="Serve attenzione"
          message={errorMessage}
          actionLabel="Riprova"
          tone="danger"
          onAction={retryBootstrap}
        />
      {:else if layout}
        {#if activeModule === 'dashboard'}
          <LidoProDashboard
            {layout}
            {items}
            {summary}
            {typeSummary}
            {workspaceSummary}
            {runtime}
            onOpenModule={selectModule}
          />
        {:else if activeModule === 'activeLayout'}
          <div class="active-layout-workspace" aria-label="Layout attivo operativo">
            <div class="active-layout-ribbon" role="status">
              <strong>Layout attivo protetto</strong>
              <span>Operativita giornaliera · progettazione strutturale in Studio</span>
            </div>

            <div class="workspace-view-switcher">
              <ViewSwitcher
                activeView={viewState.activeView}
                onViewChange={(activeView) => (viewState.activeView = activeView)}
              />
            </div>

            <button
              class="workspace-filter-trigger"
              class:active={viewState.filtersOpen}
              type="button"
              aria-expanded={viewState.filtersOpen}
              aria-label={viewState.filtersOpen ? 'Chiudi filtri' : 'Apri filtri'}
              onclick={() => {
                viewState.filtersOpen = !viewState.filtersOpen
              }}
            >
              {#if viewState.filtersOpen}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" aria-hidden="true">
                  <path d="M6 6l12 12"></path>
                  <path d="M18 6 6 18"></path>
                </svg>
              {:else}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
                  <path d="M4 6h16"></path>
                  <path d="M7 12h10"></path>
                  <path d="M10 18h4"></path>
                </svg>
              {/if}
              <span>Filtri</span>
            </button>

            {#if viewState.activeView === 'map'}
              <BeachMap
                {layout}
                {items}
                matchingItemIds={new Set(filteredItems.map((item) => item.id))}
                selectedItemId={viewState.selectedItemId}
                searchQuery={viewState.searchQuery}
                statusFilter={viewState.statusFilter}
                onSelectItem={selectItem}
                onClearSelection={clearSelection}
                onOpenOperationalPanel={() => openOperationalPanel('overview')}
              />
            {:else}
              <BeachItemList
                items={filteredItems}
                selectedItemId={viewState.selectedItemId}
                onOpenItem={openItemFromList}
              />
            {/if}

            <FilterSheet
              open={viewState.filtersOpen}
              {summary}
              statusFilter={viewState.statusFilter}
              usageFilter={viewState.usageFilter}
              onClose={() => (viewState.filtersOpen = false)}
              onStatusFilterChange={(statusFilter) => (viewState.statusFilter = statusFilter)}
              onUsageFilterChange={(usageFilter) => (viewState.usageFilter = usageFilter)}
            />
          </div>
        {:else if activeModule === 'studioProjects'}
          <section class="workspace-page workspace-page--studio" aria-label="Studio e progetti">
            <MapStudioSettingsPanel />
          </section>
        {:else if activeModule === 'clients'}
          <section class="workspace-page workspace-page--clients" aria-label="Clienti">
            <CustomersSettingsPanel />
          </section>
        {:else if activeModule === 'registry'}
          <section class="workspace-page workspace-page--registry" aria-label="Registro">
            <RegistrySettingsPanel openRequest={registryOpenRequest} />
          </section>
        {:else if activeModule === 'priceList'}
          <section class="workspace-page workspace-page--price-list" aria-label="Listino">
            <TariffsSettingsPanel
              {items}
              onCatalogChange={(catalog) => (extraCatalog = catalog)}
            />
          </section>
        {:else if activeModule === 'system'}
          <section class="workspace-page workspace-page--system" aria-label="Sistema">
            <SystemSettingsPanel
              {language}
              {theme}
              {layout}
              itemCount={items.length}
              {runtime}
              {runtimeLabel}
              onLanguageChange={(nextLanguage) => {
                language = setLanguage(nextLanguage)
                saveLanguage(nextLanguage)
              }}
              onThemeChange={(nextTheme) => {
                theme = setTheme(nextTheme)
              }}
            />
          </section>
        {/if}
      {/if}

    </section>
  </main>

  {#if activeModule === 'activeLayout' && operationalPanel.isOpen}
    <OperationalBottomPanel
      item={selectedItem}
      displayCode={selectedDisplayCode}
      isExpanded={operationalPanel.isExpanded}
      panelSize={operationalPanel.panelSize}
      activeTab={operationalPanel.activeTab}
      saving={isSaving}
      {confirmation}
      {operationalError}
      events={itemEvents}
      payments={accountPayments}
      {priceSuggestion}
      {reservationSummary}
      {accountLedger}
      {extraCatalog}
      accountExtras={accountExtras}
      includedEquipment={includedEquipment}
      summary={workspaceSummary}
      onOpenList={() => (viewState.activeView = 'list')}
      onOpenFilters={() => (viewState.filtersOpen = true)}
      onOpenTariffs={() => selectModule('priceList')}
      onOpenExtra={() => selectModule('priceList')}
      onTabChange={(tab) => (operationalPanel.activeTab = tab)}
      onPanelSizeChange={(panelSize) => {
        operationalPanel.panelSize = panelSize
        operationalPanel.isExpanded = panelSize !== 'compact'
        operationalPanel.lastExpandedByUser = operationalPanel.isExpanded
      }}
      onToggleExpand={() => {
        operationalPanel.isExpanded = !operationalPanel.isExpanded
        operationalPanel.panelSize = operationalPanel.isExpanded ? 'medium' : 'compact'
        operationalPanel.lastExpandedByUser = operationalPanel.isExpanded
      }}
      onNoteSave={updateNote}
      onAssignCustomer={assignCustomerForSelection}
      onUnassignCustomer={unassignCustomerForSelection}
      onCreateAccount={createAccountForSelection}
      onUpdateAccountTotal={updateAccountTotalForSelection}
      onAddPayment={addPaymentForSelection}
      onCloseAccount={closeAccountForSelection}
      onCreateReservation={createReservationForSelection}
      onUpdateReservation={updateReservationForSelection}
      onSavePeriodAndEnsureAccount={savePeriodAndAccountForSelection}
      onCancelReservation={cancelReservationForSelection}
      onAddExtraItem={addExtraItemForSelection}
      onRemoveExtraItem={removeExtraItemForSelection}
    />
  {/if}
  {/if}

</div>

<AppToast />
