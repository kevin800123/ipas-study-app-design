import { describe, it, expect } from 'vitest'
import { validateQuestions } from '../../lib/validateData'
import type { Question, SummaryChapter } from '../../types'
import aiTechQ from './ai-tech/questions.json'
import aiTechE from './ai-tech/explanations.json'
import aiTechS from './ai-tech/summaries.json'
import bigDataQ from './big-data/questions.json'
import bigDataE from './big-data/explanations.json'
import bigDataS from './big-data/summaries.json'
import mlTechQ from './ml-tech/questions.json'
import mlTechE from './ml-tech/explanations.json'
import mlTechS from './ml-tech/summaries.json'

const subjects = [
  { id: 'ai-tech', q: aiTechQ as Question[], e: aiTechE as Record<string, string>, s: aiTechS as SummaryChapter[] },
  { id: 'big-data', q: bigDataQ as Question[], e: bigDataE as Record<string, string>, s: bigDataS as SummaryChapter[] },
  { id: 'ml-tech', q: mlTechQ as Question[], e: mlTechE as Record<string, string>, s: mlTechS as SummaryChapter[] },
]

describe('intermediate question bank', () => {
  for (const sub of subjects) {
    it(`${sub.id} has no validation errors`, () => {
      expect(validateQuestions(sub.q)).toEqual([])
    })
    it(`${sub.id} questions all have 4 options with answer A-D`, () => {
      expect(sub.q.every((x) => x.options.length === 4 && 'ABCD'.includes(x.answer))).toBe(true)
    })
    it(`${sub.id} explanations all reference real question ids`, () => {
      const ids = new Set(sub.q.map((x) => x.id))
      expect(Object.keys(sub.e).every((id) => ids.has(id))).toBe(true)
    })
    it(`${sub.id} summaries are well-formed`, () => {
      expect(sub.s.every((c) => c.subject === sub.id && c.title.length > 0 && c.blocks.length > 0)).toBe(true)
    })
  }
})
