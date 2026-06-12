import { describe, it, expect } from 'vitest'
import { getSubject, getQuestions, getSummaries, listSubjects } from './subjects'

describe('subjects registry', () => {
  it('lists the two beginner subjects', () => {
    expect(listSubjects('beginner').map((s) => s.id).sort()).toEqual(['ai-basics', 'genai'])
  })
  it('resolves a subject config', () => {
    expect(getSubject('ai-basics')?.title).toBe('人工智慧基礎概論')
  })
  it('resolves questions and summaries arrays', () => {
    expect(Array.isArray(getQuestions('ai-basics'))).toBe(true)
    expect(Array.isArray(getSummaries('ai-basics'))).toBe(true)
  })
})
