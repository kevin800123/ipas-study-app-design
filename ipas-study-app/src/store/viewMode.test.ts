import { describe, it, expect, beforeEach } from 'vitest'
import { setViewMode, toggleViewMode } from './viewMode'

describe('viewMode store', () => {
  beforeEach(() => localStorage.clear())

  it('persists the selected mode', () => {
    setViewMode('web')
    expect(localStorage.getItem('ipas-view-mode')).toBe('web')
    setViewMode('app')
    expect(localStorage.getItem('ipas-view-mode')).toBe('app')
  })

  it('toggles between app and web', () => {
    setViewMode('app')
    toggleViewMode()
    expect(localStorage.getItem('ipas-view-mode')).toBe('web')
    toggleViewMode()
    expect(localStorage.getItem('ipas-view-mode')).toBe('app')
  })
})
