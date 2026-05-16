<script lang="ts">
  import { onMount } from 'svelte'
  import { accountStatusLabels, paymentMethodLabels } from '../../lib/format/accountLabels'
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { formatEuroFromCents } from '../../lib/format/money'
  import { reservationStatusLabels, reservationTypeLabels } from '../../lib/format/reservationLabels'
  import { getAccountLedger, getReservationSummary } from '../../lib/services/reservationSummaryService'
  import type {
    AccountLedger,
    LedgerExtraRow,
    LedgerPaymentRow,
    ReservationSummary,
    ReservationTimelineEntry,
  } from '../../lib/types/reservationSummary'
  import type { RegistryRecord } from '../../lib/types/registry'

  let {
    record,
    onClose,
  }: {
    record: RegistryRecord | null
    onClose?: () => void
  } = $props()

  let loading = $state(false)
  let reservationSummary = $state<ReservationSummary | null>(null)
  let accountLedger = $state<AccountLedger | null>(null)
  let loadedId: string | null = $state(null)
  const detailPayments = $derived<LedgerPaymentRow[]>(accountLedger?.paymentRows ?? [])
  const detailExtras = $derived<LedgerExtraRow[]>(accountLedger?.extraRows ?? [])
  const detailTimeline = $derived<ReservationTimelineEntry[]>(reservationSummary?.timeline ?? [])
  const periodLabel = $derived(
    record && record.startDate && record.endDate
      ? formatDateRangeItalian(record.startDate, record.endDate)
      : 'Periodo non disponibile',
  )
  const typeLabel = $derived(record?.reservationType ? reservationTypeLabels[record.reservationType] : 'Conto')
  const statusLabel = $derived(
    record?.accountStatus
      ? accountStatusLabels[record.accountStatus]
      : record?.reservationStatus
        ? reservationStatusLabels[record.reservationStatus]
        : 'Senza conto',
  )

  const loadDetail = async () => {
    if (!record || loadedId === record.id) {
      return
    }

    loading = true
    loadedId = record.id
    reservationSummary = null
    accountLedger = null
    try {
      if (record.reservationId) {
        reservationSummary = await getReservationSummary(record.reservationId)
        accountLedger = reservationSummary?.ledger ?? null
      } else if (record.accountId) {
        accountLedger = await getAccountLedger(record.accountId)
      }
    } finally {
      loading = false
    }
  }

  onMount(() => {
    loadDetail()
  })

  $effect(() => {
    if (record?.id !== loadedId) {
      loadDetail()
    }
  })
</script>

<aside class="registry-detail" aria-label="Dettaglio movimento">
  {#if !record}
    <div class="registry-detail__empty">
      <p>Seleziona una riga per vedere il dettaglio.</p>
    </div>
  {:else if loading}
    <div class="registry-detail__empty">
      <h3>Caricamento dettaglio</h3>
      <p>Preparazione riepilogo operativo.</p>
    </div>
  {:else}
    <header class="registry-detail__header">
      <div>
        <span>{record.kind === 'reservation' ? 'Scheda prenotazione' : 'Scheda conto'}</span>
        <h3>{record.customerName}</h3>
        <p>
          {typeLabel} · {record.itemType ? `${beachTypeLabels[record.itemType]} ${record.itemCode}` : record.itemCode}
          · {periodLabel} · {statusLabel}
        </p>
      </div>
      {#if onClose}
        <button type="button" class="button-ghost registry-detail__close" onclick={onClose}>Indietro</button>
      {/if}
    </header>

    <div class="registry-detail__body">
      <section class="registry-detail__booking-card" aria-label="Scheda prenotazione">
        <div class="registry-detail__booking-main">
          <span>{typeLabel}</span>
          <strong>{record.itemType ? `${beachTypeLabels[record.itemType]} ${record.itemCode}` : record.itemCode}</strong>
          <small>{periodLabel}</small>
        </div>
        <div class="registry-detail__booking-side">
          <span>Stato</span>
          <strong>{statusLabel}</strong>
        </div>
        <dl>
          <div><dt>Cliente</dt><dd>{record.customerName}</dd></div>
          <div><dt>Telefono</dt><dd>{record.customerPhone || 'Telefono non presente'}</dd></div>
          <div><dt>Extra</dt><dd>{record.extrasSummary}</dd></div>
          <div><dt>Ultimo incasso</dt><dd>{formatCompactDateTime(record.lastPaymentDate)}</dd></div>
          <div><dt>Pagamento</dt><dd>{formatEuroFromCents(record.paidAmountCents)} incassati</dd></div>
        </dl>
      </section>

      {#if detailPayments.length || detailExtras.length}
        <section class="registry-detail__activity" aria-label="Pagamenti ed extra">
          <div class="registry-detail__section-head">
            <strong>Pagamenti ed extra</strong>
            <span>{detailPayments.length + detailExtras.length}</span>
          </div>
          <div class="registry-detail__activity-grid">
            <section class="registry-detail__list" aria-label="Pagamenti">
              <div class="registry-detail__subhead">
                <strong>Pagamenti</strong>
                <span>{detailPayments.length}</span>
              </div>
              {#each detailPayments as payment (payment.id)}
                <article>
                  <div>
                    <strong>{formatEuroFromCents(payment.amountCents)}</strong>
                    <span>{formatCompactDateTime(payment.paidAt)} · {paymentMethodLabels[payment.method]}</span>
                  </div>
                </article>
              {/each}
            </section>

            <section class="registry-detail__list" aria-label="Extra">
              <div class="registry-detail__subhead">
                <strong>Extra</strong>
                <span>{detailExtras.length}</span>
              </div>
              {#each detailExtras as extra (extra.id)}
                <article>
                  <div>
                    <strong>{extra.name}</strong>
                    <span>{extra.quantity} x {formatEuroFromCents(extra.unitAmountCents)}</span>
                  </div>
                  <b>{formatEuroFromCents(extra.totalAmountCents)}</b>
                </article>
              {/each}
            </section>
          </div>
        </section>
      {/if}

      {#if detailTimeline.length}
        <section class="registry-detail__timeline" aria-label="Timeline">
          <div class="registry-detail__section-head">
            <strong>Timeline</strong>
            <span>{detailTimeline.length}</span>
          </div>
          {#each detailTimeline as entry (entry.id)}
            <article class={`tone-${entry.tone}`}>
              <i aria-hidden="true"></i>
              <div>
                <strong>{entry.label}</strong>
                <span>{formatCompactDateTime(entry.date)}</span>
                {#if entry.detail}
                  <small>{entry.detail}</small>
                {/if}
              </div>
            </article>
          {/each}
        </section>
      {/if}
    </div>
  {/if}
</aside>
