<script lang="ts">
  import { Dialog } from '@capacitor/dialog'
  import { onMount } from 'svelte'
  import type { Component } from 'svelte'
  import BeachItemList from '../components/beach/BeachItemList.svelte'
  import BeachMap from '../components/beach/BeachMap.svelte'
  import AppTopBar from '../components/layout/AppTopBar.svelte'
  import FilterSheet from '../components/layout/FilterSheet.svelte'
  import ViewSwitcher from '../components/layout/ViewSwitcher.svelte'
  import OperationalBottomPanel from '../components/operational/OperationalBottomPanel.svelte'
  import AppToast from '../components/ui/AppToast.svelte'
  import { APP_DISPLAY_NAME } from '../lib/config/appConfig'
  import { getBeachDisplayCode } from '../lib/format/beachDisplayCodes'
  import { getBeachItemSearchText, sortBeachItems } from '../lib/format/beachLabels'
  import { loadInitialLanguage, saveLanguage, setLanguage, type AppLanguage } from '../lib/i18n/languageStore'
  import { createBeachViewState } from '../lib/state/beachViewState'
  import {
    OPEN_REGISTRY_EVENT,
    type OpenRegistryRequest,
  } from '../lib/state/registryFilters'
  import type { SettingsSection } from '../lib/state/settingsMenuState'
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

  type AppMenuSheetProps = {
    open: boolean
    appDisplayName: string
    activeSection: SettingsSection
    directDetailOpen: boolean
    layout: BeachLayout | null
    summary: BeachStatusSummaryType
    typeSummary: { palms: number; umbrellas: number; smallPalms: number }
    items: BeachItem[]
    runtime: DatabaseRuntime | null
    theme: AppTheme
    language: AppLanguage
    registryOpenRequest: OpenRegistryRequest | null
    extraCatalog: ExtraItemCatalogEntry[]
    onClose: () => void
    onSectionSelect: (section: SettingsSection) => void
    onExtraCatalogChange: (catalog: ExtraItemCatalogEntry[]) => void
    onThemeChange: (theme: AppTheme) => void
    onLanguageChange: (language: AppLanguage) => void
  }

  let viewState = $state(createBeachViewState())
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
  let activeSettingsSection: SettingsSection = $state('beach-parametric-setup')
  let settingsDirectDetailOpen = $state(false)
  let registryOpenRequest: OpenRegistryRequest | null = $state(null)
  let AppMenuSheetComponent = $state<Component<AppMenuSheetProps> | null>(null)
  let settingsMenuLoad: Promise<Component<AppMenuSheetProps>> | null = null
  let settingsClosedAt = 0
  let loadingStepIndex = $state(0)
  const loadingSteps = [
    'Apertura database locale',
    'Verifica persistenza browser',
    'Caricamento 58 posti',
    'Preparazione mappa operativa',
  ]
  const loadingStep = $derived(loadingSteps[loadingStepIndex] ?? loadingSteps.at(-1)!)

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

  const loadState = async () => {
    const state = await loadBeachState()
    layout = state.layout
    items = state.items
    runtime = state.runtime
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

  const loadSettingsMenu = () => {
    settingsMenuLoad ??= import('../components/layout/AppMenuSheet.svelte').then((module) => {
      AppMenuSheetComponent = module.default as Component<AppMenuSheetProps>
      return AppMenuSheetComponent
    })
    return settingsMenuLoad
  }

  const openSettingsSection = (section: SettingsSection, directDetail = true) => {
    activeSettingsSection = section
    settingsDirectDetailOpen = directDetail
    void loadSettingsMenu()
    viewState.menuOpen = true
  }

  const openSettingsFromTopbar = () => {
    if (Date.now() - settingsClosedAt < 350) {
      return
    }
    openSettingsSection(activeSettingsSection, false)
  }

  const closeSettingsMenu = () => {
    settingsClosedAt = Date.now()
    viewState.menuOpen = false
    settingsDirectDetailOpen = false
  }

  const handleOpenRegistryRequest = (event: Event) => {
    registryOpenRequest = (event as CustomEvent<OpenRegistryRequest>).detail
    openSettingsSection('registry', true)
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
    const loadingTimer = window.setInterval(() => {
      loadingStepIndex = Math.min(loadingStepIndex + 1, loadingSteps.length - 1)
    }, 1400)

    loadState()
      .catch((error: unknown) => {
        errorMessage = error instanceof Error ? error.message : 'Errore caricamento spiaggia.'
      })
      .finally(() => {
        window.clearInterval(loadingTimer)
        isLoading = false
      })
    loadExtraItemCatalog()
      .then((catalog) => {
        extraCatalog = catalog
      })
      .catch(() => {
        extraCatalog = []
      })

    return () => {
      window.clearInterval(loadingTimer)
      window.removeEventListener(OPEN_REGISTRY_EVENT, handleOpenRegistryRequest)
      window.removeEventListener(BEACH_LAYOUT_VIEW_CHANGED_EVENT, loadState)
      window.removeEventListener(PARAMETRIC_LAYOUT_CHANGED_EVENT, loadState)
    }
  })
