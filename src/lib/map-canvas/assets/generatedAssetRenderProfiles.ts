export type AssetLabelAnchor = 'center' | 'top' | 'bottom' | 'above' | 'below'

export type GeneratedAssetVisualWeight = 'light' | 'medium' | 'strong'

export interface GeneratedAssetRenderProfile {
  assetId: string
  renderScale: number
  minScreenPx: number
  maxScreenPx: number
  spritePaddingPx: number
  shadowScale: number
  shadowAlpha: number
  labelAnchor: AssetLabelAnchor
  labelOffsetPx: number
  labelMaxWidthRatio: number
  labelFontScale: number
  ringScale: number
  visualWeight: GeneratedAssetVisualWeight
}

const generatedAssetRenderProfiles: Record<string, GeneratedAssetRenderProfile> = {
  umbrella_classic_top: {
    assetId: 'umbrella_classic_top',
    renderScale: 1.36,
    minScreenPx: 56,
    maxScreenPx: 104,
    spritePaddingPx: 0,
    shadowScale: 0.9,
    shadowAlpha: 0.18,
    labelAnchor: 'below',
    labelOffsetPx: 5,
    labelMaxWidthRatio: 1.05,
    labelFontScale: 0.76,
    ringScale: 1.06,
    visualWeight: 'strong',
  },
  umbrella_striped_top: {
    assetId: 'umbrella_striped_top',
    renderScale: 1.36,
    minScreenPx: 56,
    maxScreenPx: 104,
    spritePaddingPx: 0,
    shadowScale: 0.9,
    shadowAlpha: 0.18,
    labelAnchor: 'below',
    labelOffsetPx: 5,
    labelMaxWidthRatio: 1.05,
    labelFontScale: 0.76,
    ringScale: 1.06,
    visualWeight: 'strong',
  },
  umbrella_premium_top: {
    assetId: 'umbrella_premium_top',
    renderScale: 1.42,
    minScreenPx: 60,
    maxScreenPx: 112,
    spritePaddingPx: 0,
    shadowScale: 0.92,
    shadowAlpha: 0.19,
    labelAnchor: 'below',
    labelOffsetPx: 5,
    labelMaxWidthRatio: 1.05,
    labelFontScale: 0.76,
    ringScale: 1.06,
    visualWeight: 'strong',
  },
  palm_large_top: {
    assetId: 'palm_large_top',
    renderScale: 1.58,
    minScreenPx: 54,
    maxScreenPx: 104,
    spritePaddingPx: 0,
    shadowScale: 0.56,
    shadowAlpha: 0.07,
    labelAnchor: 'below',
    labelOffsetPx: 5,
    labelMaxWidthRatio: 1.0,
    labelFontScale: 0.72,
    ringScale: 1.04,
    visualWeight: 'strong',
  },
  palm_medium_top: {
    assetId: 'palm_medium_top',
    renderScale: 1.44,
    minScreenPx: 48,
    maxScreenPx: 92,
    spritePaddingPx: 0,
    shadowScale: 0.52,
    shadowAlpha: 0.065,
    labelAnchor: 'below',
    labelOffsetPx: 5,
    labelMaxWidthRatio: 1.0,
    labelFontScale: 0.7,
    ringScale: 1.03,
    visualWeight: 'medium',
  },
  palm_small_top: {
    assetId: 'palm_small_top',
    renderScale: 1.34,
    minScreenPx: 40,
    maxScreenPx: 72,
    spritePaddingPx: 0,
    shadowScale: 0.46,
    shadowAlpha: 0.055,
    labelAnchor: 'below',
    labelOffsetPx: 4,
    labelMaxWidthRatio: 1.0,
    labelFontScale: 0.66,
    ringScale: 1.02,
    visualWeight: 'medium',
  },
  sunbed_top: {
    assetId: 'sunbed_top',
    renderScale: 1,
    minScreenPx: 28,
    maxScreenPx: 80,
    spritePaddingPx: 1,
    shadowScale: 0.7,
    shadowAlpha: 0.14,
    labelAnchor: 'above',
    labelOffsetPx: 4,
    labelMaxWidthRatio: 0.74,
    labelFontScale: 0.74,
    ringScale: 1.04,
    visualWeight: 'medium',
  },
  deck_chair_top: {
    assetId: 'deck_chair_top',
    renderScale: 1,
    minScreenPx: 26,
    maxScreenPx: 72,
    spritePaddingPx: 1,
    shadowScale: 0.68,
    shadowAlpha: 0.14,
    labelAnchor: 'above',
    labelOffsetPx: 4,
    labelMaxWidthRatio: 0.74,
    labelFontScale: 0.72,
    ringScale: 1.04,
    visualWeight: 'medium',
  },
  chair_top: {
    assetId: 'chair_top',
    renderScale: 1,
    minScreenPx: 24,
    maxScreenPx: 58,
    spritePaddingPx: 1,
    shadowScale: 0.58,
    shadowAlpha: 0.12,
    labelAnchor: 'above',
    labelOffsetPx: 4,
    labelMaxWidthRatio: 0.7,
    labelFontScale: 0.68,
    ringScale: 1.04,
    visualWeight: 'light',
  },
  table_top: {
    assetId: 'table_top',
    renderScale: 1,
    minScreenPx: 24,
    maxScreenPx: 58,
    spritePaddingPx: 1,
    shadowScale: 0.58,
    shadowAlpha: 0.12,
    labelAnchor: 'above',
    labelOffsetPx: 4,
    labelMaxWidthRatio: 0.7,
    labelFontScale: 0.68,
    ringScale: 1.04,
    visualWeight: 'light',
  },
  walkway_wood_tile: {
    assetId: 'walkway_wood_tile',
    renderScale: 1,
    minScreenPx: 28,
    maxScreenPx: 86,
    spritePaddingPx: 1,
    shadowScale: 0.68,
    shadowAlpha: 0.12,
    labelAnchor: 'above',
    labelOffsetPx: 4,
    labelMaxWidthRatio: 0.78,
    labelFontScale: 0.7,
    ringScale: 1.03,
    visualWeight: 'medium',
  },
  walkway_bamboo_tile: {
    assetId: 'walkway_bamboo_tile',
    renderScale: 1,
    minScreenPx: 28,
    maxScreenPx: 82,
    spritePaddingPx: 1,
    shadowScale: 0.66,
    shadowAlpha: 0.12,
    labelAnchor: 'above',
    labelOffsetPx: 4,
    labelMaxWidthRatio: 0.78,
    labelFontScale: 0.7,
    ringScale: 1.03,
    visualWeight: 'medium',
  },
  walkway_modular_tile: {
    assetId: 'walkway_modular_tile',
    renderScale: 1,
    minScreenPx: 28,
    maxScreenPx: 72,
    spritePaddingPx: 1,
    shadowScale: 0.64,
    shadowAlpha: 0.12,
    labelAnchor: 'above',
    labelOffsetPx: 4,
    labelMaxWidthRatio: 0.76,
    labelFontScale: 0.7,
    ringScale: 1.03,
    visualWeight: 'medium',
  },
}

