<script lang="ts">
  let {
    label,
    tone = 'draft',
  }: {
    label: string
    tone?: 'draft' | 'live' | 'readonly' | 'planned'
  } = $props()
</script>

<span class={`settings-status-pill settings-status-pill--${tone}`}>{label}</span>
