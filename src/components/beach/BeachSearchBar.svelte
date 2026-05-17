<script lang="ts">
  let {
    value,
    onChange,
  }: {
    value: string
    onChange: (value: string) => void
  } = $props()
</script>

<label class="search-bar">
  <span>Cerca</span>
  <input
    type="search"
    placeholder="Cerca"
    value={value}
    oninput={(event) => onChange(event.currentTarget.value)}
  />
</label>
