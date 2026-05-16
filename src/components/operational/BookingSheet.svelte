<script lang="ts">
  import { tick } from 'svelte'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { paymentMethodLabels } from '../../lib/format/accountLabels'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { SavePeriodAndEnsureAccountInput } from '../../lib/services/bookingFlowService'
  import { requestOpenRegistry } from '../../lib/state/registryFilters'
  import type { OperationalPanelTab } from '../../lib/state/operationalPanelState'
  import type { OperationalPanelSize } from '../../lib/state/operationalPanelState'
  import type { AccountInput, Payment, PaymentMethod } from '../../lib/types/account'
  import type { BeachItem } from '../../lib/types/beach'
  import type { AccountExtraItem, AccountExtraItemInput, ExtraItemCatalogEntry, TariffIncludedItem } from '../../lib/types/extraItem'
  import type { ReservationSummary } from '../../lib/types/reservationSummary'
  import type { PriceSuggestion } from '../../lib/types/tariff'
  import AccountInlineEditor from './editors/AccountInlineEditor.svelte'
  import CustomerInlineEditor from './editors/CustomerInlineEditor.svelte'
  import ExtraInlineEditor from './editors/ExtraInlineEditor.svelte'
  import PaymentInlineEditor from './editors/PaymentInlineEditor.svelte'
  import PeriodInlineEditor from './editors/PeriodInlineEditor.svelte'
  import BookingPanelHeader from './BookingPanelHeader.svelte'
  import BookingSecondaryActions from './BookingSecondaryActions.svelte'
  import PaymentProgressBar from './PaymentProgressBar.svelte'

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
    onAddExtraItem,
    onRemoveExtraItem,
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
    onAddExtraItem: (accountId: string, input: AccountExtraItemInput) => void | Promise<void>
    onRemoveExtraItem: (id: string) => void | Promise<void>
  } = $props()

  const effectiveReservation = $derived(reservationSummary?.reservation ?? item.currentReservation ?? null)
  const customerName = $derived(item.assignedCustomer?.customer.fullName ?? null)
  const accountStateLabel = $derived.by(() => {
    if (!item.activeAccount) return 'Conto da preparare'
    if (item.activeAccount.totalAmountCents <= 0) return 'Conto da preparare'
    if (item.activeAccount.balanceAmountCents <= 0) return 'Saldato'
    if (item.activeAccount.paidAmountCents > 0) return 'Parziale'
    return 'Aperto'
  })
  const accountTone = $derived.by(() => {
    if (!item.activeAccount || item.activeAccount.totalAmountCents <= 0) return 'draft'
    if (item.activeAccount.balanceAmountCents <= 0) return 'settled'
    if (item.activeAccount.paidAmountCents > 0) return 'partial'
    return 'open'
  })
  const customerPhoneLabel = $derived(item.assignedCustomer?.customer.phone || 'Telefono non presente')
  const reservationTypeLabel = $derived(
    effectiveReservation ? reservationTypeLabels[effectiveReservation.reservationType] : 'Non impostato',
  )
  const periodFullLabel = $derived(
    effectiveReservation
      ? formatDateRangeItalian(effectiveReservation.startDate, effectiveReservation.endDate)
      : 'Periodo non impostato',
  )
  const includedLabel = $derived.by(() => {
    if (!includedEquipment.length) return 'Nessuna dotazione inclusa'
    return includedEquipment.map((entry) => `${entry.quantity} ${entry.name}`).join(' · ')
  })
  const extraLabel = $derived.by(() => {
    if (!accountExtras.length) return 'Nessun extra'
    return accountExtras.map((entry) => `${entry.name} x${entry.quantity}`).join(' · ')
  })
  const totalPaid = $derived(payments.reduce((sum, payment) => sum + payment.amountCents, 0))
  const recentPayments = $derived(payments.slice(0, 3))
  const lastPayment = $derived(payments[0] ?? null)
  const accountSourceLabel = $derived.by(() => {
    const notes = item.activeAccount?.notes?.trim()
    if (!notes) return 'Da preparare'
    if (notes.toLowerCase().includes('manuale')) return 'Manuale'
    if (notes.toLowerCase().includes('da listino')) return notes
    return notes
  })
  const workspaceMode = $derived.by(() => {
    if (activeTab === 'customer') return 'assign-customer'
    if (activeTab === 'period') return 'edit-period'
    if (activeTab === 'account') return 'edit-due'
    if (activeTab === 'payments') return 'add-payment'
    if (activeTab === 'extra') return 'manage-extras'
    if (!item.assignedCustomer) return 'assign-customer'
    if (!effectiveReservation) return 'edit-period'
    return 'account-summary'
  })
  const workspaceTitle = $derived.by(() => {
    if (workspaceMode === 'assign-customer') return item.assignedCustomer ? 'Cambia cliente' : 'Assegna cliente'
    if (workspaceMode === 'edit-period') return effectiveReservation ? 'Modifica periodo' : 'Imposta periodo'
    if (workspaceMode === 'edit-due') return item.activeAccount ? 'Modifica importo conto' : 'Apri conto'
    if (workspaceMode === 'add-payment') return 'Registra pagamento'
    if (workspaceMode === 'manage-extras') return 'Gestisci extra'
    return 'Conto prenotazione'
  })
  const workspaceDescription = $derived.by(() => {
    if (workspaceMode === 'assign-customer') return 'Collega o cambia il cliente del posto.'
    if (workspaceMode === 'edit-period') return 'Imposta il periodo operativo della prenotazione.'
    if (workspaceMode === 'edit-due') return item.activeAccount ? 'Aggiorna solo il totale conto.' : 'Crea il conto per questa prenotazione.'
    if (workspaceMode === 'add-payment') return 'Registra un pagamento sul conto corrente.'
    if (workspaceMode === 'manage-extras') return 'Gestisci solo dotazioni extra e quantità.'
    return item.activeAccount ? 'Ledger e azioni economiche della prenotazione.' : 'Completa il conto per attivare il ledger.'
  })

  const openRegistry = () => requestOpenRegistry({
    customerId: item.assignedCustomer?.customer.id,
    customerName: item.assignedCustomer?.customer.fullName,
    itemId: item.id,
    itemCode: item.code,
    reservationId: item.currentReservation?.id,
  })
  const toggleInfo = () => onTabChange(activeTab === 'technical' ? 'overview' : 'technical')
  let sheetElement: HTMLDivElement | null = $state(null)
  let autoExpandedContentKey = $state('')

  const togglePanelSize = () => onPanelSizeChange(panelSize === 'expanded' ? 'medium' : 'expanded')

  $effect(() => {
    activeTab
    panelSize
    item.id
    if (panelSize !== 'medium') return
    if (activeTab === 'overview' || activeTab === 'technical') return

    tick().then(() => {
      if (!sheetElement || panelSize !== 'medium') return
      const contentKey = `${item.id}:${activeTab}:${Boolean(item.assignedCustomer)}:${Boolean(effectiveReservation)}:${Boolean(item.activeAccount)}`
      if (autoExpandedContentKey === contentKey) return
      if (sheetElement.scrollHeight > sheetElement.clientHeight + 16) {
        autoExpandedContentKey = contentKey
        onPanelSizeChange('expanded')
      }
    })
  })

  const setWorkspace = (tab: OperationalPanelTab) => onTabChange(tab)
