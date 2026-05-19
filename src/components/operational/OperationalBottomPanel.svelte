<script lang="ts">
  import type { OperationalPanelTab } from '../../lib/state/operationalPanelState'
  import type { OperationalPanelSize } from '../../lib/state/operationalPanelState'
  import type { AccountInput, Payment, PaymentMethod } from '../../lib/types/account'
  import type { BeachItem, BeachItemStatusEvent } from '../../lib/types/beach'
  import type { AccountExtraItem, AccountExtraItemInput, ExtraItemCatalogEntry } from '../../lib/types/extraItem'
  import type { TariffIncludedItem } from '../../lib/types/extraItem'
  import type { ReservationInput } from '../../lib/types/reservation'
  import type { SavePeriodAndEnsureAccountInput } from '../../lib/services/bookingFlowService'
  import type { OperatorBookingValidationResult } from '../../lib/booking/operatorBookingService'
  import type { AccountLedger, ReservationSummary } from '../../lib/types/reservationSummary'
  import type { PriceSuggestion } from '../../lib/types/tariff'
  import BookingPanelHeader from './BookingPanelHeader.svelte'
  import BookingSheet from './BookingSheet.svelte'

  type WorkspaceSummary = {
    total: number
    assignedCustomers: number
    openAccounts: number
    activeReservations: number
  }

  let {
    item,
    displayCode = '',
    isExpanded,
    panelSize = isExpanded ? 'medium' : 'compact',
    activeTab,
    saving,
    confirmation,
    operationalError,
    events,
    payments,
    priceSuggestion,
    reservationSummary,
    accountLedger,
    extraCatalog,
    accountExtras,
    includedEquipment,
    summary,
    onOpenList,
    onOpenFilters: _onOpenFilters,
    onOpenTariffs: _onOpenTariffs,
    onOpenExtra: _onOpenExtra,
    onTabChange,
    onPanelSizeChange,
    onToggleExpand,
    onNoteSave: _onNoteSave,
    onAssignCustomer,
    onUnassignCustomer,
    onCreateAccount,
    onUpdateAccountTotal,
    onAddPayment,
    onCloseAccount,
    onCreateReservation,
    onUpdateReservation,
    onSavePeriodAndEnsureAccount,
    onValidatePeriod,
    onCancelReservation,
    onAddExtraItem,
    onRemoveExtraItem,
  }: {
    item: BeachItem | null
    displayCode?: string
    isExpanded: boolean
    panelSize?: OperationalPanelSize
    activeTab: OperationalPanelTab
    saving: boolean
    confirmation: string | null
    operationalError: string | null
    events: BeachItemStatusEvent[]
    payments: Payment[]
    priceSuggestion: PriceSuggestion | null
    reservationSummary: ReservationSummary | null
    accountLedger: AccountLedger | null
    extraCatalog: ExtraItemCatalogEntry[]
    accountExtras: AccountExtraItem[]
    includedEquipment: TariffIncludedItem[]
    summary: WorkspaceSummary
    onOpenList: () => void
    onOpenFilters: () => void
    onOpenTariffs: () => void
    onOpenExtra: () => void
    onTabChange: (tab: OperationalPanelTab) => void
    onPanelSizeChange: (size: OperationalPanelSize) => void
    onToggleExpand: () => void
    onNoteSave: (note: string) => void | Promise<void>
    onAssignCustomer: (customerId: string) => void | Promise<void>
    onUnassignCustomer: () => void | Promise<void>
    onCreateAccount: (input: AccountInput) => void | Promise<void>
    onUpdateAccountTotal: (accountId: string, totalAmountCents: number) => void | Promise<void>
    onAddPayment: (
      accountId: string,
      amountCents: number,
      paymentMethod: PaymentMethod,
      note: string,
    ) => void | Promise<void>
    onCloseAccount: (accountId: string) => void | Promise<void>
    onCreateReservation: (input: ReservationInput) => void | Promise<void>
    onUpdateReservation: (reservationId: string, input: ReservationInput) => void | Promise<void>
    onSavePeriodAndEnsureAccount: (input: Omit<SavePeriodAndEnsureAccountInput, 'item' | 'assignedCustomer'>) => void | Promise<void>
    onValidatePeriod: (input: Omit<SavePeriodAndEnsureAccountInput, 'item' | 'assignedCustomer'>) => Promise<OperatorBookingValidationResult>
    onCancelReservation: (reservationId: string) => void | Promise<void>
    onAddExtraItem: (accountId: string, input: AccountExtraItemInput) => void | Promise<void>
    onRemoveExtraItem: (extraItemId: string) => void | Promise<void>
  } = $props()

  let panelElement: HTMLElement | null = $state(null)
  let dragHeight: number | null = $state(null)
  let customPanelHeight: number | null = $state(null)
  let dragging = $state(false)
  let lastPanelItemId: string | null = $state(null)
  let dragStartY = 0
  let dragStartHeight = 0

  const getDragLimits = () => {
    const viewportHeight = window.innerHeight || 760
    const viewportWidth = window.innerWidth || 1024
    const isPhone = viewportWidth <= 599
    const isShortLandscape = viewportWidth > viewportHeight && viewportHeight <= 520
    const mediumRatio = isPhone ? 0.55 : 0.36
    const expandedRatio = isShortLandscape ? 0.64 : isPhone ? 0.72 : 0.66
    const maxRatio = isShortLandscape ? 0.76 : isPhone ? 0.78 : 0.92

    return {
      min: isPhone ? 64 : 44,
      medium: Math.min(Math.max(isPhone ? 300 : 260, viewportHeight * mediumRatio), isPhone ? 560 : 430),
      expanded: Math.min(viewportHeight * expandedRatio, isPhone ? 680 : 760),
      max: Math.min(viewportHeight * maxRatio, isPhone ? 720 : 780),
    }
  }

  const clampHeight = (height: number) => {
    const limits = getDragLimits()
    return Math.min(Math.max(height, limits.min), limits.max)
  }

  const startPanelDrag = (event: PointerEvent) => {
    if (!panelElement) return
    event.preventDefault()
    event.stopPropagation()
    dragging = true
    dragStartY = event.clientY
    dragStartHeight = panelElement.getBoundingClientRect().height
    dragHeight = dragStartHeight
    ;(event.currentTarget as HTMLElement).setPointerCapture?.(event.pointerId)
  }

  const dragPanel = (event: PointerEvent) => {
    if (!dragging) return
    event.preventDefault()
    event.stopPropagation()
    dragHeight = clampHeight(dragStartHeight + dragStartY - event.clientY)
  }

  const finishPanelDrag = (event: PointerEvent) => {
    if (!dragging) return
    event.preventDefault()
    event.stopPropagation()
    dragging = false
    ;(event.currentTarget as HTMLElement).releasePointerCapture?.(event.pointerId)

    const height = dragHeight ?? dragStartHeight
    const limits = getDragLimits()

    if (height < limits.min + 34) {
      dragHeight = null
      customPanelHeight = null
      if (isExpanded) onToggleExpand()
      return
    }

    if (!isExpanded) {
      onToggleExpand()
    }

    customPanelHeight = clampHeight(height)
    dragHeight = null
    onPanelSizeChange(height >= limits.medium ? 'expanded' : 'medium')
  }

  const applyPresetPanelSize = (size: OperationalPanelSize) => {
    customPanelHeight = null
    onPanelSizeChange(size)
  }
  const collapsePanel = () => {
    dragHeight = null
    customPanelHeight = null
    onToggleExpand()
  }

  $effect(() => {
    const nextItemId = item?.id ?? null
    if (nextItemId === lastPanelItemId) return
    lastPanelItemId = nextItemId
    dragHeight = null
    customPanelHeight = null
  })
