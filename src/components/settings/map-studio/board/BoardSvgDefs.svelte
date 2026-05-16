<script lang="ts">
  import BoardAssetSymbols from './assets/BoardAssetSymbols.svelte'
</script>

<defs>
  <linearGradient id="board-sand" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#f7e8bd" />
    <stop offset=".46" stop-color="#e9cf88" />
    <stop offset="1" stop-color="#c99447" />
  </linearGradient>
  <linearGradient id="board-sea" x1="0" x2="0" y1="0" y2="1">
    <stop offset="0" stop-color="#1899b0" />
    <stop offset=".48" stop-color="#58c4cb" />
    <stop offset=".82" stop-color="#a9ded2" />
    <stop offset="1" stop-color="#f2d99b" stop-opacity=".72" />
  </linearGradient>
  <radialGradient id="board-sand-vignette" cx="50%" cy="44%" r="72%">
    <stop offset="0" stop-color="#fff5d0" stop-opacity=".22" />
    <stop offset=".7" stop-color="#9a6b2b" stop-opacity="0" />
    <stop offset="1" stop-color="#6f481c" stop-opacity=".18" />
  </radialGradient>
  <linearGradient id="board-zone-palm" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="rgb(29 132 96 / 26%)" />
    <stop offset="1" stop-color="rgb(156 190 122 / 14%)" />
  </linearGradient>
  <linearGradient id="board-zone-palmetta" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="rgb(48 111 80 / 22%)" />
    <stop offset="1" stop-color="rgb(115 151 93 / 13%)" />
  </linearGradient>
  <linearGradient id="board-zone-umbrella" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="rgb(223 156 53 / 22%)" />
    <stop offset="1" stop-color="rgb(244 212 139 / 14%)" />
  </linearGradient>
  <linearGradient id="board-zone-empty" x1="0" x2="1" y1="0" y2="1">
    <stop offset="0" stop-color="rgb(255 255 255 / 16%)" />
    <stop offset="1" stop-color="rgb(85 95 80 / 8%)" />
  </linearGradient>
  <pattern id="board-grain" width="42" height="42" patternUnits="userSpaceOnUse">
    <circle cx="8" cy="9" r=".9" fill="rgb(115 82 35 / 13%)" />
    <circle cx="31" cy="18" r=".7" fill="rgb(255 248 218 / 22%)" />
    <circle cx="20" cy="34" r=".8" fill="rgb(122 84 38 / 10%)" />
  </pattern>
  <pattern id="board-grid" width="34" height="34" patternUnits="userSpaceOnUse">
    <path d="M34 0H0v34" fill="none" stroke="rgb(48 68 62 / 8%)" stroke-width="1" />
  </pattern>
  <filter id="board-shadow" x="-20%" y="-20%" width="140%" height="140%">
    <feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#173638" flood-opacity=".18" />
  </filter>
  <filter id="board-soft-glow" x="-90%" y="-90%" width="280%" height="280%">
    <feDropShadow dx="0" dy="0" stdDeviation="6" flood-color="#00776d" flood-opacity=".48" />
  </filter>
  <filter id="board-object-shadow" x="-80%" y="-80%" width="260%" height="260%">
    <feDropShadow dx="0" dy="4" stdDeviation="2.4" flood-color="#24352b" flood-opacity=".22" />
  </filter>
  <radialGradient id="board-umbrella-canopy" cx="48%" cy="42%" r="62%">
    <stop offset="0" stop-color="#fff3c9" />
    <stop offset=".58" stop-color="#e5bc60" />
    <stop offset="1" stop-color="#a66c27" />
  </radialGradient>
  <radialGradient id="board-palm-leaf" cx="50%" cy="50%" r="62%">
    <stop offset="0" stop-color="#91d091" />
    <stop offset=".68" stop-color="#16815d" />
    <stop offset="1" stop-color="#0a513f" />
  </radialGradient>
  <radialGradient id="board-palmetta-leaf" cx="50%" cy="50%" r="62%">
    <stop offset="0" stop-color="#a2ce87" />
    <stop offset=".74" stop-color="#3b8658" />
    <stop offset="1" stop-color="#1d5a45" />
  </radialGradient>
  <BoardAssetSymbols />
</defs>
