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
    placeholder="Cerca posto o cliente"
    value={value}
    oninput={(event) => onChange(event.currentTarget.value)}
  />
</label>