</script>

<section
  bind:this={panelElement}
  class="operational-bottom-panel"
  class:expanded={isExpanded}
  class:compact={!isExpanded}
  class:panel-size-medium={panelSize === 'medium'}
  class:panel-size-expanded={panelSize === 'expanded'}
  class:panel-dragging={dragging}
  style:height={dragHeight || customPanelHeight ? `${dragHeight ?? customPanelHeight}px` : undefined}
  style:max-height={dragHeight || customPanelHeight ? `${dragHeight ?? customPanelHeight}px` : undefined}
  aria-label="Console operativa"
>
  {#if item}
    <button
      type="button"
      class="operational-panel-resize-handle"
      aria-label="Ridimensiona scheda operativa"
      onpointerdown={startPanelDrag}
      onpointermove={dragPanel}
      onpointerup={finishPanelDrag}
      onpointercancel={finishPanelDrag}
    >
      <span></span>
    </button>
  {/if}

  {#if !item}
    <BookingPanelHeader mode="empty" totalItems={summary.total} onOpen={onOpenList} />
  {:else if !isExpanded}
    <BookingPanelHeader mode="collapsed" {item} displayCode={displayCode || item.code} onOpen={onToggleExpand} />
  {:else}
    <BookingSheet
      {item}
      displayCode={displayCode || item.code}
      {activeTab}
      {panelSize}
      {saving}
      {operationalError}
      {payments}
      {priceSuggestion}
      {reservationSummary}
      {extraCatalog}
      {accountExtras}
      {includedEquipment}
      {onTabChange}
      onPanelSizeChange={applyPresetPanelSize}
      onToggleExpand={collapsePanel}
      {onAssignCustomer}
      {onUnassignCustomer}
      {onCreateAccount}
      {onUpdateAccountTotal}
      {onAddPayment}
      {onSavePeriodAndEnsureAccount}
      {onValidatePeriod}
      {onAddExtraItem}
      {onRemoveExtraItem}
      {onCancelReservation}
    />
  {/if}
</section>
