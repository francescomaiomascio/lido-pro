<script lang="ts">
  import type { SavePeriodAndEnsureAccountInput } from '../../lib/services/bookingFlowService'
  import type { OperatorBookingValidationResult } from '../../lib/booking/operatorBookingService'
  import { requestOpenRegistry } from '../../lib/state/registryFilters'
  import type { OperationalPanelSize, OperationalPanelTab } from '../../lib/state/operationalPanelState'
  import type { AccountInput, Payment, PaymentMethod } from '../../lib/types/account'
  import type { BeachItem } from '../../lib/types/beach'
  import type { AccountExtraItem, AccountExtraItemInput, ExtraItemCatalogEntry, TariffIncludedItem } from '../../lib/types/extraItem'
  import type { ReservationSummary } from '../../lib/types/reservationSummary'
  import type { PriceSuggestion } from '../../lib/types/tariff'
  import BookingConsoleActions from './BookingConsoleActions.svelte'
  import BookingConsoleOverview from './BookingConsoleOverview.svelte'
  import BookingConsoleTask from './BookingConsoleTask.svelte'
  import BookingPanelHeader from './BookingPanelHeader.svelte'
  import BookingSecondaryActions from './BookingSecondaryActions.svelte'
  import type { BookingFlowStep, BookingWorkspaceMode } from './bookingConsole.types'

  let {
    item,
    displayCode,
    activeTab,
    panelSize,
    saving,
    operationalError,
    payments,
    priceSuggestion,
    reservationSummary,
    extraCatalog,
    accountExtras,
    includedEquipment,
    onTabChange,
    onPanelSizeChange,
    onToggleExpand,
    onAssignCustomer,
    onUnassignCustomer,
    onCreateAccount,
    onUpdateAccountTotal,
    onAddPayment,
    onSavePeriodAndEnsureAccount,
    onValidatePeriod,
    onAddExtraItem,
    onRemoveExtraItem,
    onCancelReservation,
  }: {
    item: BeachItem
    displayCode: string
    activeTab: OperationalPanelTab
    panelSize: OperationalPanelSize
    saving: boolean
    operationalError: string | null
    payments: Payment[]
    priceSuggestion: PriceSuggestion | null
    reservationSummary: ReservationSummary | null
    extraCatalog: ExtraItemCatalogEntry[]
    accountExtras: AccountExtraItem[]
    includedEquipment: TariffIncludedItem[]
    onTabChange: (tab: OperationalPanelTab) => void
    onPanelSizeChange: (size: OperationalPanelSize) => void
    onToggleExpand: () => void
    onAssignCustomer: (customerId: string) => void | Promise<void>
    onUnassignCustomer: () => void | Promise<void>
    onCreateAccount: (input: AccountInput) => void | Promise<void>
    onUpdateAccountTotal: (accountId: string, totalAmountCents: number) => void | Promise<void>
    onAddPayment: (accountId: string, amountCents: number, paymentMethod: PaymentMethod, note: string) => void | Promise<void>
    onSavePeriodAndEnsureAccount: (input: Omit<SavePeriodAndEnsureAccountInput, 'item' | 'assignedCustomer'>) => void | Promise<void>
    onValidatePeriod: (input: Omit<SavePeriodAndEnsureAccountInput, 'item' | 'assignedCustomer'>) => Promise<OperatorBookingValidationResult>
    onAddExtraItem: (accountId: string, input: AccountExtraItemInput) => void | Promise<void>
    onRemoveExtraItem: (id: string) => void | Promise<void>
    onCancelReservation: (reservationId: string) => void | Promise<void>
  } = $props()

  const effectiveReservation = $derived(reservationSummary?.reservation ?? item.currentReservation ?? null)
  const totalPaid = $derived(payments.reduce((sum, payment) => sum + payment.amountCents, 0))
  const accountStateLabel = $derived.by(() => {
    if (!item.activeAccount) return 'Conto da preparare'
    if (item.activeAccount.totalAmountCents <= 0) return 'Conto da preparare'
    if (item.activeAccount.balanceAmountCents <= 0) return 'Saldato'
    if (item.activeAccount.paidAmountCents > 0) return 'Parziale'
    return 'Aperto'
  })
  const accountSourceLabel = $derived.by(() => {
    const notes = item.activeAccount?.notes?.trim()
    if (!notes) return 'Da preparare'
    if (notes.toLowerCase().includes('manuale')) return 'Manuale'
    if (notes.toLowerCase().includes('da listino')) return notes.replace(/da listino/i, 'Da Articoli')
    return notes
  })
  const workspaceMode = $derived.by<BookingWorkspaceMode>(() => {
    if (activeTab === 'customer') return 'assign-customer'
    if (activeTab === 'period') return 'edit-period'
    if (activeTab === 'extra') return 'manage-extras'
    if (activeTab === 'account') return 'edit-due'
    if (activeTab === 'payments') return 'add-payment'
    return 'overview'
  })
  const flowSteps = $derived.by<BookingFlowStep[]>(() => [
    {
      key: 'customer',
      label: 'Cliente',
      done: Boolean(item.assignedCustomer),
      active: workspaceMode === 'assign-customer',
      action: 'customer',
      enabled: true,
      reason: item.assignedCustomer ? 'Assegnato' : 'Da fare',
    },
    {
      key: 'period',
      label: 'Periodo',
      done: Boolean(effectiveReservation),
      active: workspaceMode === 'edit-period',
      action: 'period',
      enabled: Boolean(item.assignedCustomer),
      reason: item.assignedCustomer ? (effectiveReservation ? 'Impostato' : 'Dopo cliente') : 'Prima cliente',
    },
    {
      key: 'extra',
      label: 'Articoli',
      done: Boolean(includedEquipment.length || accountExtras.length),
      active: workspaceMode === 'manage-extras',
      action: item.activeAccount ? 'extra' : 'account',
      enabled: Boolean(item.assignedCustomer && effectiveReservation),
      reason: item.assignedCustomer && effectiveReservation ? (item.activeAccount ? 'Gestisci' : 'Dopo conto') : 'Dopo periodo',
    },
    {
      key: 'folio',
      label: 'Conto',
      done: Boolean(item.activeAccount && item.activeAccount.balanceAmountCents <= 0),
      active: workspaceMode === 'edit-due' || workspaceMode === 'add-payment',
      action: item.activeAccount ? 'account' : 'account',
      enabled: Boolean(item.assignedCustomer && effectiveReservation),
      reason: item.assignedCustomer && effectiveReservation
        ? item.activeAccount
          ? item.activeAccount.balanceAmountCents <= 0
            ? 'Saldato'
            : 'Incasso'
          : 'Prepara'
        : 'Dopo periodo',
    },
  ])
  const taskTitle = $derived.by(() => {
    if (workspaceMode === 'assign-customer') return item.assignedCustomer ? 'Cambia cliente' : 'Assegna cliente'
    if (workspaceMode === 'edit-period') return effectiveReservation ? 'Modifica periodo' : 'Imposta periodo'
    if (workspaceMode === 'manage-extras') return 'Gestisci Articoli'
    if (workspaceMode === 'edit-due') return item.activeAccount ? 'Modifica conto' : 'Prepara conto'
    if (workspaceMode === 'add-payment') return 'Conto · registra pagamento'
    return 'Panoramica'
  })
  const taskDescription = $derived.by(() => {
    if (workspaceMode === 'assign-customer') return 'Cerca e collega il cliente.'
    if (workspaceMode === 'edit-period') return 'Imposta periodo e disponibilita.'
    if (workspaceMode === 'manage-extras') return 'Seleziona Articoli e quantita.'
    if (workspaceMode === 'edit-due') return item.activeAccount ? 'Aggiorna il totale conto.' : 'Prepara il conto.'
    if (workspaceMode === 'add-payment') return 'Registra incasso dentro il conto.'
    return 'Stato prenotazione e prossima azione.'
  })

  const openRegistry = () => requestOpenRegistry({
    customerId: item.assignedCustomer?.customer.id,
    customerName: item.assignedCustomer?.customer.fullName,
    itemId: item.id,
    itemCode: item.code,
    reservationId: item.currentReservation?.id,
  })
  const toggleInfo = () => onTabChange(activeTab === 'technical' ? 'overview' : 'technical')
  const togglePanelSize = () => onPanelSizeChange(panelSize === 'expanded' ? 'medium' : 'expanded')
  const setWorkspace = (tab: OperationalPanelTab) => onTabChange(tab)
  const closeTask = () => onTabChange('overview')
  let lastItemId = $state('')

  $effect(() => {
    if (item.id === lastItemId) return
    lastItemId = item.id
    if (activeTab !== 'overview') {
      onTabChange('overview')
    }
  })
