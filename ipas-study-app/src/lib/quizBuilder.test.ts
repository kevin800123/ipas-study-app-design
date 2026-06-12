import { describe, it, expect } from 'vitest'
import { takeQuestions, shuffleOptions } from './quizBuilder'
import type { Question } from '../types'

function make(id: string): Question {
  return { id, level: 'beginner', subject: 's', source: 'x', stem: '',
    options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }, { key: 'C', text: 'c' }, { key: 'D', text: 'd' }],
    answer: 'A', tags: [] }
}

describe('takeQuestions', () => {
  it('returns at most n questions', () => {
    const pool = [make('1'), make('2'), make('3')]
    expect(takeQuestions(pool, 2, () => 0)).toHaveLength(2)
  })
  it('returns the whole pool when n exceeds size', () => {
    const pool = [make('1'), make('2')]
    expect(takeQuestions(pool, 10, () => 0)).toHaveLength(2)
  })
})

describe('shuffleOptions', () => {
  it('keeps the answer text pointing at the same option after reordering', () => {
    const q = make('1')
    const s = shuffleOptions(q, () => 0.99)
    const answerText = q.options.find((o) => o.key === q.answer)!.text
    const newAnswerText = s.options.find((o) => o.key === s.answer)!.text
    expect(newAnswerText).toBe(answerText)
    expect(s.options).toHaveLength(4)
  })
})
