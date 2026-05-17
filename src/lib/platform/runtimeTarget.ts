import { Capacitor } from '@capacitor/core'

export type RuntimeTarget =
  | 'browser-preview'
  | 'tauri-macos'
  | 'tauri-linux'
  | 'tauri-windows'
  | 'capacitor-android'
  | 'capacitor-ios'
  | 'unknown'

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown
  }
}

const desktopRuntimeTargets: RuntimeTarget[] = ['tauri-macos', 'tauri-linux', 'tauri-windows']
const capacitorRuntimeTargets: RuntimeTarget[] = ['capacitor-android', 'capacitor-ios']

const isTauriRuntime = () => typeof window !== 'undefined' && Boolean(window.__TAURI_INTERNALS__)

const getDesktopPlatformTarget = (): RuntimeTarget => {
  const platform = typeof navigator !== 'undefined' ? navigator.platform.toLowerCase() : ''
  const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent.toLowerCase() : ''
  const fingerprint = `${platform} ${userAgent}`

  if (fingerprint.includes('mac')) {
    return 'tauri-macos'
  }
  if (fingerprint.includes('linux')) {
    return 'tauri-linux'
  }
  if (fingerprint.includes('win')) {
    return 'tauri-windows'
  }

  return 'unknown'
}

export const getRuntimeTarget = (): RuntimeTarget => {
  if (Capacitor.isNativePlatform()) {
    const platform = Capacitor.getPlatform()
    if (platform === 'android') {
      return 'capacitor-android'
    }
    if (platform === 'ios') {
      return 'capacitor-ios'
    }
    return 'unknown'
  }

  if (isTauriRuntime()) {
    return getDesktopPlatformTarget()
  }

  if (typeof window !== 'undefined') {
    return 'browser-preview'
  }

  return 'unknown'
}

export const isDesktopRuntime = (target: RuntimeTarget = getRuntimeTarget()) =>
  desktopRuntimeTargets.includes(target)

export const isBrowserPreview = (target: RuntimeTarget = getRuntimeTarget()) => target === 'browser-preview'

export const isCapacitorRuntime = (target: RuntimeTarget = getRuntimeTarget()) =>
  capacitorRuntimeTargets.includes(target)

export const getRuntimeTargetLabel = (target: RuntimeTarget = getRuntimeTarget()) => {
  switch (target) {
    case 'browser-preview':
      return 'Browser preview'
    case 'tauri-macos':
      return 'Tauri macOS'
    case 'tauri-linux':
      return 'Tauri Linux'
    case 'tauri-windows':
      return 'Tauri Windows'
    case 'capacitor-android':
      return 'Capacitor Android'
    case 'capacitor-ios':
      return 'Capacitor iOS'
    default:
      return 'Runtime sconosciuto'
  }
}
