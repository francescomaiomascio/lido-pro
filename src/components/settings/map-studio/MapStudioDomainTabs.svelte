<script lang="ts">
  import type { MapStudioDomainId } from './mapStudioDomains'
  import type { MapStudioDomainStageState } from './state/mapStudioLifecycle'

  let {
    activeDomain,
    domainStates,
    onDomainChange,
  }: {
    activeDomain: MapStudioDomainId
    domainStates: MapStudioDomainStageState[]
    onDomainChange: (domain: MapStudioDomainId) => void
  } = $props()
</script>

<nav class="map-studio-domain-tabs" aria-label="Domini progettuali Studio mappa">
  {#each domainStates as domain}
    <button
      type="button"
      class:active={domain.id === activeDomain}
      disabled={Boolean(domain.disabledReason)}
      title={domain.disabledReason ?? domain.description}
      onclick={() => onDomainChange(domain.id)}
    >
      <span class="map-studio-domain-tabs__label">{domain.label}</span>
      <span class="map-studio-domain-tabs__short">{domain.shortLabel}</span>
    </button>
  {/each}
</nav>
