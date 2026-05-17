import { Capacitor } from '@capacitor/core'
import { mount } from 'svelte'
import { defineCustomElements } from 'jeep-sqlite/loader'
import './styles/tokens.css'
import './styles/base.css'
import './styles/buttons.css'
import './styles/forms.css'
import './styles/responsive.css'
import './styles/shell.css'
import './styles/loading.css'
import './styles/beach-map.css'
import './styles/beach-list.css'
import './styles/panels.css'
import './styles/settings.css'
import './styles/registry.css'
import './styles/operational-editors.css'
import './styles/booking-sheet.css'
import './styles/features/map-tools.css'
import './styles/features/settings-ui.css'
import './styles/features/beach-library.css'
import './styles/features/beach-construction.css'
import './styles/features/map-studio-dashboard.css'
import './styles/features/map-studio.css'
import './styles/features/canvas-studio.css'
import App from './App.svelte'

if (!Capacitor.isNativePlatform()) {
  defineCustomElements(window)

  const existingJeepSqlite = document.querySelector('jeep-sqlite') as
    | (HTMLElement & { autoSave?: boolean; wasmPath?: string })
    | null
  const jeepSqlite =
    existingJeepSqlite ??
    (document.createElement('jeep-sqlite') as HTMLElement & {
      autoSave?: boolean
      wasmPath?: string
    })

  jeepSqlite.autoSave = true
  jeepSqlite.wasmPath = '/assets'
  jeepSqlite.setAttribute('autoSave', 'true')
  jeepSqlite.setAttribute('wasmPath', '/assets')
  Object.assign(jeepSqlite.style, {
    position: 'fixed',
    right: '0',
    bottom: '0',
    width: '1px',
    height: '1px',
    overflow: 'hidden',
    opacity: '0',
    pointerEvents: 'none',
    zIndex: '-1',
  })

  if (!existingJeepSqlite) {
    document.body.appendChild(jeepSqlite)
  }
}

const app = mount(App, {
  target: document.getElementById('app')!,
})

export default app
