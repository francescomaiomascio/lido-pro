<script lang="ts">
  import { onMount } from 'svelte'
  import { beachTypeLabels } from '../../lib/format/beachLabels'
  import { formatEuroFromCents, parseEuroToCents } from '../../lib/format/money'
  import { reservationTypeLabels } from '../../lib/format/reservationLabels'
  import { loadExtraItemCatalog, removeExtraItemCatalogEntry, saveExtraItemCatalogEntry } from '../../lib/services/extraItemService'
  import { addTariffRule, loadTariffRules, removeTariffRule, saveTariffRule } from '../../lib/services/tariffService'
  import type { ExtraItemCatalogEntry, ExtraItemCatalogInput } from '../../lib/types/extraItem'
  import type { TariffItemType, TariffReservationType, TariffRule, TariffRuleInput } from '../../lib/types/tariff'

  let {
    onCatalogChange,
  }: {
    onCatalogChange?: (catalog: ExtraItemCatalogEntry[]) => void
  } = $props()

  type ListinoTab = 'tariffs' | 'articles' | 'included'
  type DetailMode = 'empty' | 'tariff' | 'article'
  type ArticleCatalogRow = ExtraItemCatalogEntry & { duplicateCount: number }

  const itemTypeOptions: Array<{ value: TariffItemType; label: string }> = [
    { value: 'umbrella', label: beachTypeLabels.umbrella },
    { value: 'palm', label: beachTypeLabels.palm },
    { value: 'small_palm', label: beachTypeLabels.small_palm },
  ]
  const reservationTypeOptions: Array<{ value: TariffReservationType; label: string }> = [
    { value: 'daily', label: reservationTypeLabels.daily },
    { value: 'seasonal', label: reservationTypeLabels.seasonal },
  ]

  let activeTab: ListinoTab = $state('tariffs')
  let activeCategory = $state('all')
  let rules: TariffRule[] = $state([])
  let articles: ExtraItemCatalogEntry[] = $state([])
  let query = $state('')
  let detailMode: DetailMode = $state('empty')
  let selectedRule: TariffRule | null = $state(null)
  let selectedArticle: ExtraItemCatalogEntry | null = $state(null)
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

  const loadListino = async () => {
    const [nextRules, nextArticles] = await Promise.all([loadTariffRules(), loadExtraItemCatalog()])
    rules = nextRules
    articles = nextArticles
    onCatalogChange?.(nextArticles)
  }

  const selectTab = (tab: ListinoTab) => {
    activeTab = tab
    activeCategory = 'all'
    detailMode = 'empty'
    selectedRule = null
    selectedArticle = null
    message = null
    error = null
  }

  const startNewTariff = () => {
    activeTab = 'tariffs'
    selectedRule = null
    selectedArticle = null
    detailMode = 'tariff'
    tariffName = 'Nuova tariffa'
    tariffItemType = 'umbrella'
    tariffRowLabel = ''
    tariffReservationType = 'daily'
    tariffAmount = ''
    tariffNotes = ''
  }

  const editTariff = (rule: TariffRule) => {
    activeTab = 'tariffs'
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
      detailMode = 'empty'
      selectedRule = null
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
      selectedRule = null
      detailMode = 'empty'
      message = 'Tariffa disattivata'
    } catch (archiveError) {
      error = archiveError instanceof Error ? archiveError.message : 'Errore disattivazione tariffa.'
    } finally {
      saving = false
    }
  }

  const startNewArticle = () => {
    activeTab = 'articles'
    selectedArticle = null
    selectedRule = null
    detailMode = 'article'
    articleName = 'Nuovo articolo'
    articleCategory = 'Extra'
    articleUnit = 'pz'
    articleAmount = ''
    articleMaxQuantity = 2
    articleIncludedQuantity = 0
    articleNotes = ''
  }

  const editArticle = (article: ExtraItemCatalogEntry) => {
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
      detailMode = 'empty'
      selectedArticle = null
      message = 'Articolo salvato'
    } catch (saveError) {
      error = saveError instanceof Error ? saveError.message : 'Errore salvataggio articolo.'
    } finally {
      saving = false
    }
  }

  const archiveArticle = async () => {
    if (!selectedArticle) return
    saving = true
    message = null
    error = null
    try {
      await removeExtraItemCatalogEntry(selectedArticle.id)
      await loadListino()
      selectedArticle = null
      detailMode = 'empty'
      message = 'Articolo disattivato'
    } catch (archiveError) {
      error = archiveError instanceof Error ? archiveError.message : 'Errore disattivazione articolo.'
    } finally {
      saving = false
    }
  }

  const normalizedQuery = $derived(query.trim().toLowerCase())
  const normalizeCatalogKey = (value: string) => value.trim().toLowerCase()
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
  const tariffCategories = $derived.by(() => {
    const counts = new Map<string, number>()
    for (const rule of rules) {
      const label = beachTypeLabels[rule.itemType]
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return [...counts.entries()].map(([label, count]) => ({ id: label, label, count }))
  })
  const articleCategories = $derived.by(() => {
    const counts = new Map<string, number>()
    for (const article of uniqueArticles) {
      const label = article.category || 'Extra'
      counts.set(label, (counts.get(label) ?? 0) + 1)
    }
    return [...counts.entries()].map(([label, count]) => ({ id: label, label, count }))
  })
  const activeCategories = $derived(activeTab === 'tariffs' ? tariffCategories : articleCategories)
  const filteredRules = $derived(
    rules.filter((rule) => {
      if (activeCategory !== 'all' && beachTypeLabels[rule.itemType] !== activeCategory) return false
      if (!normalizedQuery) return true
      return [rule.name, beachTypeLabels[rule.itemType], rule.rowLabel ?? 'tutte le file', reservationTypeLabels[rule.reservationType]]
        .join(' ')
        .toLowerCase()
        .includes(normalizedQuery)
    }),
  )
  const filteredArticles = $derived(
    uniqueArticles.filter((article) => {
      if (activeCategory !== 'all' && (article.category || 'Extra') !== activeCategory) return false
      if (!normalizedQuery) return true
      return [article.name, article.category ?? '', article.unitLabel].join(' ').toLowerCase().includes(normalizedQuery)
    }),
  )
  const listinoStats = $derived.by(() => {
    const visibleCount = activeTab === 'tariffs' ? filteredRules.length : filteredArticles.length
    const pricedArticles = uniqueArticles.filter((article) => article.defaultAmountCents > 0).length
    const duplicateCount = uniqueArticles.reduce((sum, article) => sum + Math.max(0, article.duplicateCount - 1), 0)
    return {
      visibleCount,
      activeTariffs: rules.length,
      activeArticles: uniqueArticles.length,
      pricedArticles,
      duplicateCount,
    }
  })
  const primaryActionLabel = $derived(
    activeTab === 'tariffs' ? 'Nuova tariffa' : activeTab === 'included' ? 'Nuova dotazione' : 'Nuovo articolo',
  )
  const startPrimaryAction = () => {
    if (activeTab === 'tariffs') {
      startNewTariff()
      return
    }

    startNewArticle()
  }

  onMount(() => {
    loadListino().catch(() => {
      error = 'Errore caricamento listino.'
    })
  })
</script>

<section class="settings-panel listino-panel" aria-label="Listino">
  <div class="settings-view-header settings-panel__header listino-topbar">
    <h2>Listino</h2>
    <span class="settings-toolbar-count">{listinoStats.visibleCount} voci</span>
  </div>

  <div class="listino-command-band">
    <div class="listino-tabs" role="tablist" aria-label="Sezioni listino">
      <button type="button" class:active={activeTab === 'tariffs'} onclick={() => selectTab('tariffs')}>Tariffe posto</button>
      <button type="button" class:active={activeTab === 'articles'} onclick={() => selectTab('articles')}>Articoli extra</button>
      <button type="button" class:active={activeTab === 'included'} onclick={() => selectTab('included')}>Dotazioni incluse</button>
    </div>
    <label class="listino-search">
      <span>Cerca</span>
      <input bind:value={query} placeholder="Nome, categoria o periodo" />
    </label>
    <button type="button" class="button-primary listino-primary-action" onclick={startPrimaryAction}>
      {primaryActionLabel}
    </button>
  </div>

  <div class="listino-stats" aria-label="Stato listino">
    <div><span>Vista</span><strong>{listinoStats.visibleCount}</strong></div>
    <div><span>Tariffe attive</span><strong>{listinoStats.activeTariffs}</strong></div>
    <div><span>Articoli unici</span><strong>{listinoStats.activeArticles}</strong></div>
    <div><span>Con prezzo</span><strong>{listinoStats.pricedArticles}</strong></div>
    <div><span>Duplicati aggregati</span><strong>{listinoStats.duplicateCount}</strong></div>
  </div>

  <div class="listino-workbench">
    <aside class="listino-categories" aria-label="Categorie listino">
      <header>
        <strong>Categorie</strong>
        <span>{activeCategories.length} gruppi</span>
      </header>
      <button type="button" class:active={activeCategory === 'all'} onclick={() => (activeCategory = 'all')}>
        <span>Tutte</span>
        <strong>{activeTab === 'tariffs' ? rules.length : uniqueArticles.length}</strong>
      </button>
      {#each activeCategories as category}
        <button type="button" class:active={activeCategory === category.id} onclick={() => (activeCategory = category.id)}>
          <span>{category.label}</span>
          <strong>{category.count}</strong>
        </button>
      {/each}
    </aside>

    <section class="listino-grid" aria-label="Catalogo listino">
      {#if activeTab === 'tariffs'}
        <div class="listino-grid__head listino-grid__head--tariffs" aria-hidden="true">
          <span>Tariffa</span>
          <span>Elemento</span>
          <span>Periodo</span>
          <span>Categoria</span>
          <span>Prezzo</span>
        </div>
        <div class="listino-list">
          {#each filteredRules as rule (rule.id)}
            <button type="button" class="listino-row listino-row--tariff" class:active={selectedRule?.id === rule.id} onclick={() => editTariff(rule)}>
              <span>
                <strong>{rule.name}</strong>
                <small>{rule.notes || 'Tariffa base conto'}</small>
              </span>
              <em>{beachTypeLabels[rule.itemType]}</em>
              <em>{reservationTypeLabels[rule.reservationType]}</em>
              <em>{rule.rowLabel ?? 'tutte le file'}</em>
              <b>{formatEuroFromCents(rule.amountCents)}</b>
            </button>
          {:else}
            <p class="empty-customer">Nessuna tariffa trovata.</p>
          {/each}
        </div>
      {:else}
        <div class="listino-grid__head listino-grid__head--articles" aria-hidden="true">
          <span>Articolo</span>
          <span>Categoria</span>
          <span>Prezzo</span>
          <span>Max</span>
          <span>Incluso</span>
          <span>Stato</span>
        </div>
        <div class="listino-list">
          {#each filteredArticles as article (article.id)}
            <button type="button" class="listino-row listino-row--article" class:active={selectedArticle?.id === article.id} onclick={() => editArticle(article)}>
              <span>
                <strong>{article.name}</strong>
                <small>{article.duplicateCount > 1 ? `${article.duplicateCount} voci storiche aggregate` : `unita ${article.unitLabel}`}</small>
              </span>
              <em>{article.category || 'Extra'}</em>
              <b>{formatEuroFromCents(article.defaultAmountCents)}</b>
              <em>{article.maxQuantityPerBooking}</em>
              <em>{article.includedQuantityDefault}</em>
              <i>{article.active ? 'Attivo' : 'Non attivo'}</i>
            </button>
          {:else}
            <p class="empty-customer">Nessun articolo trovato.</p>
          {/each}
        </div>
      {/if}
    </section>

    <section class="listino-inspector" aria-label="Dettaglio listino">
      {#if detailMode === 'tariff'}
        <div class="settings-subheader">
          <span>{selectedRule ? 'Modifica tariffa' : 'Nuova tariffa'}</span>
          <h3>Tariffa posto</h3>
          <p>Prezzo base usato per proporre il conto dopo il periodo.</p>
        </div>
        <form class="listino-form" onsubmit={(event) => { event.preventDefault(); saveTariff() }}>
          <label>Nome tariffa<input bind:value={tariffName} /></label>
          <label>Elemento
            <select bind:value={tariffItemType}>
              {#each itemTypeOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>
          <label>Categoria / fila<input bind:value={tariffRowLabel} placeholder="tutte le file" /></label>
          <label>Periodo
            <select bind:value={tariffReservationType}>
              {#each reservationTypeOptions as option}
                <option value={option.value}>{option.label}</option>
              {/each}
            </select>
          </label>
          <label>Prezzo<input bind:value={tariffAmount} inputmode="decimal" placeholder="15,00" /></label>
          <label>Note<input bind:value={tariffNotes} /></label>
          <div class="settings-form-actions">
            <button type="submit" class="button-primary" disabled={saving}>Salva</button>
            {#if selectedRule}<button type="button" class="button-secondary" disabled={saving} onclick={duplicateTariff}>Duplica</button>{/if}
            {#if selectedRule}<button type="button" class="button-secondary" disabled={saving} onclick={archiveTariff}>Disattiva</button>{/if}
            <button type="button" class="button-secondary" disabled={saving} onclick={() => (detailMode = 'empty')}>Annulla</button>
          </div>
        </form>
      {:else if detailMode === 'article'}
        <div class="settings-subheader">
          <span>{selectedArticle ? 'Modifica articolo' : 'Nuovo articolo'}</span>
          <h3>Articolo extra</h3>
          <p>Prezzo, quantita massima e inclusione predefinita usati nel conto.</p>
        </div>
        <form class="listino-form" onsubmit={(event) => { event.preventDefault(); saveArticle() }}>
          <label>Nome articolo<input bind:value={articleName} /></label>
          <label>Categoria<input bind:value={articleCategory} placeholder="Relax, Sedute, Servizi" /></label>
          <label>Unita<input bind:value={articleUnit} /></label>
          <label>Prezzo unitario<input bind:value={articleAmount} inputmode="decimal" placeholder="8,00" /></label>
          <label>Quantita massima<input type="number" min="1" bind:value={articleMaxQuantity} /></label>
          <label>Quantita inclusa default<input type="number" min="0" bind:value={articleIncludedQuantity} /></label>
          <label>Note<input bind:value={articleNotes} /></label>
          <div class="settings-form-actions">
            <button type="submit" class="button-primary" disabled={saving}>Salva</button>
            {#if selectedArticle}<button type="button" class="button-secondary" disabled={saving} onclick={archiveArticle}>Disattiva</button>{/if}
            <button type="button" class="button-secondary" disabled={saving} onclick={() => (detailMode = 'empty')}>Annulla</button>
          </div>
        </form>
      {:else if activeTab === 'included'}
        <div class="listino-empty-detail">
          <h3>Dotazioni incluse</h3>
          <p>Seleziona un articolo e modifica “Quantita inclusa default”. Le regole per tipo posto restano quelle gia presenti nel sistema.</p>
        </div>
      {:else}
        <div class="listino-empty-detail">
          <h3>Seleziona una voce</h3>
          <p>Apri una riga del catalogo per modificare prezzi, categorie, quantita e regole operative.</p>
          <dl>
            <div><dt>Origine conto</dt><dd>Listino attivo</dd></div>
            <div><dt>Override</dt><dd>Manuale nel conto prenotazione</dd></div>
            <div><dt>Extra</dt><dd>Articoli attivi disponibili nel bottom panel</dd></div>
          </dl>
        </div>
      {/if}
    </section>
  </div>

  {#if message}
    <p class="inline-confirmation">{message}</p>
  {/if}
  {#if error}
    <p class="form-error">{error}</p>
  {/if}
</section>
