<script lang="ts">
  import { mapStudioDomains, type MapStudioDomainId } from './mapStudioDomains'

  let {
    activeDomain,
    onDomainChange,
  }: {
    activeDomain: MapStudioDomainId
    onDomainChange: (domain: MapStudioDomainId) => void
  } = $props()
</script>

<nav class="map-studio-domain-tabs" aria-label="Domini progettuali Studio mappa">
  {#each mapStudioDomains as domain}
    <button
      type="button"
      class:active={domain.id === activeDomain}
      title={domain.description}
      onclick={() => onDomainChange(domain.id)}
    >
      <span class="map-studio-domain-tabs__label">{domain.label}</span>
      <span class="map-studio-domain-tabs__short">{domain.shortLabel}</span>
    </button>
  {/each}
</nav>
