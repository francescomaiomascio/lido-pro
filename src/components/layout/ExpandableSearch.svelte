<script lang="ts">
  let {
    value,
    placeholder = 'Cerca posto, cliente, stato',
    onChange,
    onExpandedChange = () => {},
  }: {
    value: string
    placeholder?: string
    onChange: (value: string) => void
    onExpandedChange?: (expanded: boolean) => void
  } = $props()

  let expanded = $state(false)
  let inputRef: HTMLInputElement | null = $state(null)

  $effect(() => {
    if (expanded) {
      queueMicrotask(() => inputRef?.focus())
    }
  })

  const open = () => {
    expanded = true
    onExpandedChange(true)
  }

  const close = () => {
    expanded = false
    onExpandedChange(false)
    if (value) {
      onChange('')
    }
  }
</script>

<div class="expandable-search" class:expanded>
  {#if expanded}
    <div class="expandable-search__overlay">
      <label class="expandable-search__field">
        <span class="sr-only">Cerca</span>
        <span class="expandable-search__icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="6"></circle>
            <path d="m20 20-3.5-3.5"></path>
          </svg>
        </span>
        <input
          bind:this={inputRef}
          type="search"
          {placeholder}
          value={value}
          oninput={(event) => onChange(event.currentTarget.value)}
          onblur={() => {
            if (!value.trim()) {
              expanded = false
              onExpandedChange(false)
            }
          }}
        />
      </label>
    </div>
    <button type="button" class="expandable-search__utility" aria-label="Chiudi ricerca" onclick={close}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <path d="M6 6 18 18"></path>
        <path d="M18 6 6 18"></path>
      </svg>
    </button>
  {:else}
    <button type="button" class="expandable-search__trigger" aria-label="Apri ricerca" onclick={open}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
        <circle cx="11" cy="11" r="6"></circle>
        <path d="m20 20-3.5-3.5"></path>
      </svg>
    </button>
  {/if}
</div>
