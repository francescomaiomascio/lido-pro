<script lang="ts">
  let {
    label = 'Salvataggio',
  }: {
    label?: string
  } = $props()
</script>

<span class="action-activity" aria-live="polite">
  <span class="action-activity__spinner" aria-hidden="true"></span>
  <span>{label}</span>
</span>
