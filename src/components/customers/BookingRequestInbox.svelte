<script lang="ts">
  import { onMount } from 'svelte'
  import { formatCompactDateTime } from '../../lib/format/dateLabels'
  import { formatDateRangeItalian } from '../../lib/format/dateRange'
  import { getCustomer } from '../../lib/db/customerRepository'
  import {
    acceptBookingRequest,
    applyChangeRequest,
    createCustomerForBookingRequest,
    getBookingInboxDetail,
    listBookingInboxItems,
    matchBookingRequestCustomer,
    refreshInboxItemAnalysis,
    rejectInboxItem,
    leavePending,
  } from '../../lib/booking/bookingInboxService'
  import type {
    BookingInboxDetail,
    BookingInboxItem,
    BookingInboxItemKind,
  } from '../../lib/booking/bookingInbox.types'
  import type { BookingRequestRecord } from '../../lib/booking/bookingPersistence.types'
  import type { Customer } from '../../lib/types/customer'

  let {
    onInboxChanged,
  }: {
    onInboxChanged?: () => void | Promise<void>
  } = $props()

  let items: BookingInboxItem[] = $state([])
  let selectedId: string | null = $state(null)
  let selectedKind: BookingInboxItemKind | null = $state(null)
  let detail: BookingInboxDetail | null = $state(null)
  let candidateCustomers: Record<string, Customer> = $state({})
  let loading = $state(false)
  let acting = $state(false)
  let error: string | null = $state(null)
  let message: string | null = $state(null)
  let filter: BookingInboxItemKind | 'all' = $state('all')
  let selectedAvailableItemId: string | null = $state(null)

  const visibleItems = $derived(
    filter === 'all' ? items : items.filter((item) => item.kind === filter),
  )

  const getBookingRequest = () =>
    detail?.item.kind === 'booking_request' ? detail.rawRequest as BookingRequestRecord : null

  const getAvailableItemIds = () =>
    detail?.availabilityResult?.items.filter((item) => item.available).map((item) => item.itemId) ?? []

  const loadItems = async () => {
    loading = true
    error = null
    try {
      items = await listBookingInboxItems()
      if (selectedId && selectedKind) {
        detail = await getBookingInboxDetail(selectedId, selectedKind)
      }
    } catch (loadError) {
      error = loadError instanceof Error ? loadError.message : 'Errore caricamento richieste.'
    } finally {
      loading = false
    }
  }

  const loadCandidateCustomers = async (nextDetail: BookingInboxDetail | null) => {
    if (!nextDetail || nextDetail.pairingCandidates.length === 0) {
      candidateCustomers = {}
      return
    }
    const pairs = await Promise.all(
      nextDetail.pairingCandidates.map(async (candidate) => [
        candidate.existingCustomerId,
        await getCustomer(candidate.existingCustomerId),
      ] as const),
    )
    candidateCustomers = Object.fromEntries(
      pairs.filter((pair): pair is readonly [string, Customer] => Boolean(pair[1])),
    )
  }

  const selectItem = async (item: BookingInboxItem) => {
    selectedId = item.id
    selectedKind = item.kind
    message = null
    error = null
    selectedAvailableItemId = null
    detail = await getBookingInboxDetail(item.id, item.kind)
    await loadCandidateCustomers(detail)
    selectedAvailableItemId =
      detail?.item.kind === 'booking_request'
        ? (detail.rawRequest as BookingRequestRecord).requestedItemId ?? getAvailableItemIds()[0] ?? null
        : null
  }

  const refreshDetail = async () => {
    if (!selectedId || !selectedKind) return
    acting = true
    error = null
    try {
      detail = await refreshInboxItemAnalysis(selectedId, selectedKind)
      await loadCandidateCustomers(detail)
      await loadItems()
      message = 'Analisi aggiornata'
    } catch (actionError) {
      error = actionError instanceof Error ? actionError.message : 'Aggiornamento non riuscito.'
    } finally {
      acting = false
    }
  }

  const runAction = async (action: () => Promise<void>, success?: string) => {
    acting = true
    error = null
    message = null
    try {
      await action()
      await loadItems()
      if (selectedId && selectedKind) {
        detail = await getBookingInboxDetail(selectedId, selectedKind)
        await loadCandidateCustomers(detail)
      }
      await onInboxChanged?.()
      message = success ?? 'Operazione completata'
    } catch (actionError) {
      error = actionError instanceof Error ? actionError.message : 'Operazione non riuscita.'
    } finally {
      acting = false
    }
  }

  const matchCandidate = async (customerId: string) => {
    const requestId = selectedId
    if (!requestId) return
    await runAction(async () => {
      detail = await matchBookingRequestCustomer({ requestId, customerId })
    }, 'Cliente abbinato')
  }

  const createCustomerFromRequest = async () => {
    const bookingRequest = getBookingRequest()
    if (!bookingRequest) return
    const payload = bookingRequest.customerPayload
    const fullName =
      payload.fullName ||
      payload.name ||
      [payload.firstName, payload.lastName].filter(Boolean).join(' ').trim()
    if (!fullName) {
      error = 'Nome cliente mancante nella richiesta.'
      return
    }
    await runAction(async () => {
      detail = await createCustomerForBookingRequest({
        requestId: bookingRequest.id,
        customerInput: {
          fullName,
          phone: payload.phone ?? null,
          email: payload.email ?? null,
          notes: payload.notes ?? null,
        },
      })
    }, 'Cliente creato e abbinato')
  }

  const acceptSelected = async () => {
    const current = detail
    if (!current || current.item.kind !== 'booking_request') return
    await runAction(async () => {
      await acceptBookingRequest({
        requestId: current.item.id,
        itemId: selectedAvailableItemId,
      })
    }, 'Richiesta convertita')
  }

  const applySelectedChange = async () => {
    const current = detail
    if (!current || current.item.kind !== 'change_request') return
    await runAction(async () => {
      await applyChangeRequest({ changeRequestId: current.item.id })
    }, 'Richiesta applicata')
  }

  const rejectSelected = async () => {
    const current = detail
    if (!current) return
    await runAction(async () => {
      await rejectInboxItem({ id: current.item.id, kind: current.item.kind })
    }, 'Richiesta rifiutata')
  }

  const leaveSelectedPending = async () => {
    const current = detail
    if (!current) return
    await runAction(async () => {
      await leavePending({ id: current.item.id, kind: current.item.kind })
    }, 'Richiesta in revisione')
  }

  const statusLabel = (status: string) => {
    if (status === 'new') return 'Nuova'
    if (status === 'needs_pairing') return 'Da abbinare'
    if (status === 'operator_review' || status === 'pending_operator_review') return 'In revisione'
    if (status === 'accepted') return 'Accettata'
    if (status === 'rejected') return 'Rifiutata'
    if (status === 'converted_to_booking') return 'Convertita'
    if (status === 'applied') return 'Applicata'
    if (status === 'requested') return 'Richiesta'
    return status
  }

  const availabilityLabel = (status: string) => {
    if (status === 'available') return 'Disponibile'
    if (status === 'partial') return 'Opzioni disponibili'
    if (status === 'conflict') return 'Conflitto'
    if (status === 'needs_item') return 'Scegli posto'
    if (status === 'not_applicable') return 'Non richiesta'
    return 'Da verificare'
  }

  onMount(() => {
    loadItems().catch(() => {
      error = 'Errore caricamento richieste.'
    })
  })
