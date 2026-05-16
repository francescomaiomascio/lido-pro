<script lang="ts">
  import {
    appLanguages,
    getLanguageLabels,
    languageLabels,
    type AppLanguage,
  } from '../../../lib/i18n/languageStore'

  let {
    language,
    onLanguageChange,
  }: {
    language: AppLanguage
    onLanguageChange: (language: AppLanguage) => void
  } = $props()

  const labels = $derived(getLanguageLabels(language))
</script>

<section class="settings-panel" aria-label="Lingua">
  <div class="settings-view-header settings-panel__header">
    <div>
      <h2>{labels.language}</h2>
      <p>Lingua corrente: {languageLabels[language]}. Alcune traduzioni operative restano progressive.</p>
    </div>
  </div>

  <div class="settings-choice-list">
    {#each appLanguages as entry}
      <button
        type="button"
        class:active={entry === language}
        onclick={() => onLanguageChange(entry)}
      >
        <span>{languageLabels[entry]}</span>
        <small>{entry.toUpperCase()}</small>
      </button>
    {/each}
  </div>
</section>
