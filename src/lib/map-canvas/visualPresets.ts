import type { MapBackgroundPreset } from './config'

export interface MapBackgroundPalette {
  waterTop: string
  waterEdge: string
  waterDepth: string
  shoreFoam: string
  sandTop: string
  sandMiddle: string
  sandBottom: string
  surfaceWash: string
  highlight: string
  shade: string
  vignette: string
  boundaryWork: string
  boundaryEdit: string
  gridMinor: string
  gridMajor: string
  textureLight: string
  textureDark: string
  textureWater: string
  textureIntensity: number
  labelContrastHint: 'light' | 'dark'
}

export const mapBackgroundPalettes: Record<MapBackgroundPreset, MapBackgroundPalette> = {
  warm_sand: {
    waterTop: '#79ccd7',
    waterEdge: '#cfeee8',
    waterDepth: '#4fb2c5',
    shoreFoam: 'rgb(251 251 232 / 0.78)',
    sandTop: '#f0e2b3',
    sandMiddle: '#e6d198',
    sandBottom: '#caa15f',
    surfaceWash: 'rgb(255 248 218 / 0.26)',
    highlight: 'rgb(255 255 255 / 0.2)',
    shade: 'rgb(91 69 36 / 0.15)',
    vignette: 'rgb(78 58 28 / 0.18)',
    boundaryWork: 'rgb(68 76 61 / 0.1)',
    boundaryEdit: 'rgb(18 68 76 / 0.46)',
    gridMinor: 'rgb(255 255 255 / 0.5)',
    gridMajor: 'rgb(255 255 255 / 0.64)',
    textureLight: 'rgb(255 255 245 / 0.22)',
    textureDark: 'rgb(113 87 42 / 0.12)',
    textureWater: 'rgb(255 255 255 / 0.18)',
    textureIntensity: 0.82,
    labelContrastHint: 'dark',
  },
  soft_aqua: {
    waterTop: '#83d3dc',
    waterEdge: '#e2f4ef',
    waterDepth: '#5baebd',
    shoreFoam: 'rgb(242 253 243 / 0.74)',
    sandTop: '#eadfbd',
    sandMiddle: '#ded0a4',
    sandBottom: '#c5b27b',
    surfaceWash: 'rgb(223 247 238 / 0.2)',
    highlight: 'rgb(255 255 255 / 0.24)',
    shade: 'rgb(41 82 85 / 0.13)',
    vignette: 'rgb(37 78 82 / 0.15)',
    boundaryWork: 'rgb(33 76 79 / 0.11)',
    boundaryEdit: 'rgb(19 88 94 / 0.5)',
    gridMinor: 'rgb(236 255 250 / 0.46)',
    gridMajor: 'rgb(255 255 255 / 0.62)',
    textureLight: 'rgb(255 255 255 / 0.22)',
    textureDark: 'rgb(52 83 72 / 0.1)',
    textureWater: 'rgb(236 255 250 / 0.2)',
    textureIntensity: 0.76,
    labelContrastHint: 'dark',
  },
  neutral: {
    waterTop: '#9ac4c4',
    waterEdge: '#e3e5d9',
    waterDepth: '#779fa0',
    shoreFoam: 'rgb(243 241 222 / 0.7)',
    sandTop: '#ddd1ad',
    sandMiddle: '#d2c39a',
    sandBottom: '#b7a275',
    surfaceWash: 'rgb(255 255 245 / 0.18)',
    highlight: 'rgb(255 255 255 / 0.18)',
    shade: 'rgb(60 55 47 / 0.16)',
    vignette: 'rgb(54 50 43 / 0.17)',
    boundaryWork: 'rgb(73 70 61 / 0.11)',
    boundaryEdit: 'rgb(53 80 80 / 0.48)',
    gridMinor: 'rgb(255 255 255 / 0.42)',
    gridMajor: 'rgb(255 255 255 / 0.56)',
    textureLight: 'rgb(255 255 245 / 0.18)',
    textureDark: 'rgb(75 68 52 / 0.1)',
    textureWater: 'rgb(238 247 244 / 0.16)',
    textureIntensity: 0.7,
    labelContrastHint: 'dark',
  },
  muted_dark: {
    waterTop: '#426f75',
    waterEdge: '#80968b',
    waterDepth: '#2f5962',
    shoreFoam: 'rgb(154 165 140 / 0.56)',
    sandTop: '#9b8b63',
    sandMiddle: '#867653',
    sandBottom: '#66583e',
    surfaceWash: 'rgb(255 255 255 / 0.06)',
    highlight: 'rgb(255 255 255 / 0.1)',
    shade: 'rgb(18 24 26 / 0.24)',
    vignette: 'rgb(11 17 18 / 0.3)',
    boundaryWork: 'rgb(220 235 224 / 0.11)',
    boundaryEdit: 'rgb(231 225 169 / 0.5)',
    gridMinor: 'rgb(245 255 239 / 0.26)',
    gridMajor: 'rgb(255 255 235 / 0.42)',
    textureLight: 'rgb(255 255 230 / 0.12)',
    textureDark: 'rgb(17 24 22 / 0.18)',
    textureWater: 'rgb(220 245 245 / 0.1)',
    textureIntensity: 0.62,
    labelContrastHint: 'light',
  },
  clean_light: {
    waterTop: '#b4dfe4',
    waterEdge: '#eff7ee',
    waterDepth: '#95cfd8',
    shoreFoam: 'rgb(255 255 244 / 0.82)',
    sandTop: '#efe7cc',
    sandMiddle: '#e8ddb9',
    sandBottom: '#d8c798',
    surfaceWash: 'rgb(255 255 255 / 0.26)',
    highlight: 'rgb(255 255 255 / 0.3)',
    shade: 'rgb(105 97 77 / 0.1)',
    vignette: 'rgb(101 93 75 / 0.11)',
    boundaryWork: 'rgb(86 94 84 / 0.09)',
    boundaryEdit: 'rgb(31 84 88 / 0.42)',
    gridMinor: 'rgb(255 255 255 / 0.48)',
    gridMajor: 'rgb(255 255 255 / 0.62)',
    textureLight: 'rgb(255 255 255 / 0.2)',
    textureDark: 'rgb(122 113 83 / 0.08)',
    textureWater: 'rgb(255 255 255 / 0.18)',
    textureIntensity: 0.56,
    labelContrastHint: 'dark',
  },
}

export const getMapBackgroundPalette = (preset: MapBackgroundPreset): MapBackgroundPalette =>
  mapBackgroundPalettes[preset] ?? mapBackgroundPalettes.warm_sand
