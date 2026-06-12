import type { Question, Option, OptionKey } from '../types'

type Rng = () => number

export function takeQuestions(pool: Question[], n: number, rng: Rng = Math.random): Question[] {
  const arr = [...pool]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, Math.min(n, arr.length))
}

const KEYS: OptionKey[] = ['A', 'B', 'C', 'D']

export function shuffleOptions(q: Question, rng: Rng = Math.random): Question {
  const correctText = q.options.find((o) => o.key === q.answer)!.text
  const texts = q.options.map((o) => o.text)
  for (let i = texts.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[texts[i], texts[j]] = [texts[j], texts[i]]
  }
  const options: Option[] = texts.map((text, i) => ({ key: KEYS[i], text }))
  const answer = options.find((o) => o.text === correctText)!.key
  return { ...q, options, answer }
}
