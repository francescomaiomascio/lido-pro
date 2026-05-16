import {
  generatedBeachAssets,
  type GeneratedBeachAsset,
} from '../library/generatedAssetManifest'
import type { GeneratedCanvasSpriteId } from './defaultAssetVariants'

export type GeneratedCanvasSpriteImage = HTMLImageElement | ImageBitmap

export type GeneratedSpriteLoadState = 'idle' | 'loading' | 'ready' | 'error'

interface GeneratedSpriteRecord {
  asset: GeneratedBeachAsset
  image: GeneratedCanvasSpriteImage | null
  state: GeneratedSpriteLoadState
}

const generatedSpriteRecords = new Map<string, GeneratedSpriteRecord>(
  generatedBeachAssets.map((asset) => [
    asset.id,
    {
      asset,
      image: null,
      state: 'idle',
    },
  ]),
)

let preloadPromise: Promise<void> | null = null

export function preloadGeneratedCanvasSprites(): Promise<void> {
  if (!preloadPromise) {
    preloadPromise = Promise.all([...generatedSpriteRecords.values()].map(loadSpriteRecord)).then(
      () => undefined,
    )
  }

  return preloadPromise
}

export function getGeneratedCanvasSprite(
  spriteId: GeneratedCanvasSpriteId,
): GeneratedCanvasSpriteImage | null {
  const record = generatedSpriteRecords.get(spriteId)
  return record?.state === 'ready' ? record.image : null
}

export function getGeneratedCanvasSpriteLoadState(
  spriteId: GeneratedCanvasSpriteId,
): GeneratedSpriteLoadState {
  return generatedSpriteRecords.get(spriteId)?.state ?? 'error'
}

function loadSpriteRecord(record: GeneratedSpriteRecord): Promise<void> {
  if (record.state === 'ready' || record.state === 'loading') {
    return Promise.resolve()
  }

  record.state = 'loading'

  return loadImage(record.asset.url)
    .then((image) => {
      record.image = image
      record.state = 'ready'
    })
    .catch(() => {
      record.image = null
      record.state = 'error'
    })
}

function loadImage(src: string): Promise<GeneratedCanvasSpriteImage> {
  if (typeof window === 'undefined') {
    return Promise.reject(new Error('Generated sprites can only load in the browser.'))
  }

  return new Promise((resolve, reject) => {
    const image = new Image()
    image.decoding = 'async'
    image.onload = async () => {
      if ('createImageBitmap' in window) {
        try {
          resolve(await createImageBitmap(image))
          return
        } catch {
          // Fall back to the loaded HTMLImageElement below.
        }
      }
      resolve(image)
    }
    image.onerror = () => reject(new Error(`Failed to load generated sprite: ${src}`))
    image.src = src
  })
}
