<script lang="ts">
  import type { ComponentProps } from 'svelte'
  import BookingConsoleShell from './BookingConsoleShell.svelte'

  let props: ComponentProps<typeof BookingConsoleShell> = $props()
</script>

<BookingConsoleShell {...props} />
