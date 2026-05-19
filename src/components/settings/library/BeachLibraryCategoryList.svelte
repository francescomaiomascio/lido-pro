<script lang="ts">
  import type { SettingsSection } from '../../../lib/state/settingsMenuState'
  import type { BeachLibraryCategory } from '../../../lib/map-canvas/library/assetLibraryCatalog'
  import BeachLibraryPreviewIcon from './BeachLibraryPreviewIcon.svelte'

  let {
    categories,
    targetSections,
    onOpen,
  }: {
    categories: BeachLibraryCategory[]
    targetSections: Partial<Record<BeachLibraryCategory['id'], SettingsSection>>
    onOpen: (section: SettingsSection) => void
  } = $props()

  const totalAvailable = $derived(categories.reduce((sum, category) => sum + category.availableCount, 0))
  const totalPlanned = $derived(categories.reduce((sum, category) => sum + category.plannedCount, 0))
  const availableCategories = $derived(categories.filter((category) => category.status === 'available').length)
</script>

<section class="beach-library-overview" aria-label="Sintesi libreria asset">
  <div>
    <span>Studio Canvas</span>
    <strong>Materiali tecnici e asset di costruzione</strong>
    <p>Gli elementi vendibili stanno in Articoli; qui restano asset non contabili per costruzione e rendering.</p>
  </div>
  <dl>
    <div>
      <dt>Categorie attive</dt>
      <dd>{availableCategories}/{categories.length}</dd>
    </div>
    <div>
      <dt>Asset disponibili</dt>
      <dd>{totalAvailable}</dd>
    </div>
    <div>
      <dt>Previsti</dt>
      <dd>{totalPlanned}</dd>
    </div>
  </dl>
</section>

<div class="beach-library-category-list">
  {#each categories as category}
    {@const targetSection = targetSections[category.id]}
    <button
      type="button"
      class="beach-library-category-row"
      class:beach-library-category-row--available={category.status === 'available'}
      onclick={() => targetSection && onOpen(targetSection)}
      disabled={!targetSection}
    >
      <div class="beach-library-category-row__visual">
        <BeachLibraryPreviewIcon kind={category.previewKind} src={category.previewUrl} size="hero" />
      </div>
      <span>
        <small>{category.status === 'available' ? 'Disponibile ora' : 'Da pianificare'}</small>
        <strong>{category.label}</strong>
        <em>{category.description}</em>
      </span>
      <div class="beach-library-category-row__stats" aria-label="Stato categoria">
        <b>{category.availableCount}</b>
        <small>disponibili</small>
        <i>{category.plannedCount} previsti</i>
      </div>
    </button>
  {/each}
</div>
