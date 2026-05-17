<script lang="ts">
  import { localAccountMenuSections } from '../../lib/account/localAccountMenu'

  let {
    workspaceName,
    runtimeLabel,
    onOpenSystem,
  }: {
    workspaceName: string
    runtimeLabel: string
    onOpenSystem: () => void
  } = $props()

  let open = $state(false)

  const runSystemAction = () => {
    open = false
    onOpenSystem()
  }

  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      open = false
    }
  }
</script>

<svelte:window onkeydown={handleKeydown} />

<div class="account-menu" class:open>
  <button
    type="button"
    class="account-menu__trigger"
    aria-label="Apri account e workspace"
    aria-haspopup="dialog"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span class="account-menu__trigger-avatar" aria-hidden="true">SM</span>
    <svg class="account-menu__trigger-chevron" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="m4 6 4 4 4-4"></path>
    </svg>
  </button>

  {#if open}
    <button
      type="button"
      class="account-menu__backdrop"
      aria-label="Chiudi account e workspace"
      onclick={() => (open = false)}
    ></button>

    <section class="account-menu__panel" aria-label="Account e workspace LidoPro">
      <header class="account-menu__header">
        <em aria-hidden="true">SM</em>
        <div>
          <strong>{workspaceName}</strong>
          <span>Workspace locale · {runtimeLabel}</span>
        </div>
        <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M7 7h11"></path>
          <path d="m15 4 3 3-3 3"></path>
          <path d="M17 17H6"></path>
          <path d="m9 20-3-3 3-3"></path>
        </svg>
      </header>

      {#each localAccountMenuSections as section}
        <div class="account-menu__section">
          <h2>{section.title}</h2>
          <div class="account-menu__items">
            {#each section.items as item}
              <button
                type="button"
                class="account-menu__item"
                disabled={item.disabled}
                title={item.disabled ? item.status : item.label}
                onclick={() => item.action === 'system' && runSystemAction()}
              >
                <span class="account-menu__item-icon" aria-hidden="true">
                  {#if item.id === 'local-account'}
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="8" r="3.2"></circle>
                      <path d="M5 19a7 7 0 0 1 14 0"></path>
                    </svg>
                  {:else if item.id === 'workspace'}
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M4 7h16"></path>
                      <path d="M6 7v12h12V7"></path>
                      <path d="M9 19v-5h6v5"></path>
                    </svg>
                  {:else if item.id === 'local-data'}
                    <svg viewBox="0 0 24 24" fill="none">
                      <ellipse cx="12" cy="6" rx="7" ry="3"></ellipse>
                      <path d="M5 6v6c0 1.7 3.1 3 7 3s7-1.3 7-3V6"></path>
                      <path d="M5 12v6c0 1.7 3.1 3 7 3s7-1.3 7-3v-6"></path>
                    </svg>
                  {:else if item.id === 'backup'}
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M12 4v10"></path>
                      <path d="m8 10 4 4 4-4"></path>
                      <path d="M5 18h14"></path>
                    </svg>
                  {:else if item.id === 'providers'}
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M7 12a5 5 0 0 1 5-5h3"></path>
                      <path d="M17 12a5 5 0 0 1-5 5H9"></path>
                      <path d="M14 4h4v4"></path>
                      <path d="M10 20H6v-4"></path>
                    </svg>
                  {:else if item.id === 'integrations'}
                    <svg viewBox="0 0 24 24" fill="none">
                      <path d="M8 8h8v8H8z"></path>
                      <path d="M12 3v5"></path>
                      <path d="M12 16v5"></path>
                      <path d="M3 12h5"></path>
                      <path d="M16 12h5"></path>
                    </svg>
                  {:else if item.id === 'settings'}
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="3"></circle>
                      <path d="M12 3v3"></path>
                      <path d="M12 18v3"></path>
                      <path d="M3 12h3"></path>
                      <path d="M18 12h3"></path>
                      <path d="m5 5 2 2"></path>
                      <path d="m17 17 2 2"></path>
                      <path d="m19 5-2 2"></path>
                      <path d="m7 17-2 2"></path>
                    </svg>
                  {:else}
                    <svg viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="8"></circle>
                      <path d="M12 8v4"></path>
                      <path d="M12 16h.01"></path>
                    </svg>
                  {/if}
                </span>
                <span class="account-menu__item-copy">
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                {#if item.status}
                  <em class="account-menu__item-status">{item.status}</em>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </section>
  {/if}
</div>
