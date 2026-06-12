import { describe, it, expect } from 'vitest'
import type { Question, ProgressState } from './types'

describe('types', () => {
  it('a Question literal matches the interface', () => {
    const q: Question = {
      id: 'B1-Q001', level: 'beginner', subject: 'ai-basics',
      source: '114-4-official', stem: 'x',
      options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }],
      answer: 'B', tags: [],
    }
    expect(q.answer).toBe('B')
  })

  it('a ProgressState literal matches the interface', () => {
    const p: ProgressState = { version: 1, subjects: {} }
    expect(p.version).toBe(1)
  })
})
