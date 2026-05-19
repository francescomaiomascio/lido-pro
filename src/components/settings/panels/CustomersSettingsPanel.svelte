<script lang="ts">
  import CustomerRegistryPanel from '../../customers/CustomerRegistryPanel.svelte'
  import type { CustomerBookingConfirmResult } from '../../../lib/booking/customerBookingService'

  let {
    onOpenBeachItem,
    onBookingCreated,
    onInboxChanged,
  }: {
    onOpenBeachItem?: (itemId: string) => void | Promise<void>
    onBookingCreated?: (result: CustomerBookingConfirmResult) => void | Promise<void>
    onInboxChanged?: () => void | Promise<void>
  } = $props()
</script>

<CustomerRegistryPanel {onOpenBeachItem} {onBookingCreated} {onInboxChanged} />
