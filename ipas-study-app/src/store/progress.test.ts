import { describe, it, expect, beforeEach } from 'vitest'
import { loadProgress, getSubjectProgress, addWrongQuestions, recordQuiz, toggleSummaryRead, exportProgress, importProgress } from './progress'

beforeEach(() => localStorage.clear())

describe('progress store', () => {
  it('returns an empty subject progress by default', () => {
    const sp = getSubjectProgress('ai-basics')
    expect(sp.wrongQuestions).toEqual([])
    expect(sp.quizHistory).toEqual([])
  })

  it('adds wrong questions without duplicates', () => {
    addWrongQuestions('ai-basics', ['q1', 'q2'])
    addWrongQuestions('ai-basics', ['q2', 'q3'])
    expect(getSubjectProgress('ai-basics').wrongQuestions).toEqual(['q1', 'q2', 'q3'])
  })

  it('records a quiz into history', () => {
    recordQuiz('ai-basics', { date: '2026-06-12', mode: 'mock', score: 80, correct: 40, total: 50 })
    expect(getSubjectProgress('ai-basics').quizHistory).toHaveLength(1)
  })

  it('toggles a summary read flag', () => {
    toggleSummaryRead('ai-basics', 'ch1')
    expect(getSubjectProgress('ai-basics').summariesRead).toContain('ch1')
    toggleSummaryRead('ai-basics', 'ch1')
    expect(getSubjectProgress('ai-basics').summariesRead).not.toContain('ch1')
  })

  it('round-trips through export/import', () => {
    addWrongQuestions('ai-basics', ['q1'])
    const json = exportProgress()
    localStorage.clear()
    importProgress(json)
    expect(getSubjectProgress('ai-basics').wrongQuestions).toEqual(['q1'])
  })

  it('rejects malformed import without throwing', () => {
    expect(importProgress('not json')).toBe(false)
    expect(loadProgress().version).toBe(1)
  })
})
