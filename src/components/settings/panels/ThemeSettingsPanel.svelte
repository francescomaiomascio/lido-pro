<script lang="ts">
  import { appThemes, getThemeLabel, type AppTheme } from '../../../lib/theme/themeTokens'

  let {
    theme,
    onThemeChange,
  }: {
    theme: AppTheme
    onThemeChange: (theme: AppTheme) => void
  } = $props()
</script>

<section class="settings-panel" aria-label="Tema">
  <div class="settings-view-header settings-panel__header">
    <div>
      <h2>Tema</h2>
      <p>Tema corrente: {getThemeLabel(theme)}. L’impostazione viene salvata localmente.</p>
    </div>
  </div>

  <div class="settings-choice-list">
    {#each appThemes as entry}
      <button
        type="button"
        class:active={entry === theme}
        onclick={() => onThemeChange(entry)}
      >
        <span>{getThemeLabel(entry)}</span>
        <small>{entry === 'neutral' ? 'Default' : 'Alternative'}</small>
      </button>
    {/each}
  </div>
</section>
