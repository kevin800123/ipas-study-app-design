import { describe, it, expect } from 'vitest'
import { validateQuestions } from '../../../lib/validateData'
import questions from './questions.json'
import type { Question } from '../../../types'

describe('genai questions', () => {
  it('has no validation errors', () => {
    expect(validateQuestions(questions as Question[])).toEqual([])
  })
  it('every question belongs to the genai subject', () => {
    expect((questions as Question[]).every((q) => q.subject === 'genai')).toBe(true)
  })
})
