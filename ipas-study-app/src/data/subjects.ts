import type { Subject, Question, SummaryChapter, Level } from '../types'
import aiBasicsSubject from './beginner/ai-basics/subject.json'
import aiBasicsQuestions from './beginner/ai-basics/questions.json'
import aiBasicsSummaries from './beginner/ai-basics/summaries.json'
import aiBasicsExpl from './beginner/ai-basics/explanations.json'
import genaiSubject from './beginner/genai/subject.json'
import genaiQuestions from './beginner/genai/questions.json'
import genaiSummaries from './beginner/genai/summaries.json'
import genaiExpl from './beginner/genai/explanations.json'
import aiTechSubject from './intermediate/ai-tech/subject.json'
import aiTechQuestions from './intermediate/ai-tech/questions.json'
import aiTechSummaries from './intermediate/ai-tech/summaries.json'
import aiTechExpl from './intermediate/ai-tech/explanations.json'
import bigDataSubject from './intermediate/big-data/subject.json'
import bigDataQuestions from './intermediate/big-data/questions.json'
import bigDataSummaries from './intermediate/big-data/summaries.json'
import bigDataExpl from './intermediate/big-data/explanations.json'
import mlTechSubject from './intermediate/ml-tech/subject.json'
import mlTechQuestions from './intermediate/ml-tech/questions.json'
import mlTechSummaries from './intermediate/ml-tech/summaries.json'
import mlTechExpl from './intermediate/ml-tech/explanations.json'

interface Bundle {
  subject: Subject
  questions: Question[]
  summaries: SummaryChapter[]
}

type ExplMap = Record<string, string>

// Explanations are authored separately (id -> text) and merged here, so the
// large questions.json files stay untouched while content is filled in over time.
function withExplanations(questions: Question[], map: ExplMap): Question[] {
  return questions.map((q) => (map[q.id] ? { ...q, explanation: map[q.id] } : q))
}

const REGISTRY: Record<string, Bundle> = {
  'ai-basics': {
    subject: aiBasicsSubject as Subject,
    questions: withExplanations(aiBasicsQuestions as Question[], aiBasicsExpl),
    summaries: aiBasicsSummaries as SummaryChapter[],
  },
  genai: {
    subject: genaiSubject as Subject,
    questions: withExplanations(genaiQuestions as Question[], genaiExpl),
    summaries: genaiSummaries as SummaryChapter[],
  },
  'ai-tech': {
    subject: aiTechSubject as Subject,
    questions: withExplanations(aiTechQuestions as Question[], aiTechExpl),
    summaries: aiTechSummaries as SummaryChapter[],
  },
  'big-data': {
    subject: bigDataSubject as Subject,
    questions: withExplanations(bigDataQuestions as Question[], bigDataExpl),
    summaries: bigDataSummaries as SummaryChapter[],
  },
  'ml-tech': {
    subject: mlTechSubject as Subject,
    questions: withExplanations(mlTechQuestions as Question[], mlTechExpl),
    summaries: mlTechSummaries as SummaryChapter[],
  },
}

export const LEVEL_ORDER: Level[] = ['beginner', 'intermediate']

export function listSubjects(level: Level): Subject[] {
  return Object.values(REGISTRY).map((b) => b.subject).filter((s) => s.level === level)
}
export function allSubjects(): Subject[] {
  return Object.values(REGISTRY).map((b) => b.subject)
}
export function getSubject(id: string): Subject | undefined { return REGISTRY[id]?.subject }
export function getQuestions(id: string): Question[] { return REGISTRY[id]?.questions ?? [] }
export function getSummaries(id: string): SummaryChapter[] { return REGISTRY[id]?.summaries ?? [] }