</script>

<section class="booking-inbox" aria-label="Richieste cliente">
  <header class="booking-inbox__header">
    <div>
      <span>Inbox operatore</span>
      <h3>Richieste cliente</h3>
      <p>Abbina cliente, verifica disponibilita e converti solo dopo conferma operatore.</p>
    </div>
    <div class="booking-inbox__filters" aria-label="Filtro richieste">
      <button type="button" class:active={filter === 'all'} onclick={() => (filter = 'all')}>Tutte</button>
      <button type="button" class:active={filter === 'booking_request'} onclick={() => (filter = 'booking_request')}>Prenotazioni</button>
      <button type="button" class:active={filter === 'change_request'} onclick={() => (filter = 'change_request')}>Modifiche</button>
      <button type="button" class="button-secondary" disabled={loading} onclick={() => void loadItems()}>
        Aggiorna
      </button>
    </div>
  </header>

  <div class="booking-inbox__layout">
    <div class="booking-inbox__list" aria-label="Lista richieste">
      <div class="booking-inbox__list-head">
        <span>Tipo</span>
        <span>Cliente</span>
        <span>Periodo</span>
        <span>Disponibilita</span>
        <span>Stato</span>
      </div>
      <div class="booking-inbox__list-body">
        {#if loading}
          <p class="booking-inbox__empty">Caricamento richieste.</p>
        {:else if visibleItems.length === 0}
          <p class="booking-inbox__empty">Nessuna richiesta cliente.</p>
        {:else}
          {#each visibleItems as item (item.kind + item.id)}
            <button
              type="button"
              class="booking-inbox__row"
              class:selected={selectedId === item.id && selectedKind === item.kind}
              onclick={() => void selectItem(item)}
            >
              <span>{item.kind === 'booking_request' ? 'Prenotazione' : 'Modifica'}</span>
              <span>
                <strong>{item.customerSummary.label}</strong>
                <small>{item.customerSummary.detail || item.source}</small>
              </span>
              <span>{item.periodSummary.label}</span>
              <span class:warning={item.availabilityStatus === 'conflict'}>
                {availabilityLabel(item.availabilityStatus)}
              </span>
              <span>{statusLabel(item.status)}</span>
            </button>
          {/each}
        {/if}
      </div>
    </div>

    <aside class="booking-inbox__detail" aria-label="Dettaglio richiesta">
      {#if detail}
        <div class="booking-inbox__detail-head">
          <div>
            <span>{detail.item.kind === 'booking_request' ? 'Nuova richiesta' : 'Richiesta modifica'}</span>
            <h4>{detail.item.customerSummary.label}</h4>
            <p>{detail.item.periodSummary.label}</p>
          </div>
          <strong class:warning={detail.item.priority === 'warning'}>{statusLabel(detail.item.status)}</strong>
        </div>

        <dl class="booking-inbox__facts">
          <div><dt>Origine</dt><dd>{detail.item.source}</dd></div>
          <div><dt>Richiesta</dt><dd>{detail.item.requestedItemSummary.label}</dd></div>
          <div><dt>Pairing</dt><dd>{detail.item.pairingStatus === 'not_applicable' ? 'Non richiesto' : detail.item.pairingStatus}</dd></div>
          <div><dt>Disponibilita</dt><dd>{availabilityLabel(detail.item.availabilityStatus)}</dd></div>
          {#if detail.item.accountImpactStatus}
            <div><dt>Conto</dt><dd>{detail.item.accountImpactStatus}</dd></div>
          {/if}
          <div><dt>Aggiornata</dt><dd>{formatCompactDateTime(detail.item.updatedAt)}</dd></div>
        </dl>

        {#if detail.item.kind === 'booking_request'}
          <section class="booking-inbox__section" aria-label="Abbinamento cliente">
            <div class="booking-inbox__section-head">
              <span>Cliente</span>
              <button type="button" class="button-secondary" disabled={acting} onclick={refreshDetail}>Ricalcola</button>
            </div>
            {#if detail.pairingCandidates.length > 0}
              <div class="booking-inbox__candidates">
                {#each detail.pairingCandidates as candidate (candidate.id)}
                  <div class="booking-inbox__candidate">
                    <div>
                      <strong>{candidateCustomers[candidate.existingCustomerId]?.fullName ?? 'Cliente trovato'}</strong>
                      <span>{candidate.confidence} · {candidate.score}% · {candidate.reasons.join(', ')}</span>
                    </div>
                    <button type="button" disabled={acting} onclick={() => void matchCandidate(candidate.existingCustomerId)}>
                      Abbina
                    </button>
                  </div>
                {/each}
              </div>
            {:else}
              <p class="booking-inbox__empty">Nessun candidato calcolato.</p>
            {/if}
            <button type="button" class="button-secondary" disabled={acting || !getBookingRequest()} onclick={createCustomerFromRequest}>
              Crea cliente dalla richiesta
            </button>
          </section>

          <section class="booking-inbox__section" aria-label="Disponibilita">
            <div class="booking-inbox__section-head">
              <span>Posto disponibile</span>
              <small>{detail.availabilityResult ? `${detail.availabilityResult.available} disponibili` : 'Da verificare'}</small>
            </div>
            {#if getAvailableItemIds().length > 0}
              <select bind:value={selectedAvailableItemId}>
                {#each getAvailableItemIds() as itemId}
                  <option value={itemId}>{itemId}</option>
                {/each}
              </select>
            {:else}
              <p class="booking-inbox__empty">Nessun posto disponibile per questa richiesta.</p>
            {/if}
          </section>
        {/if}

        {#if detail.item.kind === 'change_request' && detail.accountImpactPreview}
          <section class="booking-inbox__section" aria-label="Impatto conto">
            <div class="booking-inbox__section-head">
              <span>Impatto conto</span>
            </div>
            <p class="booking-inbox__empty">
              {detail.item.accountImpactStatus ?? 'Da verificare'}.
              Pagamenti e conto restano tracciati.
            </p>
          </section>
        {/if}

        <div class="booking-inbox__actions">
          <button type="button" class="button-secondary" disabled={acting} onclick={leaveSelectedPending}>Lascia in revisione</button>
          <button type="button" class="button-secondary danger" disabled={acting || !detail.item.canReject} onclick={rejectSelected}>Rifiuta</button>
          {#if detail.item.kind === 'booking_request'}
            <button type="button" class="button-primary" disabled={acting || !detail.item.canConvert} onclick={acceptSelected}>
              Converti
            </button>
          {:else}
            <button type="button" class="button-primary" disabled={acting || !detail.item.canApplyChange} onclick={applySelectedChange}>
              Applica
            </button>
          {/if}
        </div>
        {#if detail.item.disabledReason}
          <p class="booking-inbox__warning">{detail.item.disabledReason}</p>
        {/if}
      {:else}
        <div class="booking-inbox__placeholder">
          <span>Dettaglio</span>
          <h4>Seleziona una richiesta</h4>
          <p>Qui trovi payload cliente, pairing, disponibilita, impatto conto e azioni operative.</p>
        </div>
      {/if}
    </aside>
  </div>

  {#if message}
    <p class="inline-confirmation">{message}</p>
  {/if}
  {#if error}
    <p class="form-error">{error}</p>
  {/if}
</section>
