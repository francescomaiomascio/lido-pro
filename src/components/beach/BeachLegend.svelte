<script lang="ts">
  import { beachStatusLabels } from '../../lib/format/beachLabels'
</script>

<div class="beach-legend" aria-label="Legenda stati">
  <span class="legend-item legend-item--free">{beachStatusLabels.free}</span>
  <span class="legend-item legend-item--occupied">{beachStatusLabels.occupied}</span>
  <span class="legend-item legend-item--reserved">{beachStatusLabels.reserved}</span>
  <span class="legend-item legend-item--maintenance">{beachStatusLabels.maintenance}</span>
</div>
