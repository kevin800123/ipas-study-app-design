import { describe, it, expect } from 'vitest'
import { validateQuestions } from '../../../lib/validateData'
import questions from './questions.json'
import type { Question } from '../../../types'

describe('ai-basics questions', () => {
  it('has no validation errors', () => {
    expect(validateQuestions(questions as Question[])).toEqual([])
  })
  it('has at least the two announced sources', () => {
    const sources = new Set((questions as Question[]).map((q) => q.source))
    expect(sources.has('114-4-official')).toBe(true)
    expect(sources.has('114-09-sample')).toBe(true)
  })
})
