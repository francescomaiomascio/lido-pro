<script lang="ts">
  import { getBeachItemStatusLabel, getBeachItemTypeLabel } from '../../lib/format/beachLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import type { OperationalPanelSize } from '../../lib/state/operationalPanelState'
  import type { BeachItem } from '../../lib/types/beach'

  type HeaderMode = 'empty' | 'collapsed' | 'expanded'

  let {
    mode,
    item = null,
    displayCode = '',
    totalItems = 0,
    panelSize = 'medium',
    onOpen,
    onCollapse,
    onOpenRegistry,
    onToggleInfo,
    onToggleSize,
  }: {
    mode: HeaderMode
    item?: BeachItem | null
    displayCode?: string
    totalItems?: number
    panelSize?: OperationalPanelSize
    onOpen?: () => void
    onCollapse?: () => void
    onOpenRegistry?: () => void
    onToggleInfo?: () => void
    onToggleSize?: () => void
  } = $props()

  const shortDateFormatter = new Intl.DateTimeFormat('it-IT', { day: 'numeric', month: 'short' })
  const formatShortDate = (date: string) => shortDateFormatter.format(new Date(`${date}T00:00:00`))
  const parseRowSlotFromCode = (value: string): { row: string; slot: string } | null => {
    const match = value.trim().match(/^(\d+)-(\d+)$/)
    if (!match) return null
    return { row: match[1], slot: match[2] }
  }

  const code = $derived(displayCode || item?.code || '')
  const typeLabel = $derived(item ? getBeachItemTypeLabel(item.type) : '')
  const rowSlot = $derived(code ? parseRowSlotFromCode(code) : null)
  const rowSlotLabel = $derived(rowSlot ? `Fila ${rowSlot.row} · Posto ${rowSlot.slot}` : code ? `Posto ${code}` : '')
  const technicalCodeLabel = $derived(code ? `codice ${code}` : '')
  const primaryPlaceLabel = $derived(item ? typeLabel : 'Spiaggia BDF')
  const secondaryPlaceLabel = $derived(item ? rowSlotLabel : `${totalItems} posti`)
  const statusLabel = $derived(item ? getBeachItemStatusLabel(item.status) : 'Offline locale')
  const customerLabel = $derived(item?.assignedCustomer?.customer.fullName ?? (item ? 'Nessun cliente' : 'Seleziona un posto sulla mappa'))
  const periodLabel = $derived.by(() => {
    const reservation = item?.currentReservation
    if (!reservation) return item ? 'Periodo non impostato' : 'per iniziare'
    const type = reservationTypeLabels[reservation.reservationType]
    if (reservation.startDate === reservation.endDate) return `${type} · ${formatShortDate(reservation.startDate)}`
    return `${type} · ${formatDateRangeItalian(reservation.startDate, reservation.endDate)}`
  })
  const accountStateLabel = $derived.by(() => {
    const account = item?.activeAccount
    if (!item) return 'Pronto'
    if (!account || account.totalAmountCents <= 0) return 'Conto da preparare'
    if (account.balanceAmountCents <= 0) return 'Saldato'
    if (account.paidAmountCents > 0) return 'Parziale'
    return 'Aperto'
  })
  const accountLabel = $derived(item ? `Residuo ${formatEuroFromCents(item.activeAccount?.balanceAmountCents ?? 0)}` : 'Operatività locale')
  const statusTone = $derived(item ? item.status : 'empty')
  const accountTone = $derived.by(() => {
    const account = item?.activeAccount
    if (!account || account.totalAmountCents <= 0) return 'draft'
    if (account.balanceAmountCents <= 0) return 'settled'
    if (account.paidAmountCents > 0) return 'partial'
    return 'open'
  })
</script>

<header class={`booking-panel-header booking-panel-header--${mode}`} aria-label="Testata operativa">
  <div class="booking-panel-header__identity">
    <strong>{primaryPlaceLabel}</strong>
    <span>{secondaryPlaceLabel}</span>
    {#if item && technicalCodeLabel}
      <small>{technicalCodeLabel}</small>
    {/if}
  </div>

  <div class="booking-panel-header__flow">
    <div class={`tone-${statusTone}`}>
      <span>{mode === 'empty' ? 'Stato' : 'Stato'}</span>
      <strong>{statusLabel}</strong>
    </div>
    <div>
      <span>{mode === 'empty' ? 'Azione' : 'Cliente'}</span>
      <strong>{customerLabel}</strong>
    </div>
    <div>
      <span>{mode === 'empty' ? 'Mappa' : 'Periodo'}</span>
      <strong>{periodLabel}</strong>
    </div>
  </div>

  <div class={`booking-panel-header__account tone-${accountTone}`}>
    <strong>{accountLabel}</strong>
    <span>{accountStateLabel}</span>
  </div>

  <div class="booking-panel-header__actions">
    {#if mode === 'empty' || mode === 'collapsed'}
      <button type="button" class="booking-panel-header__primary-action" aria-label={mode === 'empty' ? 'Apri azioni rapide' : 'Espandi scheda'} onclick={onOpen}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" aria-hidden="true">
          <path d="M12 5v14"></path>
          <path d="M5 12h14"></path>
        </svg>
      </button>
    {:else}
      <button type="button" class="booking-icon-button" aria-label="Apri registro posto" title="Registro" onclick={onOpenRegistry}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M5 4h14v16H5z"></path>
          <path d="M8 8h8M8 12h8M8 16h5"></path>
        </svg>
      </button>
      <button type="button" class="booking-icon-button" aria-label="Mostra info tecniche" title="Info tecnico" onclick={onToggleInfo}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="9"></circle>
          <path d="M12 10v6"></path>
          <path d="M12 7h.01"></path>
        </svg>
      </button>
      <button type="button" class="booking-icon-button" aria-label={panelSize === 'expanded' ? 'Riduci altezza pannello' : 'Espandi altezza pannello'} title={panelSize === 'expanded' ? 'Riduci' : 'Espandi'} onclick={onToggleSize}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M8 7h8"></path>
          <path d="M8 17h8"></path>
          <path d="M12 7v10"></path>
        </svg>
      </button>
      <button type="button" class="booking-icon-button booking-icon-button--collapse" aria-label="Chiudi scheda compatta" title="Riduci a dock" onclick={onCollapse}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M6 12h12"></path>
        </svg>
      </button>
    {/if}
  </div>
</header>