const fallbackProfile: GeneratedAssetRenderProfile = {
  assetId: 'fallback',
  renderScale: 1,
  minScreenPx: 30,
  maxScreenPx: 76,
  spritePaddingPx: 1,
  shadowScale: 0.7,
  shadowAlpha: 0.14,
  labelAnchor: 'center',
  labelOffsetPx: 0,
  labelMaxWidthRatio: 0.72,
  labelFontScale: 0.8,
  ringScale: 1.04,
  visualWeight: 'medium',
}

export function getGeneratedAssetRenderProfile(assetId: string | null): GeneratedAssetRenderProfile {
  return (assetId && generatedAssetRenderProfiles[assetId]) || fallbackProfile
}

export function getProfiledGeneratedAssetSize(input: {
  widthPx: number
  heightPx: number
  profile: GeneratedAssetRenderProfile
}): { widthPx: number; heightPx: number } {
  const aspectRatio = input.widthPx > 0 && input.heightPx > 0 ? input.widthPx / input.heightPx : 1
  const baseSizePx = Math.max(input.widthPx, input.heightPx) * input.profile.renderScale
  const clampedSizePx = Math.min(input.profile.maxScreenPx, Math.max(input.profile.minScreenPx, baseSizePx))

  if (aspectRatio >= 1) {
    return {
      widthPx: clampedSizePx,
      heightPx: clampedSizePx / aspectRatio,
    }
  }

  return {
    widthPx: clampedSizePx * aspectRatio,
    heightPx: clampedSizePx,
  }
}
