<script lang="ts">
  import type { BeachLibraryItem } from '../../../lib/map-canvas/library/assetLibraryCatalog'
  import BeachLibraryPreviewIcon from './BeachLibraryPreviewIcon.svelte'

  let { item, compact = false, eyebrow = '' }: { item: BeachLibraryItem; compact?: boolean; eyebrow?: string } = $props()

  const dimensionText = $derived(
    item.defaultWidthM && item.defaultHeightM
      ? `${item.defaultWidthM}m x ${item.defaultHeightM}m`
      : item.defaultWidthM
        ? `${item.defaultWidthM}m larghezza`
        : 'Da definire',
  )
  const statusText = $derived(
    item.qualityStatus === 'approved'
      ? 'Approved'
      : item.previewUrl
        ? 'Importato'
        : item.status === 'available'
          ? 'Disponibile'
          : 'Previsto',
  )
</script>

<article class="beach-library-item-row" class:beach-library-item-row--compact={compact}>
  <div class="beach-library-item-row__visual">
    <BeachLibraryPreviewIcon kind={item.previewKind} src={item.previewUrl} size={compact ? 'compact' : 'hero'} />
  </div>

  <div class="beach-library-item-row__body">
    <div class="beach-library-item-row__copy">
      {#if eyebrow}
        <span class="beach-library-item-row__eyebrow">{eyebrow}</span>
      {/if}
      <strong>{item.label}</strong>
      <small>{item.description}</small>
    </div>

    <dl class="beach-library-item-row__meta">
      <div>
        <dt>Stato</dt>
        <dd class:planned={item.status === 'planned'}>{statusText}</dd>
      </div>
      {#if item.qualityStatus}
        <div>
          <dt>Qualità</dt>
          <dd>{item.qualityStatus}</dd>
        </div>
      {/if}
      <div>
        <dt>Dimensione</dt>
        <dd>{dimensionText}</dd>
      </div>
      {#if item.collisionShape}
        <div>
          <dt>Collisione</dt>
          <dd>{item.collisionShape}</dd>
        </div>
      {/if}
      {#if item.moduleLengthM}
        <div>
          <dt>Modulo</dt>
          <dd>{item.moduleLengthM}m</dd>
        </div>
      {/if}
      {#if item.license}
        <div>
          <dt>Licenza</dt>
          <dd>{item.license}{item.requiresAttribution ? ' · attribuzione' : ''}</dd>
        </div>
      {/if}
    </dl>
  </div>
</article>
