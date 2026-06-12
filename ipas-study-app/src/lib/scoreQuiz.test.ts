import { describe, it, expect } from 'vitest'
import { scoreQuiz } from './scoreQuiz'
import type { Question, ExamFormat } from '../types'

const fmt: ExamFormat = { questionCount: 2, minutes: 60, passScore: 60, pointsPerQuestion: 50 }
const qs: Question[] = [
  { id: 'q1', level: 'beginner', subject: 's', source: 'x', stem: '', options: [{ key: 'A', text: '' }, { key: 'B', text: '' }], answer: 'A', tags: [] },
  { id: 'q2', level: 'beginner', subject: 's', source: 'x', stem: '', options: [{ key: 'A', text: '' }, { key: 'B', text: '' }], answer: 'B', tags: [] },
]

describe('scoreQuiz', () => {
  it('scores all correct as full marks and pass', () => {
    const r = scoreQuiz(qs, { q1: 'A', q2: 'B' }, fmt)
    expect(r.correct).toBe(2)
    expect(r.score).toBe(100)
    expect(r.pass).toBe(true)
  })

  it('scores all wrong as zero and fail', () => {
    const r = scoreQuiz(qs, { q1: 'B', q2: 'A' }, fmt)
    expect(r.correct).toBe(0)
    expect(r.score).toBe(0)
    expect(r.pass).toBe(false)
  })

  it('treats missing answer as null and incorrect', () => {
    const r = scoreQuiz(qs, { q1: 'A' }, fmt)
    expect(r.correct).toBe(1)
    expect(r.score).toBe(50)
    expect(r.details[1].selected).toBeNull()
    expect(r.details[1].isCorrect).toBe(false)
  })

  it('passes exactly at the threshold', () => {
    const r = scoreQuiz(qs, { q1: 'A' }, { ...fmt, passScore: 50 })
    expect(r.pass).toBe(true)
  })
})
