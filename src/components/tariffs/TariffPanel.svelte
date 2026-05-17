<script lang="ts">
  import { onMount } from 'svelte'
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatEuroFromCents, parseEuroToCents } from '../../lib/format/money'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import { generatedBeachAssets, type GeneratedBeachAsset } from '../../lib/map-canvas/library/generatedAssetManifest'
  import { derivePricingRowsFromActiveLayout, getPricingRowForTariffLabel } from '../../lib/pricing/pricingLayoutRows'
  import { loadExtraItemCatalog, removeExtraItemCatalogEntry, saveExtraItemCatalogEntry } from '../../lib/services/extraItemService'
  import { addTariffRule, loadTariffRules, removeTariffRule, saveTariffRule } from '../../lib/services/tariffService'
  import type { BeachItem } from '../../lib/types/beach'
  import type { ExtraItemCatalogEntry, ExtraItemCatalogInput } from '../../lib/types/extraItem'
  import type { TariffItemType, TariffReservationType, TariffRule, TariffRuleInput } from '../../lib/types/tariff'

  let {
    items,
    onCatalogChange,
  }: {
    items: BeachItem[]
    onCatalogChange?: (catalog: ExtraItemCatalogEntry[]) => void
  } = $props()

  type ListinoTab = 'places' | 'items'
  type DetailMode = 'empty' | 'tariff' | 'article'
  type CatalogType = 'Tariffa posto' | 'Articolo extra' | 'Dotazione inclusa'
  type PriceFilter = 'all' | 'priced' | 'empty'
  type StatusFilter = 'all' | 'active' | 'inactive'
  type CatalogRoleFilter = 'all' | 'places' | 'included' | 'extra' | 'services' | 'inactive'
  type ArticleCatalogRow = ExtraItemCatalogEntry & { duplicateCount: number }
  type PriceGridCell = {
    id: string
    rowLabel: string | null
    displayRowLabel: string
    reservationType: TariffReservationType
    rule: TariffRule | null
    inheritedRule: TariffRule | null
    status: 'Attiva' | 'Fallback' | 'Vuota' | 'Non nel layout'
  }
  type CatalogRow = {
    id: string
    sourceId: string
    source: 'tariff' | 'article'
    type: CatalogType
    name: string
    element: string
    period: string
    category: string
    amountCents: number
    status: string
    usage: string
    quantity: string
    notes: string
    updatedAt: string
    tariff?: TariffRule
    article?: ArticleCatalogRow
  }
  type ListinoCatalogItem = {
    id: string
    name: string
    family: string
    roles: string[]
    roleKeys: CatalogRoleFilter[]
    period: string
    priceSummary: string
    ruleSummary: string
    quantitySummary: string
    status: string
    inBeach: number
    totalInventory: number | null
    offBeach: number | null
    dailyRule: TariffRule | null
    seasonalRule: TariffRule | null
    extraAmountCents: number | null
    maxPerBooking: number | null
    asset: GeneratedBeachAsset | null
    itemType?: TariffItemType
    article?: ArticleCatalogRow
    rules: TariffRule[]
  }

  const itemTypeOptions: Array<{ value: TariffItemType; label: string }> = [
    { value: 'umbrella', label: beachTypeLabels.umbrella },
    { value: 'palm', label: beachTypeLabels.palm },
    { value: 'small_palm', label: beachTypeLabels.small_palm },
  ]
  const reservationTypeOptions: Array<{ value: TariffReservationType; label: string }> = [
    { value: 'daily', label: reservationTypeLabels.daily },
    { value: 'seasonal', label: reservationTypeLabels.seasonal },
  ]
  let activeTab: ListinoTab = $state('places')
  let activePriceItemType: TariffItemType = $state('palm')
  let roleFilter: CatalogRoleFilter = $state('all')
  let periodFilter: 'all' | TariffReservationType = $state('all')
  let priceFilter: PriceFilter = $state('all')
  let statusFilter: StatusFilter = $state('active')
  let categoryFilter = $state('all')
  let selectedCatalogItemId = $state('place:palm')
  let rules: TariffRule[] = $state([])
  let articles: ExtraItemCatalogEntry[] = $state([])
  let query = $state('')
  let detailMode: DetailMode = $state('empty')
  let selectedRule: TariffRule | null = $state(null)
  let selectedArticle: ExtraItemCatalogEntry | null = $state(null)
  let editingPriceCellId: string | null = $state(null)
  let editingPriceDraft = $state('')
  let editingEnabledRowId: string | null = $state(null)
  let editingEnabledDraft = $state('')
  let enabledSeatOverrides: Record<string, number> = $state({})
  let editingStockItemId: string | null = $state(null)
  let editingStockDraft = $state('')
  let inventoryOverrides: Record<string, number> = $state({})
  let showEmptyRows = $state(false)
  let saving = $state(false)
  let message: string | null = $state(null)
  let error: string | null = $state(null)

  let tariffName = $state('')
  let tariffItemType: TariffItemType = $state('umbrella')
  let tariffRowLabel = $state('')
  let tariffReservationType: TariffReservationType = $state('daily')
  let tariffAmount = $state('')
  let tariffNotes = $state('')

  let articleName = $state('')
  let articleCategory = $state('')
  let articleUnit = $state('pz')
  let articleAmount = $state('')
  let articleMaxQuantity = $state(2)
  let articleIncludedQuantity = $state(0)
  let articleNotes = $state('')

  const moneyInputValue = (amountCents: number) => formatEuroFromCents(amountCents).replace('€', '').trim()
  const normalizeCatalogKey = (value: string) => value.trim().toLowerCase()
  const enabledSeatsStorageKey = 'lido-pro:listino:enabled-seats:v1'
  const inventoryStorageKey = 'lido-pro:listino:inventory:v1'
  const compactPrice = (amountCents: number) => amountCents > 0 ? formatEuroFromCents(amountCents) : '—'
  const joinRoles = (roles: string[]) => roles.join(' · ')
  const getAssetById = (assetId: string) => generatedBeachAssets.find((asset) => asset.id === assetId) ?? null
  const placeAssetIds: Record<TariffItemType, string> = {
    umbrella: 'umbrella_classic_top',
    palm: 'palm_large_top',
    small_palm: 'palm_small_top',
  }
  const getArticleAsset = (article: ArticleCatalogRow): GeneratedBeachAsset | null => {
    const key = normalizeCatalogKey(`${article.name} ${article.category}`)
    if (key.includes('lettino')) return getAssetById('sunbed_top')
    if (key.includes('sdraio')) return getAssetById('deck_chair_top')
    if (key.includes('sedia') || key.includes('poltroncina')) return getAssetById('chair_top')
    if (key.includes('tavolino') || key.includes('tavolo')) return getAssetById('table_top')
    if (key.includes('ombrellone')) return getAssetById('umbrella_classic_top')
    if (key.includes('palmetta')) return getAssetById('palm_small_top')
    if (key.includes('palma')) return getAssetById('palm_large_top')
    return null
  }
  const formatAssetSource = (source: GeneratedBeachAsset['source']) =>
    source === 'self_generated_blender_codex' ? 'generated Blender' : 'generated project'
  const getRuleAmount = (itemRules: TariffRule[], reservationType: TariffReservationType) =>
    itemRules.find((rule) => rule.reservationType === reservationType && !rule.rowLabel)
    ?? itemRules.find((rule) => rule.reservationType === reservationType)
    ?? null
  const getInspectorTypeLabel = (mode: DetailMode, includedQuantity: number): CatalogType => {
    if (mode === 'tariff') return 'Tariffa posto'
    if (includedQuantity > 0) return 'Dotazione inclusa'
    return 'Articolo extra'
  }

  const loadListino = async () => {
    const [nextRules, nextArticles] = await Promise.all([loadTariffRules(), loadExtraItemCatalog()])
    rules = nextRules
    articles = nextArticles
    onCatalogChange?.(nextArticles)
  }

  const clearSelection = () => {
    detailMode = 'empty'
    selectedRule = null
    selectedArticle = null
    message = null
    error = null
  }

  const selectTab = (tab: ListinoTab) => {
    activeTab = tab
    priceFilter = 'all'
    statusFilter = 'active'
    categoryFilter = 'all'
    clearSelection()
  }

  const startNewTariff = (rowLabel: string | null = null, reservationType: TariffReservationType = 'daily') => {
    activeTab = 'places'
    selectedRule = null
    selectedArticle = null
    detailMode = 'tariff'
    tariffItemType = activePriceItemType
    tariffReservationType = reservationType
    tariffRowLabel = rowLabel ?? ''
    tariffName = `${beachTypeLabels[activePriceItemType]} ${reservationTypeLabels[reservationType].toLowerCase()}`
    tariffAmount = ''
    tariffNotes = ''
  }

  const editTariff = (rule: TariffRule) => {
    activeTab = 'places'
    selectedRule = rule
    selectedArticle = null
    detailMode = 'tariff'
    tariffName = rule.name
    tariffItemType = rule.itemType
    tariffRowLabel = rule.rowLabel ?? ''
    tariffReservationType = rule.reservationType
    tariffAmount = moneyInputValue(rule.amountCents)
    tariffNotes = rule.notes ?? ''
  }

  const duplicateTariff = () => {
    if (!selectedRule) return
    selectedRule = null
    tariffName = `${tariffName} copia`
  }

  const syncPricingGrid = () => {
    message = 'Posti e dotazioni sincronizzati dal layout attivo'
    error = null
  }

  const buildTariffName = (
    itemType: TariffItemType,
    rowLabel: string | null,
    reservationType: TariffReservationType,
  ) => `${beachTypeLabels[itemType]} ${getDisplayRowLabel(rowLabel).toLowerCase()} ${reservationTypeLabels[reservationType].toLowerCase()}`

  const saveTariff = async () => {
    const amountCents = parseEuroToCents(tariffAmount)
    if (!tariffName.trim() || !Number.isFinite(amountCents) || amountCents < 0) {
      error = 'Nome o importo tariffa non valido.'
      return
    }

    saving = true
    message = null
    error = null
    const input: TariffRuleInput = {
      name: tariffName,
      itemType: tariffItemType,
      rowLabel: tariffRowLabel.trim() || null,
      reservationType: tariffReservationType,
      amountCents,
      priority: tariffRowLabel.trim() ? 10 : 100,
      notes: tariffNotes,
    }
    try {
      if (selectedRule) await saveTariffRule(selectedRule.id, input)
      else await addTariffRule(input)
      await loadListino()
      clearSelection()
      message = 'Tariffa salvata'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore salvataggio tariffa.'
    } finally {
      saving = false
    }
  }

  const archiveTariff = async () => {
    if (!selectedRule) return
    saving = true
    message = null
    error = null
    try {
      await removeTariffRule(selectedRule.id)
      await loadListino()
      clearSelection()
      message = 'Tariffa disattivata'
    } catch (archiveError) {
      error = archiveError instanceof Error ? archiveError.message : 'Errore disattivazione tariffa.'
    } finally {
      saving = false
    }
  }

  const savePriceCell = async (cell: PriceGridCell, rawValue: string) => {
    const value = rawValue.trim()
    editingPriceCellId = null
    if (!value) {
      if (!cell.rule) return
      saving = true
      message = null
      error = null
      try {
        await removeTariffRule(cell.rule.id)
        await loadListino()
        message = 'Prezzo rimosso'
      } catch (saveError) {
        error = saveError instanceof Error ? saveError.message : 'Errore rimozione prezzo.'
      } finally {
        saving = false
      }
      return
    }

    const amountCents = parseEuroToCents(value)
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      error = 'Prezzo non valido.'
      return
    }

    saving = true
    message = null
    error = null
    const input: TariffRuleInput = {
      name: cell.rule?.name ?? buildTariffName(activePriceItemType, cell.rowLabel, cell.reservationType),
      itemType: activePriceItemType,
      rowLabel: cell.rowLabel,
      reservationType: cell.reservationType,
      amountCents,
      priority: cell.rowLabel ? 10 : 100,
      notes: cell.rule?.notes ?? '',
    }
    try {
      if (cell.rule) await saveTariffRule(cell.rule.id, input)
      else await addTariffRule(input)
      await loadListino()
      message = 'Prezzo salvato'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore salvataggio prezzo.'
    } finally {
      saving = false
    }
  }

  const saveTariffPriceInline = async (rule: TariffRule, rawValue: string) => {
    const amountCents = parseEuroToCents(rawValue)
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      error = 'Prezzo non valido.'
      return
    }

    saving = true
    message = null
    error = null
    try {
      await saveTariffRule(rule.id, {
        name: rule.name,
        itemType: rule.itemType,
        rowLabel: rule.rowLabel,
        reservationType: rule.reservationType,
        amountCents,
        priority: rule.priority,
        notes: rule.notes,
      })
      await loadListino()
      message = 'Tariffa aggiornata'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore salvataggio tariffa.'
    } finally {
      saving = false
    }
  }

  const startNewArticle = (asIncluded = false) => {
    activeTab = 'items'
    selectedArticle = null
    selectedRule = null
    detailMode = 'article'
    articleName = asIncluded ? 'Nuova dotazione' : 'Nuovo articolo'
    articleCategory = asIncluded ? 'Dotazioni incluse' : 'Extra'
    articleUnit = 'pz'
    articleAmount = asIncluded ? '0,00' : ''
    articleMaxQuantity = asIncluded ? 1 : 2
    articleIncludedQuantity = asIncluded ? 1 : 0
    articleNotes = ''
  }

  const editArticle = (article: ExtraItemCatalogEntry) => {
    activeTab = 'items'
    selectedArticle = article
    selectedRule = null
    detailMode = 'article'
    articleName = article.name
    articleCategory = article.category ?? ''
    articleUnit = article.unitLabel
    articleAmount = moneyInputValue(article.defaultAmountCents)
    articleMaxQuantity = article.maxQuantityPerBooking
    articleIncludedQuantity = article.includedQuantityDefault
    articleNotes = article.notes ?? ''
  }

  const saveArticle = async () => {
    const amountCents = parseEuroToCents(articleAmount)
    if (!articleName.trim() || !Number.isFinite(amountCents) || amountCents < 0) {
      error = 'Nome o prezzo articolo non valido.'
      return
    }

    saving = true
    message = null
    error = null
    const input: ExtraItemCatalogInput = {
      name: articleName,
      category: articleCategory,
      unitLabel: articleUnit,
      defaultAmountCents: amountCents,
      maxQuantityPerBooking: articleMaxQuantity,
      includedQuantityDefault: articleIncludedQuantity,
      sortOrder: selectedArticle?.sortOrder ?? articles.length * 10 + 10,
      notes: articleNotes,
    }
    try {
      await saveExtraItemCatalogEntry(input, selectedArticle?.id)
      await loadListino()
      clearSelection()
      message = articleIncludedQuantity > 0 ? 'Dotazione salvata' : 'Articolo salvato'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore salvataggio articolo.'
    } finally {
      saving = false
    }
  }

  const saveArticleInline = async (
    article: ExtraItemCatalogEntry,
    patch: Partial<ExtraItemCatalogInput>,
    successMessage: string,
  ) => {
    saving = true
    message = null
    error = null
    try {
      await saveExtraItemCatalogEntry({
        name: article.name,
        category: article.category,
        unitLabel: article.unitLabel,
        defaultAmountCents: article.defaultAmountCents,
        maxQuantityPerBooking: article.maxQuantityPerBooking,
        includedQuantityDefault: article.includedQuantityDefault,
        sortOrder: article.sortOrder,
        notes: article.notes,
        ...patch,
      }, article.id)
      await loadListino()
      message = successMessage
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore salvataggio voce.'
    } finally {
      saving = false
    }
  }

  const saveArticlePriceInline = async (article: ExtraItemCatalogEntry, value: string) => {
    const amountCents = parseEuroToCents(value)
    if (!Number.isFinite(amountCents) || amountCents < 0) {
      error = 'Prezzo non valido.'
      return
    }
    await saveArticleInline(article, { defaultAmountCents: amountCents }, 'Prezzo salvato')
  }

  const saveArticleNumberInline = async (
    article: ExtraItemCatalogEntry,
    field: 'maxQuantityPerBooking' | 'includedQuantityDefault',
    value: string,
  ) => {
    const quantity = Math.max(0, Math.round(Number(value)))
    if (!Number.isFinite(quantity)) {
      error = 'Quantita non valida.'
      return
    }
    await saveArticleInline(article, { [field]: quantity }, 'Quantita salvata')
  }

  const getEnabledSeatCount = (rowId: string, total: number) => enabledSeatOverrides[rowId] ?? total
  const getSeatOverrideKey = (itemType: TariffItemType, rowId: string) => `${itemType}:${rowId}`
  const getEnabledSeatCountForItem = (itemType: TariffItemType, rowId: string, total: number) =>
    enabledSeatOverrides[getSeatOverrideKey(itemType, rowId)] ?? total
  const openEnabledCell = (rowId: string, total: number) => {
    if (rowId === 'all') return
    editingEnabledRowId = rowId
    editingEnabledDraft = String(getEnabledSeatCountForItem(activePriceItemType, rowId, total))
  }
  const saveEnabledCell = (rowId: string, total: number, rawValue: string) => {
    editingEnabledRowId = null
    const quantity = Math.max(0, Math.min(total, Math.round(Number(rawValue))))
    if (!Number.isFinite(quantity)) {
      error = 'Quantita non valida.'
      return
    }
    enabledSeatOverrides = { ...enabledSeatOverrides, [getSeatOverrideKey(activePriceItemType, rowId)]: quantity }
    try {
      localStorage.setItem(enabledSeatsStorageKey, JSON.stringify(enabledSeatOverrides))
    } catch {
      // Non-critical: prices still persist through the tariff service.
    }
    message = 'Posti abilitati aggiornati'
    error = null
  }
  const getInventoryTotal = (itemId: string, fallback: number | null) => inventoryOverrides[itemId] ?? fallback
  const getOffBeachCount = (inBeach: number, total: number | null) => total === null ? null : Math.max(0, total - inBeach)
  const openStockCell = (item: ListinoCatalogItem) => {
    editingStockItemId = item.id
    editingStockDraft = String(item.totalInventory ?? item.inBeach)
  }
  const saveStockCell = (item: ListinoCatalogItem, rawValue: string) => {
    editingStockItemId = null
    const quantity = Math.max(item.inBeach, Math.round(Number(rawValue)))
    if (!Number.isFinite(quantity)) {
      error = 'Totale inventario non valido.'
      return
    }
    inventoryOverrides = { ...inventoryOverrides, [item.id]: quantity }
    try {
      localStorage.setItem(inventoryStorageKey, JSON.stringify(inventoryOverrides))
    } catch {
      // Non-critical: stock overrides are presentational until inventory persistence exists.
    }
    message = 'Inventario aggiornato'
    error = null
  }

  const archiveArticle = async () => {
    if (!selectedArticle) return
    saving = true
    message = null
    error = null
    try {
      await removeExtraItemCatalogEntry(selectedArticle.id)
      await loadListino()
      clearSelection()
      message = 'Voce disattivata'
    } catch (archiveError) {
      error = archiveError instanceof Error ? archiveError.message : 'Errore disattivazione articolo.'
    } finally {
      saving = false
    }
  }

  const uniqueArticles = $derived.by(() => {
    const byName = new Map<string, ArticleCatalogRow>()
    for (const article of articles) {
      const key = normalizeCatalogKey(article.name)
      const existing = byName.get(key)
      if (!existing) {
        byName.set(key, { ...article, duplicateCount: 1 })
        continue
      }
      const preferred = article.defaultAmountCents > existing.defaultAmountCents || article.updatedAt > existing.updatedAt
        ? { ...article, duplicateCount: existing.duplicateCount + 1 }
        : { ...existing, duplicateCount: existing.duplicateCount + 1 }
      byName.set(key, preferred)
    }
    return [...byName.values()].toSorted((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
  })
  const layoutPricingRows = $derived(derivePricingRowsFromActiveLayout(items))
  const pricingRows = $derived.by(() => {
    const rows = [...layoutPricingRows]
    for (const rule of rules) {
      if (!rule.rowLabel) continue
      const resolved = getPricingRowForTariffLabel(rule.rowLabel, rows)
      if (!rows.some((row) => row.id === resolved.id || row.sourceRowLabels.includes(rule.rowLabel ?? ''))) {
        rows.push(resolved)
      }
    }
    return rows.toSorted((a, b) => {
      if (a.rowNumber === null) return -1
      if (b.rowNumber === null) return 1
      return a.rowNumber - b.rowNumber
    })
  })
  const placeCards = $derived(itemTypeOptions.map((option) => {
    const activeRows = pricingRows.filter((row) => row.id !== 'all' && row.activeInLayout && row.itemCounts[option.value] > 0)
    const totalSeats = activeRows.reduce((total, row) => total + row.itemCounts[option.value], 0)
    const enabledSeats = activeRows.reduce(
      (total, row) => total + getEnabledSeatCountForItem(option.value, row.id, row.itemCounts[option.value]),
      0,
    )
    return {
      ...option,
      totalSeats,
      enabledSeats,
      activeRows: activeRows.length,
    }
  }))
  const activePlaceCard = $derived(placeCards.find((card) => card.value === activePriceItemType) ?? {
    ...itemTypeOptions[0],
    totalSeats: 0,
    enabledSeats: 0,
    activeRows: 0,
  })
  const getDisplayRowLabel = (rowLabel: string | null | undefined) => getPricingRowForTariffLabel(rowLabel, pricingRows).label
  const getRuleForGridCell = (rowLabel: string | null, reservationType: TariffReservationType) => rules
    .filter((rule) => rule.itemType === activePriceItemType && rule.reservationType === reservationType)
    .find((rule) => (rowLabel ? rule.rowLabel === rowLabel : !rule.rowLabel)) ?? null
  const priceGridRows = $derived.by(() => {
    const fallbackByReservation = new Map<TariffReservationType, TariffRule | null>(
      reservationTypeOptions.map((option) => [option.value, getRuleForGridCell(null, option.value)]),
    )
    return pricingRows.map((row) => ({
      row,
      cells: reservationTypeOptions.map((option): PriceGridCell => {
        const sourceRowLabel = row.sourceRowLabel
        const rule = getRuleForGridCell(sourceRowLabel, option.value)
        return {
          id: `${row.id}-${option.value}`,
          rowLabel: sourceRowLabel,
          displayRowLabel: row.label,
          reservationType: option.value,
          rule,
          inheritedRule: row.id === 'all' ? null : fallbackByReservation.get(option.value) ?? null,
          status: !row.activeInLayout ? 'Non nel layout' : rule ? 'Attiva' : row.id === 'all' ? 'Vuota' : fallbackByReservation.get(option.value) ? 'Fallback' : 'Vuota',
        }
      }),
    }))
  })
  const visiblePriceGridRows = $derived(
    priceGridRows.filter((row) => {
      if (priceFilter === 'priced' && !row.cells.some((cell) => cell.rule || cell.inheritedRule)) return false
      if (priceFilter === 'empty' && row.cells.some((cell) => cell.rule || cell.inheritedRule)) return false
      if (!showEmptyRows && row.row.id !== 'all' && row.row.itemCounts[activePriceItemType] === 0) return false
      if (statusFilter === 'active' && !row.row.activeInLayout) return false
      if (statusFilter === 'inactive' && row.row.activeInLayout) return false
      if (!normalizedQuery) return true
      return [row.row.label, beachTypeLabels[activePriceItemType], ...row.cells.map((cell) => reservationTypeLabels[cell.reservationType])]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    }),
  )

  const catalogRows = $derived.by<CatalogRow[]>(() => [
    ...rules.map((rule) => ({
      id: `tariff-${rule.id}`,
      sourceId: rule.id,
      source: 'tariff' as const,
      type: 'Tariffa posto' as const,
      name: rule.name,
      element: beachTypeLabels[rule.itemType],
      period: reservationTypeLabels[rule.reservationType],
      category: getDisplayRowLabel(rule.rowLabel),
      amountCents: rule.amountCents,
      status: rule.active ? 'Attiva' : 'Disattivata',
      usage: 'Conto automatico',
      quantity: '1 regola',
      notes: rule.notes ?? '',
      updatedAt: rule.updatedAt,
      tariff: rule,
    })),
    ...uniqueArticles.map((article) => {
      const included = article.includedQuantityDefault > 0
      return {
        id: `article-${article.id}`,
        sourceId: article.id,
        source: 'article' as const,
        type: included ? 'Dotazione inclusa' as const : 'Articolo extra' as const,
        name: article.name,
        element: article.unitLabel,
        period: 'Sempre',
        category: article.category || (included ? 'Dotazioni incluse' : 'Extra'),
        amountCents: article.defaultAmountCents,
        status: article.active ? 'Attiva' : 'Disattivata',
        usage: included ? 'Inclusa di default' : 'Disponibile in prenotazione',
        quantity: included ? `${article.includedQuantityDefault}/${article.maxQuantityPerBooking}` : `${article.maxQuantityPerBooking} max`,
        notes: article.duplicateCount > 1 ? `${article.duplicateCount} voci storiche aggregate` : article.notes ?? '',
        updatedAt: article.updatedAt,
        article,
      }
    }),
  ])

  const itemRows = $derived(catalogRows.filter((row) => row.source === 'article'))
  const categoryOptions = $derived.by(() => {
    const categories = new Set(itemRows.map((row) => row.category).filter(Boolean))
    return [...categories].toSorted((a, b) => a.localeCompare(b))
  })

  const normalizedQuery = $derived(query.trim().toLowerCase())
  const filteredRows = $derived(
    itemRows.filter((row) => {
      if (categoryFilter !== 'all' && row.category !== categoryFilter) return false
      if (priceFilter === 'priced' && row.amountCents <= 0) return false
      if (priceFilter === 'empty' && row.amountCents > 0) return false
      if (statusFilter === 'active' && row.status !== 'Attiva') return false
      if (statusFilter === 'inactive' && row.status === 'Attiva') return false
      if (!normalizedQuery) return true
      return [row.name, row.type, row.element, row.category, row.period, row.usage]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    }),
  )
  const listinoCatalogItems = $derived.by<ListinoCatalogItem[]>(() => {
    const placeItems = itemTypeOptions.map((option) => {
      const itemRules = rules.filter((rule) => rule.itemType === option.value)
      const dailyRule = getRuleAmount(itemRules, 'daily')
      const seasonalRule = getRuleAmount(itemRules, 'seasonal')
      const card = placeCards.find((entry) => entry.value === option.value)
      const inBeach = card?.totalSeats ?? 0
      const totalInventory = getInventoryTotal(`place:${option.value}`, inBeach)
      return {
        id: `place:${option.value}`,
        name: option.label,
        family: 'Posti spiaggia',
        roles: ['Posto prenotabile'],
        roleKeys: ['places'],
        period: itemRules.some((rule) => rule.reservationType === 'daily') && itemRules.some((rule) => rule.reservationType === 'seasonal')
          ? 'Giornaliero + Stagionale'
          : itemRules.some((rule) => rule.reservationType === 'seasonal') ? 'Stagionale' : 'Giornaliero',
        priceSummary: `${compactPrice(dailyRule?.amountCents ?? 0)} giorno · stagionale ${compactPrice(seasonalRule?.amountCents ?? 0)}`,
        ruleSummary: `${card?.activeRows ?? 0} file attive · ${itemRules.length} regole`,
        quantitySummary: `${card?.totalSeats ?? 0} posti`,
        status: itemRules.some((rule) => rule.active) ? 'Attivo' : 'Da configurare',
        inBeach,
        totalInventory,
        offBeach: getOffBeachCount(inBeach, totalInventory),
        dailyRule,
        seasonalRule,
        extraAmountCents: null,
        maxPerBooking: null,
        asset: getAssetById(placeAssetIds[option.value]),
        itemType: option.value,
        rules: itemRules,
      } satisfies ListinoCatalogItem
    })

    const articleItems = uniqueArticles.map((article) => {
      const included = article.includedQuantityDefault > 0
      const paidExtra = article.defaultAmountCents > 0
      const inBeach = 0
      const totalInventory = getInventoryTotal(`article:${article.id}`, null)
      const roles = [
        included ? 'Dotazione inclusa' : null,
        paidExtra ? 'Extra a pagamento' : null,
        !included && !paidExtra ? 'Servizio' : null,
      ].filter(Boolean) as string[]
      const roleKeys = [
        included ? 'included' : null,
        paidExtra ? 'extra' : null,
        !included && !paidExtra ? 'services' : null,
      ].filter(Boolean) as CatalogRoleFilter[]
      return {
        id: `article:${article.id}`,
        name: article.name,
        family: article.category || 'Dotazioni e servizi',
        roles,
        roleKeys,
        period: 'Sempre',
        priceSummary: `${compactPrice(article.defaultAmountCents)} unità · max ${article.maxQuantityPerBooking}`,
        ruleSummary: included ? `${article.includedQuantityDefault} incluso · max ${article.maxQuantityPerBooking}` : `max ${article.maxQuantityPerBooking} per prenotazione`,
        quantitySummary: article.maxQuantityPerBooking ? `${article.maxQuantityPerBooking} max` : '—',
        status: article.active ? 'Attivo' : 'Disattivato',
        inBeach,
        totalInventory,
        offBeach: getOffBeachCount(inBeach, totalInventory),
        dailyRule: null,
        seasonalRule: null,
        extraAmountCents: article.defaultAmountCents,
        maxPerBooking: article.maxQuantityPerBooking,
        asset: getArticleAsset(article),
        article,
        rules: [],
      } satisfies ListinoCatalogItem
    })

    return [...placeItems, ...articleItems]
  })
  const catalogFamilyOptions = $derived.by(() => {
    const families = new Set(listinoCatalogItems.map((item) => item.family).filter(Boolean))
    return [...families].toSorted((a, b) => a.localeCompare(b))
  })
  const filteredCatalogItems = $derived(
    listinoCatalogItems.filter((item) => {
      if (categoryFilter !== 'all' && item.family !== categoryFilter) return false
      if (roleFilter !== 'all' && roleFilter !== 'inactive' && !item.roleKeys.includes(roleFilter)) return false
      if (roleFilter === 'inactive' && item.status === 'Attivo') return false
      if (periodFilter !== 'all' && !item.rules.some((rule) => rule.reservationType === periodFilter)) return false
      if (statusFilter === 'active' && item.status === 'Disattivato') return false
      if (statusFilter === 'inactive' && item.status !== 'Disattivato') return false
      if (!normalizedQuery) return true
      return [item.name, item.family, item.roles.join(' '), item.period, item.priceSummary]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    }),
  )
  const selectedCatalogItem = $derived(
    listinoCatalogItems.find((item) => item.id === selectedCatalogItemId)
      ?? filteredCatalogItems[0]
      ?? listinoCatalogItems[0],
  )
  const listinoStats = $derived.by(() => ({
    visibleCount: filteredCatalogItems.length,
    activeCount: listinoCatalogItems.filter((item) => item.status === 'Attivo').length,
    placePricedCount: listinoCatalogItems.filter((item) => item.roleKeys.includes('places') && item.rules.length > 0).length,
    extraCount: listinoCatalogItems.filter((item) => item.roleKeys.includes('extra') && item.status === 'Attivo').length,
    incompleteCount: listinoCatalogItems.filter((item) => item.status !== 'Attivo' || item.priceSummary.includes('—')).length,
  }))
  const primaryActionLabel = 'Nuovo articolo'
  const inspectorTypeLabel = $derived(getInspectorTypeLabel(detailMode, articleIncludedQuantity))
  const startPrimaryAction = () => {
    startNewArticle(false)
  }
  const selectCatalogItem = (item: ListinoCatalogItem) => {
    selectedCatalogItemId = item.id
    if (item.itemType) {
      activePriceItemType = item.itemType
      activeTab = 'places'
      clearSelection()
      return
    }
    if (item.article) editArticle(item.article)
  }
  const openRow = (row: CatalogRow) => {
    if (row.tariff) editTariff(row.tariff)
    if (row.article) editArticle(row.article)
  }
  const openPriceCell = (cell: PriceGridCell) => {
    editingPriceCellId = cell.id
    editingPriceDraft = moneyInputValue(cell.rule?.amountCents ?? cell.inheritedRule?.amountCents ?? 0)
  }

  onMount(() => {
    try {
      const saved = localStorage.getItem(enabledSeatsStorageKey)
      if (saved) enabledSeatOverrides = JSON.parse(saved) as Record<string, number>
    } catch {
      enabledSeatOverrides = {}
    }
    try {
      const savedInventory = localStorage.getItem(inventoryStorageKey)
      if (savedInventory) inventoryOverrides = JSON.parse(savedInventory) as Record<string, number>
    } catch {
      inventoryOverrides = {}
    }
    loadListino().catch(() => {
      error = 'Errore caricamento listino.'
    })
  })
</script>

<section class="settings-panel listino-panel" aria-label="Listino">
  <div class="settings-view-header settings-panel__header listino-topbar">
    <h2>Listino</h2>
    <span class="settings-toolbar-count">{catalogRows.length} voci</span>
  </div>

  <section class="listino-catalog-shell" aria-label="Catalogo gestionale listino">
    <div class="listino-catalog-toolbar">
      <label class="listino-catalog-search">
        <span>Cerca</span>
        <input bind:value={query} placeholder="Cerca" />
      </label>
      <label>
        <span>Famiglia</span>
        <select bind:value={categoryFilter}>
          <option value="all">Tutti</option>
          {#each catalogFamilyOptions as family}
            <option value={family}>{family}</option>
          {/each}
        </select>
      </label>
      <label>
        <span>Ruolo</span>
        <select bind:value={roleFilter}>
          <option value="all">Tutti</option>
          <option value="places">Prenotabili</option>
          <option value="extra">Extra</option>
          <option value="included">Inclusi</option>
          <option value="services">Servizi</option>
        </select>
      </label>
      <label>
        <span>Stato</span>
        <select bind:value={statusFilter}>
          <option value="active">Attivi</option>
          <option value="inactive">Disattivati</option>
          <option value="all">Tutti</option>
        </select>
      </label>
      <button type="button" class="button-primary" onclick={startPrimaryAction}>Nuovo articolo</button>
    </div>

    <div class="listino-catalog-layout">
      <aside class="listino-catalog-list" aria-label="Articoli listino">
        <div class="listino-inventory-matrix__head" aria-hidden="true">
          <span>Articolo</span>
          <span>In spiaggia / Totale</span>
          <span>Fuori</span>
          <span>Giornaliero</span>
          <span>Stagionale</span>
          <span>Extra</span>
          <span>Regole</span>
          <span>Stato</span>
        </div>
        <div class="listino-catalog-list__body">
          {#each filteredCatalogItems as item (item.id)}
            <div class="listino-inventory-row" class:active={selectedCatalogItem?.id === item.id}>
              <button type="button" class="listino-inventory-row__article" onclick={() => selectCatalogItem(item)}>
                <span class="listino-inventory-thumb" aria-hidden="true">
                  {#if item.asset}
                    <img src={item.asset.previewUrl} alt="" loading="lazy" />
                  {:else}
                    <span>{item.name.slice(0, 1)}</span>
                  {/if}
                </span>
                <span class="listino-inventory-copy">
                  <strong>{item.name}</strong>
                  <small>{item.family}</small>
                </span>
              </button>
              <span class="listino-inventory-cell listino-inventory-stock">
                <b>{item.inBeach}</b>
                <span>/</span>
                {#if editingStockItemId === item.id}
                  <input
                    type="number"
                    min={item.inBeach}
                    value={editingStockDraft}
                    oninput={(event) => (editingStockDraft = event.currentTarget.value)}
                    onblur={() => saveStockCell(item, editingStockDraft)}
                    onkeydown={(event) => {
                      if (event.key === 'Enter') event.currentTarget.blur()
                      if (event.key === 'Escape') editingStockItemId = null
                    }}
                  />
                {:else}
                  <button type="button" onclick={() => openStockCell(item)}>{item.totalInventory ?? '—'}</button>
                {/if}
              </span>
              <span class="listino-inventory-cell">{item.offBeach ?? '—'}</span>
              <span class="listino-inventory-cell">
                {#if item.dailyRule}
                  <input
                    value={moneyInputValue(item.dailyRule.amountCents)}
                    inputmode="decimal"
                    onblur={(event) => saveTariffPriceInline(item.dailyRule!, event.currentTarget.value)}
                    onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                  />
                {:else}
                  —
                {/if}
              </span>
              <span class="listino-inventory-cell">
                {#if item.seasonalRule}
                  <input
                    value={moneyInputValue(item.seasonalRule.amountCents)}
                    inputmode="decimal"
                    onblur={(event) => saveTariffPriceInline(item.seasonalRule!, event.currentTarget.value)}
                    onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                  />
                {:else}
                  —
                {/if}
              </span>
              <span class="listino-inventory-cell">
                {#if item.article}
                  <input
                    value={moneyInputValue(item.article.defaultAmountCents)}
                    inputmode="decimal"
                    onblur={(event) => saveArticlePriceInline(item.article!, event.currentTarget.value)}
                    onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                  />
                {:else}
                  —
                {/if}
              </span>
              <span class="listino-inventory-cell">{item.maxPerBooking ? `Max ${item.maxPerBooking}` : item.ruleSummary}</span>
              <span class="listino-inventory-cell">{item.status}</span>
            </div>
          {:else}
            <p class="empty-customer">Nessun articolo trovato.</p>
          {/each}
        </div>
      </aside>

      <section class="listino-catalog-detail" aria-label="Scheda articolo">
        {#if selectedCatalogItem}
          <header class="listino-catalog-detail__header">
            <div class="listino-detail-identity">
              <span>{selectedCatalogItem.family}</span>
              <h3>{selectedCatalogItem.name}</h3>
              <p>{joinRoles(selectedCatalogItem.roles)} · {selectedCatalogItem.inBeach} in spiaggia · totale {selectedCatalogItem.totalInventory ?? 'da definire'} · fuori {selectedCatalogItem.offBeach ?? '—'}</p>
            </div>
            <figure class="listino-detail-asset" aria-label="Anteprima asset">
              {#if selectedCatalogItem.asset}
                <img src={selectedCatalogItem.asset.previewUrl} alt={selectedCatalogItem.asset.label} loading="lazy" />
              {:else}
                <span>{selectedCatalogItem.name.slice(0, 1)}</span>
              {/if}
            </figure>
            <div class="listino-detail-actions">
              {#if selectedCatalogItem.article}
                <button type="button" class="button-primary" disabled={saving} onclick={saveArticle}>Salva modifiche</button>
                <button type="button" class="button-secondary" disabled={saving} onclick={() => startNewArticle(articleIncludedQuantity > 0)}>Duplica</button>
                <button type="button" class="button-secondary" disabled={saving} onclick={archiveArticle}>Disattiva</button>
              {:else}
                <button type="button" class="button-primary" onclick={() => startNewTariff()}>Aggiungi tariffa</button>
                <button type="button" class="button-secondary" onclick={() => { priceFilter = 'all'; statusFilter = 'active' }}>Reimposta prezzi</button>
              {/if}
            </div>
          </header>

          <section class="listino-detail-section listino-asset-panel">
            <h4>Asset visuale</h4>
            {#if selectedCatalogItem.asset}
              <div class="listino-asset-summary">
                <img src={selectedCatalogItem.asset.previewUrl} alt={selectedCatalogItem.asset.label} loading="lazy" />
                <div>
                  <strong>{selectedCatalogItem.asset.label}</strong>
                  <span>{selectedCatalogItem.asset.defaultWidthM}m x {selectedCatalogItem.asset.defaultHeightM}m · {selectedCatalogItem.asset.collisionShape}</span>
                  <span>{formatAssetSource(selectedCatalogItem.asset.source)} · {selectedCatalogItem.asset.license}</span>
                </div>
              </div>
            {:else}
              <div class="listino-asset-summary listino-asset-summary--empty">
                <span>{selectedCatalogItem.name.slice(0, 1)}</span>
                <div>
                  <strong>Asset da collegare</strong>
                  <span>Nessuna variante visuale associata a questo articolo.</span>
                </div>
              </div>
            {/if}
          </section>

          <section class="listino-detail-section">
            <h4>Identità</h4>
            {#if selectedCatalogItem.article}
              <label>Nome articolo<input bind:value={articleName} /></label>
              <label>Famiglia<input bind:value={articleCategory} /></label>
            {:else}
              <label>Nome articolo<input value={selectedCatalogItem.name} disabled /></label>
              <label>Famiglia<input value={selectedCatalogItem.family} disabled /></label>
            {/if}
            <label>Stato<input value={selectedCatalogItem.status} disabled /></label>
          </section>

          <section class="listino-detail-section">
            <h4>Uso operativo</h4>
            <div class="listino-role-lines">
              <span>{selectedCatalogItem.roleKeys.includes('places') ? '✓' : '–'} Posto prenotabile</span>
              <span>{selectedCatalogItem.roleKeys.includes('included') ? '✓' : '–'} Dotazione inclusa</span>
              <span>{selectedCatalogItem.roleKeys.includes('extra') ? '✓' : '–'} Extra a pagamento</span>
            </div>
          </section>

          {#if selectedCatalogItem.itemType}
            <section class="listino-detail-section listino-tariff-matrix-section">
              <div class="listino-section-heading">
                <h4>Tariffe posto</h4>
                <button type="button" class="button-secondary" onclick={() => startNewTariff()}>Aggiungi tariffa</button>
              </div>
              <div class="listino-tariff-matrix">
                <div class="listino-tariff-matrix__head">
                  <span>Periodo</span>
                  <span>Ambito</span>
                  <span>Prezzo</span>
                  <span>Stato</span>
                </div>
                {#each selectedCatalogItem.rules.toSorted((a, b) => a.reservationType.localeCompare(b.reservationType) || getDisplayRowLabel(a.rowLabel).localeCompare(getDisplayRowLabel(b.rowLabel))) as rule (rule.id)}
                  <div class="listino-tariff-row">
                    <span>{reservationTypeLabels[rule.reservationType]}</span>
                    <span>{rule.rowLabel ? getDisplayRowLabel(rule.rowLabel) : 'Tutte le file'}</span>
                    <input
                      value={moneyInputValue(rule.amountCents)}
                      inputmode="decimal"
                      onblur={(event) => saveTariffPriceInline(rule, event.currentTarget.value)}
                      onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                    />
                    <span>{rule.active ? 'Attiva' : 'Disattivata'}</span>
                  </div>
                {:else}
                  <p class="empty-customer">Nessuna tariffa configurata.</p>
                {/each}
              </div>
            </section>
          {:else if selectedCatalogItem.article}
            <section class="listino-detail-section">
              <h4>Prezzo</h4>
              <label>Prezzo extra unitario<input bind:value={articleAmount} inputmode="decimal" /></label>
              <label>Unità<input bind:value={articleUnit} /></label>
            </section>
          {/if}

          <section class="listino-detail-section">
            <h4>Inventario</h4>
            <label>In spiaggia<input value={selectedCatalogItem.inBeach} disabled /></label>
            <label>Totale disponibile<input value={selectedCatalogItem.totalInventory ?? 'Da definire'} disabled /></label>
            <label>Fuori spiaggia<input value={selectedCatalogItem.offBeach ?? '—'} disabled /></label>
          </section>

          <section class="listino-detail-section">
            <h4>Regole</h4>
            {#if selectedCatalogItem.itemType}
              <label>Categoria / fila / zona<input value={selectedCatalogItem.ruleSummary} disabled /></label>
              <label>Quantità<input value={selectedCatalogItem.quantitySummary} disabled /></label>
            {:else if selectedCatalogItem.article}
              <label>Quantità inclusa<input type="number" min="0" bind:value={articleIncludedQuantity} /></label>
              <label>Quantità massima prenotazione<input type="number" min="1" bind:value={articleMaxQuantity} /></label>
            {/if}
          </section>

          <section class="listino-detail-section">
            <h4>Collegamento conto</h4>
            <label>Usa nel conto automatico<input value={selectedCatalogItem.roleKeys.includes('places') ? 'Si' : 'No'} disabled /></label>
            <label>Modifica manuale nel conto<input value="Consentita" disabled /></label>
          </section>

        {/if}
      </section>
    </div>
  </section>

  <div class="listino-command-band">
    <div class="listino-tabs" role="tablist" aria-label="Viste catalogo">
      <button type="button" class:active={activeTab === 'places'} onclick={() => selectTab('places')}>Schede posto</button>
      <button type="button" class:active={activeTab === 'items'} onclick={() => selectTab('items')}>Dotazioni e servizi</button>
    </div>
    <div class="listino-actions-bar">
      <button type="button" class="button-secondary listino-sync-action" title="Sincronizza posti e dotazioni dal layout attivo" onclick={syncPricingGrid}>
        Sincronizza layout
      </button>
      <button type="button" class="button-primary listino-primary-action" onclick={startPrimaryAction}>
        {primaryActionLabel}
      </button>
    </div>
  </div>

  {#if activeTab === 'items'}
    <section class="listino-control-plane listino-control-plane--items" aria-label="Controlli dotazioni e servizi">
      <div class="listino-control-grid">
        <label class="listino-control-field">
          <span>Categoria</span>
          <select bind:value={categoryFilter}>
            <option value="all">Tutte</option>
            {#each categoryOptions as category}
              <option value={category}>{category}</option>
            {/each}
          </select>
        </label>
        <label class="listino-control-field">
          <span>Prezzo</span>
          <select bind:value={priceFilter}>
            <option value="all">Tutti</option>
            <option value="priced">Con prezzo</option>
            <option value="empty">Senza prezzo</option>
          </select>
        </label>
        <label class="listino-control-field">
          <span>Stato</span>
          <select bind:value={statusFilter}>
            <option value="active">Attive</option>
            <option value="inactive">Disattivate</option>
            <option value="all">Tutte</option>
          </select>
        </label>
        <label class="listino-control-field">
          <span>Ambito</span>
          <select disabled>
            <option>Dotazioni e servizi</option>
          </select>
        </label>
      </div>

      <div class="listino-control-plane__foot">
        <label class="listino-search">
          <span>Cerca</span>
          <input bind:value={query} placeholder="Cerca" />
        </label>
      </div>
    </section>
  {/if}

  <div class="listino-workbench">
    {#if activeTab === 'places'}
      <div class="listino-sheet-layout">
        <aside class="listino-sheet-rail" aria-label="Schede posto">
          <div class="listino-sheet-rail__title">Schede posto</div>
          {#each placeCards as card (card.value)}
            <button
              type="button"
              class:active={activePriceItemType === card.value}
              onclick={() => {
                activePriceItemType = card.value
                clearSelection()
              }}
            >
              <strong>{card.label}</strong>
              <span>{card.totalSeats} posti · {card.activeRows} file attive</span>
            </button>
          {/each}
        </aside>

        <section class="listino-article-sheet" aria-label="Scheda articolo listino">
          <header class="listino-article-sheet__header">
            <div>
              <h3>{activePlaceCard.label}</h3>
              <p>{activePlaceCard.totalSeats} posti totali · {activePlaceCard.enabledSeats} abilitati · {activePlaceCard.activeRows} file attive</p>
            </div>
            <div class="listino-article-sheet__actions">
              <button type="button" class="button-secondary" onclick={syncPricingGrid}>Sincronizza layout</button>
              <button type="button" class="button-secondary" onclick={() => { priceFilter = 'all'; statusFilter = 'active' }}>Reimposta prezzi</button>
              <button type="button" class="button-primary" onclick={() => startNewTariff()}>Nuova regola</button>
            </div>
          </header>

          <section class="listino-price-grid listino-place-card" aria-label="Matrice prezzi scheda posto">
            <div class="listino-price-grid__head" aria-hidden="true">
              <span>Fila</span>
              <span>Totali</span>
              <span>Abilitati</span>
              <span>Giornaliero</span>
              <span>Stagionale</span>
              <span>Stato</span>
            </div>
            <div class="listino-price-grid__body">
              {#each visiblePriceGridRows as row (row.row.id)}
                <div class="listino-price-row">
                  <strong>{row.row.id === 'all' ? 'Tutte' : row.row.label}</strong>
                  <span>{row.row.id === 'all' ? '—' : row.row.itemCounts[activePriceItemType]}</span>
                  {#if row.row.id === 'all'}
                    <span>—</span>
                  {:else if editingEnabledRowId === row.row.id}
                    <input
                      class="listino-inline-number"
                      type="number"
                      min="0"
                      max={row.row.itemCounts[activePriceItemType]}
                      value={editingEnabledDraft}
                      oninput={(event) => (editingEnabledDraft = event.currentTarget.value)}
                      onblur={() => saveEnabledCell(row.row.id, row.row.itemCounts[activePriceItemType], editingEnabledDraft)}
                      onkeydown={(event) => {
                        if (event.key === 'Enter') event.currentTarget.blur()
                        if (event.key === 'Escape') editingEnabledRowId = null
                      }}
                    />
                  {:else}
                    <button
                      type="button"
                      class="listino-inline-quantity"
                      onclick={() => openEnabledCell(row.row.id, row.row.itemCounts[activePriceItemType])}
                    >
                      {getEnabledSeatCountForItem(activePriceItemType, row.row.id, row.row.itemCounts[activePriceItemType])} / {row.row.itemCounts[activePriceItemType]}
                    </button>
                  {/if}
                  {#each row.cells as cell (cell.id)}
                    {#if editingPriceCellId === cell.id}
                      <input
                        class="listino-inline-price"
                        value={editingPriceDraft}
                        inputmode="decimal"
                        oninput={(event) => (editingPriceDraft = event.currentTarget.value)}
                        onblur={() => savePriceCell(cell, editingPriceDraft)}
                        onkeydown={(event) => {
                          if (event.key === 'Enter') event.currentTarget.blur()
                          if (event.key === 'Escape') editingPriceCellId = null
                        }}
                      />
                    {:else}
                      <button type="button" class:empty={!cell.rule} class:fallback={!cell.rule && cell.inheritedRule} onclick={() => openPriceCell(cell)}>
                        {#if cell.rule}
                          {formatEuroFromCents(cell.rule.amountCents)}
                        {:else if cell.inheritedRule}
                          {formatEuroFromCents(cell.inheritedRule.amountCents)}
                        {:else}
                          —
                        {/if}
                      </button>
                    {/if}
                  {/each}
                  <span>{row.row.id === 'all' ? 'Fallback' : row.row.activeInLayout && row.row.itemCounts[activePriceItemType] > 0 ? 'Attiva' : 'Non usata'}</span>
                </div>
              {/each}
            </div>
          </section>

          <label class="listino-empty-toggle">
            <input type="checkbox" bind:checked={showEmptyRows} />
            <span>Mostra file vuote</span>
          </label>

          <section class="listino-attachments" aria-label="Dotazioni della scheda posto">
          <div class="listino-attachments__head">
            <strong>Dotazioni della {activePlaceCard.label}</strong>
          </div>
          <div class="listino-attachments__grid">
            <span>Articolo</span>
            <span>Incluso</span>
            <span>Max extra</span>
            <span>Prezzo extra</span>
          </div>
          {#each uniqueArticles as article (article.id)}
            <div class="listino-attachment-row">
              <strong>{article.name}</strong>
              <input
                class="listino-inline-number"
                type="number"
                min="0"
                value={article.includedQuantityDefault}
                onblur={(event) => saveArticleNumberInline(article, 'includedQuantityDefault', event.currentTarget.value)}
                onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
              />
              <input
                class="listino-inline-number"
                type="number"
                min="0"
                value={article.maxQuantityPerBooking}
                onblur={(event) => saveArticleNumberInline(article, 'maxQuantityPerBooking', event.currentTarget.value)}
                onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
              />
              <input
                class="listino-inline-price"
                value={moneyInputValue(article.defaultAmountCents)}
                inputmode="decimal"
                onblur={(event) => saveArticlePriceInline(article, event.currentTarget.value)}
                onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
              />
            </div>
          {:else}
            <p class="empty-customer">Nessuna dotazione configurata.</p>
          {/each}
          </section>
        </section>
      </div>
    {:else}
      <section class="listino-grid listino-items-grid" aria-label="Dotazioni e servizi listino">
        <div class="listino-grid__head" aria-hidden="true">
          <span>Articolo</span>
          <span>Totali</span>
          <span>Abilitati</span>
          <span>Prezzo extra</span>
          <span>Max prenotazione</span>
          <span>Incluso</span>
          <span>Stato</span>
            </div>
            <div class="listino-list">
              {#each filteredRows as row (row.id)}
                <div class="listino-row" class:active={selectedArticle?.id === row.sourceId}>
                  <span class="listino-row__name">
                    <strong>{row.name}</strong>
                    <small>{row.category}</small>
                  </span>
                  {#if row.article}
                    <em>—</em>
                    <em>{row.article.maxQuantityPerBooking}</em>
                    <input
                      class="listino-inline-price"
                      value={moneyInputValue(row.article.defaultAmountCents)}
                      inputmode="decimal"
                      onblur={(event) => saveArticlePriceInline(row.article!, event.currentTarget.value)}
                      onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                    />
                    <input
                      class="listino-inline-number"
                      type="number"
                      min="0"
                      value={row.article.maxQuantityPerBooking}
                      aria-label="Max per prenotazione"
                      onblur={(event) => saveArticleNumberInline(row.article!, 'maxQuantityPerBooking', event.currentTarget.value)}
                      onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                    />
                    <input
                      class="listino-inline-number"
                      type="number"
                      min="0"
                      value={row.article.includedQuantityDefault}
                      aria-label="Quantita inclusa"
                      onblur={(event) => saveArticleNumberInline(row.article!, 'includedQuantityDefault', event.currentTarget.value)}
                      onkeydown={(event) => { if (event.key === 'Enter') event.currentTarget.blur() }}
                    />
                    <em>{row.status}</em>
                  {/if}
                  {#if row.article}
                    <button type="button" class="button-secondary listino-row-detail" onclick={() => editArticle(row.article!)}>Dettagli</button>
                  {/if}
                </div>
          {:else}
            <p class="empty-customer">Nessuna voce trovata.</p>
          {/each}
        </div>
      </section>
    {/if}

    {#if detailMode !== 'empty'}
    <section class="listino-inspector" aria-label="Dettaglio listino">
      {#if detailMode === 'tariff'}
        <div class="settings-subheader listino-inspector__header">
          <span>{selectedRule ? 'Modifica voce' : 'Nuova voce'}</span>
          <h3>{beachTypeLabels[tariffItemType]} · {getDisplayRowLabel(tariffRowLabel)} · {reservationTypeLabels[tariffReservationType]}</h3>
          <p>Modifica voce</p>
        </div>
        <form class="listino-form" onsubmit={(event) => { event.preventDefault(); saveTariff() }}>
          <label>Nome voce<input bind:value={tariffName} /></label>
          <label>Tipo voce<input value="Tariffa posto" disabled /></label>
          <label>Elemento
            <select bind:value={tariffItemType}>
              {#each itemTypeOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>
          <label>Fila / ambito
            <select bind:value={tariffRowLabel}>
              {#each pricingRows as row}
                <option value={row.sourceRowLabel ?? ''}>{row.label}</option>
              {/each}
            </select>
          </label>
          <label>Periodo
            <select bind:value={tariffReservationType}>
              {#each reservationTypeOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>
          <label>Prezzo<input bind:value={tariffAmount} inputmode="decimal" placeholder="15,00" /></label>
          <label>Attiva / disattivata<input value={selectedRule?.active === false ? 'Disattivata' : 'Attiva'} disabled /></label>
          <label>Override fila<input value={tariffRowLabel ? 'Si' : 'No'} disabled /></label>
          <label>Fallback tutte le file<input value={tariffRowLabel ? 'Usato se questa voce manca' : 'Questa voce e il fallback'} disabled /></label>
          <label>Categoria di applicazione<input value={getDisplayRowLabel(tariffRowLabel)} disabled /></label>
          <label>Note<input bind:value={tariffNotes} /></label>
          <div class="settings-form-actions listino-actions">
            <button type="submit" class="button-primary" disabled={saving}>Salva</button>
            {#if selectedRule}<button type="button" class="button-secondary" disabled={saving} onclick={duplicateTariff}>Duplica</button>{/if}
            {#if selectedRule}<button type="button" class="button-secondary" disabled={saving} onclick={archiveTariff}>Disattiva</button>{/if}
            <button type="button" class="button-secondary" disabled={saving} onclick={clearSelection}>Annulla</button>
          </div>
        </form>
      {:else if detailMode === 'article'}
        <div class="settings-subheader listino-inspector__header">
          <span>{selectedArticle ? 'Modifica voce' : 'Nuova voce'}</span>
          <h3>{articleName || inspectorTypeLabel}</h3>
          <p>Tipo voce: {inspectorTypeLabel}. {articleIncludedQuantity > 0 ? 'Definisce cosa entra gia nella prenotazione.' : 'Disponibile come voce opzionale nel conto prenotazione.'}</p>
        </div>
        <form class="listino-form" onsubmit={(event) => { event.preventDefault(); saveArticle() }}>
          <label>Nome voce<input bind:value={articleName} /></label>
          <label>Tipo voce<input value={inspectorTypeLabel} disabled /></label>
          <label>Elemento<input bind:value={articleUnit} /></label>
          <label>Categoria / fila<input bind:value={articleCategory} placeholder="Arredi, Servizi, Dotazioni incluse" /></label>
          <label>Periodo<input value="Sempre" disabled /></label>
          <label>Prezzo<input bind:value={articleAmount} inputmode="decimal" placeholder="8,00" /></label>
          <label>Attiva / disattivata<input value={selectedArticle?.active === false ? 'Disattivata' : 'Attiva'} disabled /></label>
          <label>Quantita max<input type="number" min="1" bind:value={articleMaxQuantity} /></label>
          <label>Quantita inclusa<input type="number" min="0" bind:value={articleIncludedQuantity} /></label>
          <label>Predefinita<input value={articleIncludedQuantity > 0 ? 'Si' : 'No'} disabled /></label>
          <label>Disponibile nel conto prenotazione<input value="Si" disabled /></label>
          <label>Inclusa nel posto<input value={articleIncludedQuantity > 0 ? 'Si' : 'No'} disabled /></label>
          <label>Note<input bind:value={articleNotes} /></label>
          <div class="settings-form-actions listino-actions">
            <button type="submit" class="button-primary" disabled={saving}>Salva</button>
            {#if selectedArticle}<button type="button" class="button-secondary" disabled={saving} onclick={() => startNewArticle(articleIncludedQuantity > 0)}>Duplica</button>{/if}
            {#if selectedArticle}<button type="button" class="button-secondary" disabled={saving} onclick={archiveArticle}>Disattiva</button>{/if}
            <button type="button" class="button-secondary" disabled={saving} onclick={clearSelection}>Annulla</button>
          </div>
        </form>
      {/if}
    </section>
    {/if}
  </div>

  {#if message}
    <p class="inline-confirmation">{message}</p>
  {/if}
  {#if error}
    <p class="form-error">{error}</p>
  {/if}
</section>
