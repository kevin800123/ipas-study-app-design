import { describe, it, expect } from 'vitest'
import { validateQuestions } from './validateData'
import type { Question } from '../types'

const ok: Question = { id: 'q1', level: 'beginner', subject: 's', source: 'x', stem: 'a',
  options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], answer: 'A', tags: [] }

describe('validateQuestions', () => {
  it('accepts a valid set', () => {
    expect(validateQuestions([ok])).toEqual([])
  })
  it('flags an answer not present in options', () => {
    const bad = { ...ok, id: 'q2', answer: 'D' as const }
    expect(validateQuestions([bad])[0]).toMatch(/answer/i)
  })
  it('flags duplicate ids', () => {
    expect(validateQuestions([ok, { ...ok }]).some((e) => /duplicate/i.test(e))).toBe(true)
  })
  it('flags missing stem', () => {
    expect(validateQuestions([{ ...ok, id: 'q3', stem: '' }]).some((e) => /stem/i.test(e))).toBe(true)
  })
})
