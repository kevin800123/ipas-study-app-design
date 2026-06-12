import { describe, it, expect } from 'vitest'
import ai from './ai-basics/summaries.json'
import ga from './genai/summaries.json'
import type { SummaryChapter } from '../../types'

const allValid = (chapters: SummaryChapter[], subject: string) =>
  chapters.every((c) => c.subject === subject && c.title.length > 0 && c.blocks.length > 0)

describe('summaries', () => {
  it('ai-basics chapters are well-formed', () => {
    expect(allValid(ai as SummaryChapter[], 'ai-basics')).toBe(true)
  })
  it('genai chapters are well-formed', () => {
    expect(allValid(ga as SummaryChapter[], 'genai')).toBe(true)
  })
})
