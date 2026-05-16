import type { BeachItem, BeachItemType } from '../types/beach'

export const BEACH_WIDTH_M = 31
export const BEACH_DEPTH_M = 28
export const DEFAULT_LAYOUT_ID = 'default-layout'

const MARGIN_X_M = 2.0
const PALM_START_Y_M = 3.0
const PALM_ROW_GAP_M = 3.2
const UMBRELLA_START_Y_M = 18.5
const UMBRELLA_ROW_GAP_M = 3.0
const SMALL_PALM_Y_M = 26.0

const ITEM_SIZES: Record<BeachItemType, { widthM: number; heightM: number }> = {
  palm: { widthM: 1.2, heightM: 1.2 },
  umbrella: { widthM: 1.4, heightM: 1.4 },
  small_palm: { widthM: 1.0, heightM: 1.0 },
}

type MetricRowSpec = {
  type: BeachItemType
  rowLabel: string
  rowIndex: number
  count: number
  yM: number
}

const pad = (value: number) => String(value).padStart(2, '0')

const getEvenXPosition = (index: number, count: number): number => {
  const usableWidthM = BEACH_WIDTH_M - MARGIN_X_M * 2

  if (count === 1) {
    return BEACH_WIDTH_M / 2
  }

  return MARGIN_X_M + (usableWidthM / (count - 1)) * index
}

const createMetricRow = ({ type, rowLabel, rowIndex, count, yM }: MetricRowSpec): BeachItem[] => {
  const size = ITEM_SIZES[type]

  return Array.from({ length: count }, (_, index) => {
    const numberIndex = index + 1
    const code = `${rowLabel}-${pad(numberIndex)}`

    return {
      id: `${DEFAULT_LAYOUT_ID}-${code}`,
      layoutId: DEFAULT_LAYOUT_ID,
      code,
      type,
      rowLabel,
      rowIndex,
      numberIndex,
      xM: Number(getEvenXPosition(index, count).toFixed(2)),
      yM,
      widthM: size.widthM,
      heightM: size.heightM,
      rotationDeg: 0,
      status: 'free',
      usageType: 'daily',
      operationalNote: '',
      statusUpdatedAt: null,
      active: true,
    }
  })
}

const createSmallPalms = (): BeachItem[] =>
  createMetricRow({
    type: 'small_palm',
    rowLabel: 'PM',
    rowIndex: 1,
    count: 3,
    yM: SMALL_PALM_Y_M,
  })

export const createInitialMetricBeachItems = (): BeachItem[] => [
  // Approximate starting positions. These are not final survey measurements.
  ...createMetricRow({ type: 'palm', rowLabel: 'P1', rowIndex: 1, count: 8, yM: PALM_START_Y_M }),
  ...createMetricRow({
    type: 'palm',
    rowLabel: 'P2',
    rowIndex: 2,
    count: 9,
    yM: Number((PALM_START_Y_M + PALM_ROW_GAP_M).toFixed(2)),
  }),
  ...createMetricRow({
    type: 'palm',
    rowLabel: 'P3',
    rowIndex: 3,
    count: 9,
    yM: Number((PALM_START_Y_M + PALM_ROW_GAP_M * 2).toFixed(2)),
  }),
  ...createMetricRow({
    type: 'palm',
    rowLabel: 'P4',
    rowIndex: 4,
    count: 8,
    yM: Number((PALM_START_Y_M + PALM_ROW_GAP_M * 3).toFixed(2)),
  }),
  ...createMetricRow({
    type: 'umbrella',
    rowLabel: 'O1',
    rowIndex: 1,
    count: 11,
    yM: UMBRELLA_START_Y_M,
  }),
  ...createMetricRow({
    type: 'umbrella',
    rowLabel: 'O2',
    rowIndex: 2,
    count: 10,
    yM: Number((UMBRELLA_START_Y_M + UMBRELLA_ROW_GAP_M).toFixed(2)),
  }),
  ...createSmallPalms(),
]
