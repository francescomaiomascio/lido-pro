export type SettingsSection =
  | 'customers'
  | 'tariffs'
  | 'extras'
  | 'registry'
  | 'system'
  | 'beach-parametric-setup'
  | 'beach-configuration'
  | 'beach-dimensions-capacity'
  | 'beach-surface-zones'
  | 'beach-distances-distribution'
  | 'beach-measurements-grid'
  | 'beach-surface'
  | 'beach-rendering-elements'
  | 'beach-assets'
  | 'beach-library-umbrellas'
  | 'beach-library-palms'
  | 'beach-library-furniture'
  | 'beach-library-map-items'
  | 'beach-library-icons-symbols'
  | 'beach-walkways'
  | 'beach-walkway-materials'
  | 'beach-unusable-areas'
  | 'beach-services-obstacles'
  | 'beach-layout-rules'
  | 'beach-layout-validation'
  | 'beach-layout-versions'
  | 'beach-edit-mode'
  | 'language'
  | 'theme'
  | 'diagnostics'
  | 'version'

export type SettingsMenuState = {
  open: boolean
  activeSection: SettingsSection
  mobileDetailOpen: boolean
}

export const createSettingsMenuState = (): SettingsMenuState => ({
  open: false,
  activeSection: 'system',
  mobileDetailOpen: false,
})
