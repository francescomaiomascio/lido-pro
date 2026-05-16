export type DeviceProfile = 'phone' | 'tablet'

export const getDeviceProfile = (width = window.innerWidth): DeviceProfile =>
  width >= 900 ? 'tablet' : 'phone'
