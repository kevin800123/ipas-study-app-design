import { useSyncExternalStore } from 'react'

export type ViewMode = 'app' | 'web'

const KEY = 'ipas-view-mode'
const listeners = new Set<() => void>()

function read(): ViewMode {
  if (typeof localStorage === 'undefined') return 'app'
  return localStorage.getItem(KEY) === 'web' ? 'web' : 'app'
}

let current: ViewMode = read()

function emit() {
  listeners.forEach((l) => l())
}

export function setViewMode(mode: ViewMode) {
  current = mode
  try {
    localStorage.setItem(KEY, mode)
  } catch {
    /* ignore quota / unavailable storage */
  }
  emit()
}

export function toggleViewMode() {
  setViewMode(current === 'app' ? 'web' : 'app')
}

export function useViewMode(): ViewMode {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb)
      return () => listeners.delete(cb)
    },
    () => current,
    () => 'app',
  )
}
