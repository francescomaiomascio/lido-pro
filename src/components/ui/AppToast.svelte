<script lang="ts">
  import { onMount } from 'svelte'
  import { listenForToasts, type AppToastMessage } from '../../lib/state/toastState'

  let toasts: AppToastMessage[] = $state([])

  onMount(() => {
    return listenForToasts((toast) => {
      toasts = [...toasts, toast].slice(-3)
      window.setTimeout(() => {
        toasts = toasts.filter((current) => current.id !== toast.id)
      }, 1500)
    })
  })
</script>

<div class="app-toast-host" aria-live="polite" aria-atomic="true">
  {#each toasts as toast (toast.id)}
    <div class="app-toast">{toast.message}</div>
  {/each}
</div>
