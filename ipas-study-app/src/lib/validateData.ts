import type { Question } from '../types'

export function validateQuestions(questions: Question[]): string[] {
  const errors: string[] = []
  const seen = new Set<string>()
  for (const q of questions) {
    if (seen.has(q.id)) errors.push(`duplicate id: ${q.id}`)
    seen.add(q.id)
    if (!q.stem || q.stem.trim() === '') errors.push(`empty stem: ${q.id}`)
    if (q.options.length < 2) errors.push(`too few options: ${q.id}`)
    const keys = q.options.map((o) => o.key)
    if (!keys.includes(q.answer)) errors.push(`answer ${q.answer} not in options: ${q.id}`)
    if (new Set(keys).size !== keys.length) errors.push(`duplicate option keys: ${q.id}`)
  }
  return errors
}
