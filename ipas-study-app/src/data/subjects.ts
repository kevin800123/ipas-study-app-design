import type { Subject, Question, SummaryChapter, Level } from '../types'
import aiBasicsSubject from './beginner/ai-basics/subject.json'
import aiBasicsQuestions from './beginner/ai-basics/questions.json'
import aiBasicsSummaries from './beginner/ai-basics/summaries.json'
import genaiSubject from './beginner/genai/subject.json'
import genaiQuestions from './beginner/genai/questions.json'
import genaiSummaries from './beginner/genai/summaries.json'

interface Bundle {
  subject: Subject
  questions: Question[]
  summaries: SummaryChapter[]
}

const REGISTRY: Record<string, Bundle> = {
  'ai-basics': {
    subject: aiBasicsSubject as Subject,
    questions: aiBasicsQuestions as Question[],
    summaries: aiBasicsSummaries as SummaryChapter[],
  },
  genai: {
    subject: genaiSubject as Subject,
    questions: genaiQuestions as Question[],
    summaries: genaiSummaries as SummaryChapter[],
  },
}

export function listSubjects(level: Level): Subject[] {
  return Object.values(REGISTRY).map((b) => b.subject).filter((s) => s.level === level)
}
export function getSubject(id: string): Subject | undefined { return REGISTRY[id]?.subject }
export function getQuestions(id: string): Question[] { return REGISTRY[id]?.questions ?? [] }
export function getSummaries(id: string): SummaryChapter[] { return REGISTRY[id]?.summaries ?? [] }
