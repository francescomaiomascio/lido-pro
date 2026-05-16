import type { BeachItem, BeachLayout } from '../types/beach'

export const toPercentX = (item: BeachItem, layout: BeachLayout): number =>
  (item.xM / layout.widthM) * 100

export const toPercentY = (item: BeachItem, layout: BeachLayout): number =>
  (item.yM / layout.depthM) * 100

export const toPercentWidth = (item: BeachItem, layout: BeachLayout): number =>
  (item.widthM / layout.widthM) * 100

export const toPercentHeight = (item: BeachItem, layout: BeachLayout): number =>
  (item.heightM / layout.depthM) * 100