</script>

<div class="app-shell" data-theme={theme}>
  <AppTopBar
    searchQuery={viewState.searchQuery}
    onSearchChange={(searchQuery) => (viewState.searchQuery = searchQuery)}
    onMenuOpen={openSettingsFromTopbar}
  />

  <main class="product-shell" class:panel-expanded={operationalPanel.isExpanded}>
    <section
      class="primary-workspace"
      class:map-mode={viewState.activeView === 'map'}
      class:filters-open={viewState.filtersOpen}
      aria-label="Area principale"
    >
      {#if isLoading}
        <div class="loading-panel" role="status" aria-live="polite">
          <div class="loading-panel__content">
            <div class="loading-panel__header">
              <p class="loading-panel__eyebrow">LidoPro</p>
              <h1>Preparazione mappa</h1>
              <p>{loadingStep}</p>
            </div>

            <div class="loading-map-preview" aria-hidden="true">
              <div class="loading-map-preview__shore"></div>
              <div class="loading-map-preview__stage">
                <span class="loading-map-preview__path path-a"></span>
                <span class="loading-map-preview__path path-b"></span>
                <span class="loading-map-preview__row row-a"></span>
                <span class="loading-map-preview__row row-b"></span>
                <span class="loading-map-preview__row row-c"></span>
                <span class="loading-map-preview__item item-a"></span>
                <span class="loading-map-preview__item item-b"></span>
                <span class="loading-map-preview__item item-c"></span>
                <span class="loading-map-preview__item item-d"></span>
                <span class="loading-map-preview__item item-e"></span>
                <span class="loading-map-preview__item item-f"></span>
                <span class="loading-map-preview__scan"></span>
              </div>
            </div>

            <div class="loading-panel__status">
              <div class="loading-progress" aria-hidden="true">
                <span></span>
              </div>
              <span>{loadingStepIndex + 1}/{loadingSteps.length}</span>
            </div>

            <ol class="loading-steps" aria-label="Avanzamento caricamento">
              {#each loadingSteps as step, index}
                <li class:active={index === loadingStepIndex} class:done={index < loadingStepIndex}>
                  <span></span>
                  {step}
                </li>
              {/each}
            </ol>
          </div>
        </div>
      {:else if errorMessage}
        <div class="loading-panel">
          <h1>Serve attenzione</h1>
          <p>{errorMessage}</p>
        </div>
      {:else if layout}
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
            viewState.menuOpen = false
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
      {/if}

    </section>
  </main>

  {#if operationalPanel.isOpen}
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
      onOpenTariffs={() => openSettingsSection('tariffs', true)}
      onOpenExtra={() => openSettingsSection('extras', true)}
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

</div>

<AppToast />

<div class="settings-host" data-theme={theme}>
  {#if AppMenuSheetComponent}
    <AppMenuSheetComponent
      open={viewState.menuOpen}
      activeSection={activeSettingsSection}
      {layout}
      {summary}
      {typeSummary}
      {items}
      {runtime}
      appDisplayName={APP_DISPLAY_NAME}
      {theme}
      {language}
      {registryOpenRequest}
      directDetailOpen={settingsDirectDetailOpen}
      {extraCatalog}
      onClose={closeSettingsMenu}
      onSectionSelect={(section) => {
        activeSettingsSection = section
        settingsDirectDetailOpen = true
      }}
      onExtraCatalogChange={(catalog) => (extraCatalog = catalog)}
      onThemeChange={(nextTheme) => {
        theme = setTheme(nextTheme)
      }}
      onLanguageChange={(nextLanguage) => {
        language = setLanguage(nextLanguage)
        saveLanguage(nextLanguage)
      }}
    />
  {/if}
</div>
