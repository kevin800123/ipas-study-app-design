import type { Question, ExamFormat, OptionKey, QuizResult, QuizResultDetail } from '../types'

export function scoreQuiz(
  questions: Question[],
  answers: Record<string, OptionKey | null>,
  fmt: ExamFormat,
): QuizResult {
  const details: QuizResultDetail[] = questions.map((q) => {
    const selected = answers[q.id] ?? null
    return { questionId: q.id, selected, correct: q.answer, isCorrect: selected === q.answer }
  })
  const correct = details.filter((d) => d.isCorrect).length
  const score = correct * fmt.pointsPerQuestion
  return { score, correct, total: questions.length, pass: score >= fmt.passScore, details }
}