</script>

<div class="booking-sheet" bind:this={sheetElement}>
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
    onClose={() => onTabChange('overview')}
  />

  <div class="booking-sheet__body">
    <aside class="booking-overview" aria-label="Dossier prenotazione">
      <header class="booking-overview__title">
        <strong>Dossier prenotazione</strong>
        <span>{accountStateLabel}</span>
      </header>

      <section class="booking-dossier-section">
        <header>
          <strong>Cliente</strong>
          <button type="button" onclick={() => setWorkspace('customer')}>{item.assignedCustomer ? 'Cambia cliente' : 'Assegna cliente'}</button>
        </header>
        <div class="booking-dossier-row"><span>Nome</span><strong>{customerName ?? 'Nessun cliente'}</strong></div>
        <div class="booking-dossier-row"><span>Telefono</span><strong>{customerPhoneLabel}</strong></div>
      </section>

      <section class="booking-dossier-section">
        <header>
          <strong>Periodo</strong>
          {#if item.assignedCustomer}
            <button type="button" onclick={() => setWorkspace('period')}>{effectiveReservation ? 'Modifica periodo' : 'Imposta periodo'}</button>
          {/if}
        </header>
        <div class="booking-dossier-row"><span>Tipo</span><strong>{reservationTypeLabel}</strong></div>
        <div class="booking-dossier-row"><span>Data</span><strong>{periodFullLabel}</strong></div>
      </section>

      <section class="booking-dossier-section">
        <header>
          <strong>Conto</strong>
          {#if item.assignedCustomer && effectiveReservation}
            <button type="button" onclick={() => setWorkspace('account')}>{item.activeAccount ? 'Modifica importo conto' : 'Apri conto'}</button>
          {/if}
        </header>
        <div class="booking-dossier-row"><span>Stato</span><strong>{accountStateLabel}</strong></div>
        <div class="booking-dossier-row"><span>Residuo</span><strong>{formatEuroFromCents(item.activeAccount?.balanceAmountCents ?? 0)}</strong></div>
      </section>

      <section class="booking-dossier-section">
        <header>
          <strong>Dotazioni</strong>
          {#if item.activeAccount}<button type="button" onclick={() => setWorkspace('extra')}>Gestisci extra</button>{/if}
        </header>
        <div class="booking-dossier-row"><span>Incluse</span><strong>{includedLabel}</strong></div>
        <div class="booking-dossier-row"><span>Extra</span><strong>{extraLabel}</strong></div>
      </section>

      <section class="booking-dossier-section">
        <header>
          <strong>Pagamenti</strong>
          {#if item.activeAccount}<button type="button" onclick={() => setWorkspace('payments')}>Registra pagamento</button>{/if}
        </header>
        <div class="booking-dossier-row">
          <span>Ultimo</span>
          {#if lastPayment}
            <strong>{formatEuroFromCents(lastPayment.amountCents)} · {formatCompactDateTime(lastPayment.paidAt)}</strong>
          {:else}
            <strong>Nessun pagamento</strong>
          {/if}
        </div>
      </section>
    </aside>

    <section class="booking-workspace" aria-label={workspaceTitle} data-mode={workspaceMode}>
      <header class="booking-workspace__header">
        <div>
          <strong>{workspaceTitle}</strong>
          <span>{workspaceDescription}</span>
        </div>
        {#if activeTab !== 'overview' && activeTab !== 'technical'}
          <button type="button" onclick={() => onTabChange('overview')}>Torna al conto</button>
        {/if}
      </header>

      {#if workspaceMode === 'assign-customer'}
        <CustomerInlineEditor
          assignedCustomer={item.assignedCustomer ?? null}
          {saving}
          onAssign={async (customerId) => {
            await onAssignCustomer(customerId)
            onTabChange('period')
          }}
          onRemove={async () => {
            await onUnassignCustomer()
            onTabChange('overview')
          }}
          onClose={() => onTabChange('overview')}
        />
      {:else if workspaceMode === 'edit-period' && item.assignedCustomer}
        <PeriodInlineEditor
          itemId={item.id}
          assignedCustomer={item.assignedCustomer}
          reservation={effectiveReservation}
          accountId={item.activeAccount?.id ?? null}
          {saving}
          onSave={async (reservationId, input) => {
            await onSavePeriodAndEnsureAccount({
              reservationId,
              reservationType: input.reservationType,
              startDate: input.startDate,
              endDate: input.endDate,
            })
            onTabChange('overview')
          }}
          onClose={() => onTabChange('overview')}
        />
      {:else if workspaceMode === 'edit-due' && item.assignedCustomer}
        <AccountInlineEditor
          itemId={item.id}
          assignedCustomer={item.assignedCustomer}
          reservation={effectiveReservation}
          account={item.activeAccount ?? null}
          {priceSuggestion}
          {saving}
          onSave={async (accountId, input) => {
            if (accountId) await onUpdateAccountTotal(accountId, input.totalAmountCents)
            else await onCreateAccount(input)
            onTabChange('overview')
          }}
          onClose={() => onTabChange('overview')}
        />
      {:else if workspaceMode === 'add-payment' && item.activeAccount}
        <PaymentInlineEditor
          account={item.activeAccount}
          {saving}
          onSave={async (amount, method, note) => {
            await onAddPayment(item.activeAccount!.id, amount, method, note)
            onTabChange('overview')
          }}
          onClose={() => onTabChange('overview')}
        />
        <div class="booking-payments-list" aria-label="Ultimi pagamenti">
          <span>{payments.length ? `${payments.length} pagamenti · ${formatEuroFromCents(totalPaid)}` : 'Nessun pagamento registrato'}</span>
          {#each recentPayments as payment}
            <div>
              <strong>{formatEuroFromCents(payment.amountCents)}</strong>
              <small>{paymentMethodLabels[payment.paymentMethod]} · {formatCompactDateTime(payment.paidAt)}</small>
            </div>
          {/each}
        </div>
      {:else if workspaceMode === 'manage-extras' && item.activeAccount}
        <ExtraInlineEditor
          account={item.activeAccount}
          catalog={extraCatalog}
          items={accountExtras}
          includedItems={includedEquipment}
          {saving}
          onAdd={onAddExtraItem}
          onRemove={onRemoveExtraItem}
          onClose={() => onTabChange('overview')}
        />
      {:else}
        <div class="booking-ledger-workspace">
          <div class="booking-ledger-workspace__money">
            <div><span>Totale conto</span><strong>{formatEuroFromCents(item.activeAccount?.totalAmountCents ?? 0)}</strong></div>
            <div><span>Pagato</span><strong>{formatEuroFromCents(item.activeAccount?.paidAmountCents ?? 0)}</strong></div>
            <div><span>Residuo</span><strong>{formatEuroFromCents(item.activeAccount?.balanceAmountCents ?? 0)}</strong></div>
          </div>
          <p class="booking-ledger-workspace__source">{accountSourceLabel}</p>
          {#if item.activeAccount}
            <PaymentProgressBar totalAmountCents={item.activeAccount.totalAmountCents} paidAmountCents={item.activeAccount.paidAmountCents} />
          {/if}
          <div class="booking-ledger-workspace__actions">
            {#if item.activeAccount}
              <button type="button" onclick={() => setWorkspace('payments')}>Registra pagamento</button>
              <button type="button" onclick={() => setWorkspace('account')}>Modifica importo conto</button>
              <button type="button" onclick={() => setWorkspace('extra')}>Gestisci extra</button>
            {:else if item.assignedCustomer && effectiveReservation}
              <button type="button" onclick={() => setWorkspace('account')}>Apri conto</button>
            {:else}
              <p>Completa cliente e periodo per preparare il conto.</p>
            {/if}
          </div>
          <div class="booking-payments-list" aria-label="Ultimi pagamenti">
            <span>{payments.length ? `${payments.length} pagamenti · ${formatEuroFromCents(totalPaid)}` : 'Nessun pagamento registrato'}</span>
            {#each recentPayments as payment}
              <div>
                <strong>{formatEuroFromCents(payment.amountCents)}</strong>
                <small>{paymentMethodLabels[payment.paymentMethod]} · {formatCompactDateTime(payment.paidAt)}</small>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </section>
  </div>

  {#if operationalError}
    <p class="inline-error">{operationalError}</p>
  {/if}
</div>
