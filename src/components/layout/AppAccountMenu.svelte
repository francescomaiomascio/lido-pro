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
</script>

<div class="account-menu" class:open>
  <button
    type="button"
    class="account-menu__trigger"
    aria-label="Apri account e workspace"
    aria-expanded={open}
    onclick={() => (open = !open)}
  >
    <span aria-hidden="true">SM</span>
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
        <div>
          <strong>{workspaceName}</strong>
          <span>Workspace locale · {runtimeLabel}</span>
        </div>
        <em>SM</em>
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
                onclick={() => item.action === 'system' && runSystemAction()}
              >
                <span>
                  <strong>{item.label}</strong>
                  <small>{item.description}</small>
                </span>
                {#if item.status}
                  <em>{item.status}</em>
                {/if}
              </button>
            {/each}
          </div>
        </div>
      {/each}
    </section>
  {/if}
</div>
