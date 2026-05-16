<script lang="ts">
  let { kind, src = '', size = 'compact' }: { kind: string; src?: string; size?: 'compact' | 'hero' } = $props()

  const normalizedKind = $derived(kind.toLowerCase())
  const family = $derived(
    normalizedKind.includes('umbrella')
      ? 'umbrella'
      : normalizedKind.includes('small-palm')
        ? 'small-palm'
        : normalizedKind.includes('palm')
          ? 'palm'
          : normalizedKind.includes('walkway')
            ? 'walkway'
            : normalizedKind.includes('zone')
              ? 'zone'
              : normalizedKind.includes('symbol')
                ? 'symbol'
                : normalizedKind.includes('chair') ||
                    normalizedKind.includes('sunbed') ||
                    normalizedKind.includes('table') ||
                    normalizedKind.includes('furniture')
                  ? 'furniture'
                  : 'map-item',
  )
</script>

<span class={`beach-library-preview beach-library-preview--${family} beach-library-preview--${size}`} aria-hidden="true">
  {#if src}
    <img src={src} alt="" loading="lazy" />
  {:else if family === 'umbrella'}
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="11" />
      <path d="M16 5v22M5 16h22M8 8l16 16M24 8 8 24" />
      <circle cx="16" cy="16" r="2.2" />
    </svg>
  {:else if family === 'palm'}
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 27V17" />
      <path d="M16 17c-4.8-1.5-7.8-4.7-8.8-9 4.2.2 7 2.1 8.8 5.7" />
      <path d="M16 17c4.8-1.5 7.8-4.7 8.8-9-4.2.2-7 2.1-8.8 5.7" />
      <path d="M16 17c-2.2-4.4-2.2-8.1 0-11 2.2 2.9 2.2 6.6 0 11" />
    </svg>
  {:else if family === 'small-palm'}
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M16 25v-7" />
      <path d="M16 18c-4-.8-6.8-3.1-8.2-6.8 3.9 0 6.7 1.4 8.2 4.6" />
      <path d="M16 18c4-.8 6.8-3.1 8.2-6.8-3.9 0-6.7 1.4-8.2 4.6" />
    </svg>
  {:else if family === 'walkway'}
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="6" y="9" width="20" height="14" rx="3" />
      <path d="M10 9v14M16 9v14M22 9v14" />
    </svg>
  {:else if family === 'zone'}
    <svg viewBox="0 0 32 32" fill="none">
      <path d="M6 8h11v8H6zM17 16h9v8h-9z" />
      <path d="M20 8h6v6" />
    </svg>
  {:else if family === 'symbol'}
    <svg viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="10" />
      <path d="M16 14v8" />
      <path d="M16 10h.01" />
    </svg>
  {:else if family === 'furniture'}
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="8" y="8" width="16" height="10" rx="3" />
      <path d="M10 18v6M22 18v6M9 24h14" />
    </svg>
  {:else}
    <svg viewBox="0 0 32 32" fill="none">
      <rect x="8" y="8" width="16" height="16" rx="4" />
      <path d="M12 16h8M16 12v8" />
    </svg>
  {/if}
</span>
