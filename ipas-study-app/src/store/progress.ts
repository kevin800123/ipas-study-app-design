import type { ProgressState, SubjectProgress, QuizHistoryEntry } from '../types'

const KEY = 'ipas-progress-v1'
const empty = (): SubjectProgress => ({ summariesRead: [], quizHistory: [], wrongQuestions: [], bookmarks: [] })

export function loadProgress(): ProgressState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return { version: 1, subjects: {} }
    const parsed = JSON.parse(raw)
    if (parsed && typeof parsed === 'object' && parsed.version === 1 && parsed.subjects) return parsed as ProgressState
  } catch { /* fall through */ }
  return { version: 1, subjects: {} }
}

function save(state: ProgressState): void {
  localStorage.setItem(KEY, JSON.stringify(state))
}

export function getSubjectProgress(subjectId: string): SubjectProgress {
  const state = loadProgress()
  return state.subjects[subjectId] ?? empty()
}

function mutate(subjectId: string, fn: (sp: SubjectProgress) => void): void {
  const state = loadProgress()
  const sp = state.subjects[subjectId] ?? empty()
  fn(sp)
  state.subjects[subjectId] = sp
  save(state)
}

export function addWrongQuestions(subjectId: string, ids: string[]): void {
  mutate(subjectId, (sp) => {
    sp.wrongQuestions = Array.from(new Set([...sp.wrongQuestions, ...ids]))
  })
}

export function removeWrongQuestion(subjectId: string, id: string): void {
  mutate(subjectId, (sp) => {
    sp.wrongQuestions = sp.wrongQuestions.filter((w) => w !== id)
  })
}

export function recordQuiz(subjectId: string, entry: QuizHistoryEntry): void {
  mutate(subjectId, (sp) => { sp.quizHistory = [entry, ...sp.quizHistory] })
}

export function toggleSummaryRead(subjectId: string, chapterId: string): void {
  mutate(subjectId, (sp) => {
    sp.summariesRead = sp.summariesRead.includes(chapterId)
      ? sp.summariesRead.filter((c) => c !== chapterId)
      : [...sp.summariesRead, chapterId]
  })
}

export function exportProgress(): string {
  return JSON.stringify(loadProgress(), null, 2)
}

export function importProgress(json: string): boolean {
  try {
    const parsed = JSON.parse(json)
    if (parsed && parsed.version === 1 && parsed.subjects) {
      save(parsed as ProgressState)
      return true
    }
  } catch { /* ignore */ }
  return false
}