</script>

<div class={`booking-sheet booking-sheet--${panelSize}`} data-active-tab={activeTab}>
  <BookingPanelHeader
    mode="expanded"
    {item}
    {displayCode}
    {panelSize}
    onOpenRegistry={openRegistry}
    onToggleInfo={toggleInfo}
    onToggleSize={togglePanelSize}
    onCollapse={onToggleExpand}
  />

  <BookingSecondaryActions
    technicalOpen={activeTab === 'technical'}
    itemId={item.id}
    layoutId={item.layoutId}
    coordinates={`${item.xM}m, ${item.yM}m`}
    size={`${item.widthM}m x ${item.heightM}m`}
    onClose={closeTask}
  />

  {#if panelSize !== 'compact'}
    <div class="booking-sheet__body">
      <section class="booking-console" aria-label={taskTitle} data-mode={workspaceMode}>
        <aside class="booking-console__dossier" aria-label="Dossier prenotazione">
          <BookingConsoleActions steps={flowSteps} onSelect={setWorkspace} />
        </aside>

        <div class="booking-console__workspace">
          {#if workspaceMode === 'overview' || activeTab === 'technical'}
            <BookingConsoleOverview
              {item}
              {accountSourceLabel}
              hasReservation={Boolean(effectiveReservation)}
              hasArticles={Boolean(includedEquipment.length || accountExtras.length)}
              {payments}
              {totalPaid}
              onSelect={setWorkspace}
              onCancelReservation={effectiveReservation ? () => onCancelReservation(effectiveReservation.id) : null}
            />
          {:else}
            <BookingConsoleTask
              mode={workspaceMode}
              title={taskTitle}
              description={taskDescription}
              {item}
              {effectiveReservation}
              {accountStateLabel}
              {saving}
              {payments}
              {priceSuggestion}
              {extraCatalog}
              {accountExtras}
              {includedEquipment}
              onClose={closeTask}
              {onAssignCustomer}
              {onUnassignCustomer}
              {onCreateAccount}
              {onUpdateAccountTotal}
              {onAddPayment}
              {onSavePeriodAndEnsureAccount}
              {onValidatePeriod}
              {onAddExtraItem}
              {onRemoveExtraItem}
              onOpenAccount={() => setWorkspace('account')}
              onOpenPayment={() => setWorkspace('payments')}
              onCancelReservation={effectiveReservation ? () => onCancelReservation(effectiveReservation.id) : null}
            />
          {/if}
        </div>
      </section>
    </div>
  {/if}

  {#if operationalError}
    <p class="inline-error">{operationalError}</p>
  {/if}
</div>
