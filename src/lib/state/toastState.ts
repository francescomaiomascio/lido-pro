export type AppToastMessage = {
  id: string
  message: string
}

const TOAST_EVENT = 'beach-bdf:toast'

export const showToast = (message: string) => {
  window.dispatchEvent(
    new CustomEvent<AppToastMessage>(TOAST_EVENT, {
      detail: {
        id: `toast-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
        message,
      },
    }),
  )
}

export const listenForToasts = (handler: (toast: AppToastMessage) => void) => {
  const listener = (event: Event) => handler((event as CustomEvent<AppToastMessage>).detail)
  window.addEventListener(TOAST_EVENT, listener)
  return () => window.removeEventListener(TOAST_EVENT, listener)
}
