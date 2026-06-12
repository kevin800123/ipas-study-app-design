# iPAS 備考 App — Phase 1 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 建出一款離線可用的靜態 PWA，整合 iPAS 初級 2 科的圖文摘要、線上測驗、自動計分與錯題本。

**Architecture:** 純前端、無後端。題庫/摘要/簡章以 JSON 隨 App 打包；個人作答紀錄存於 localStorage（可匯出匯入）。功能模組（摘要、測驗、計分、錯題本）與資料分離；計分為可單元測試的純函式。

**Tech Stack:** React + Vite + TypeScript + Tailwind CSS v4、React Router、Vitest + React Testing Library、vite-plugin-pwa。

**慣例：** 除另有註明，所有 `npm` / `vite` / `vitest` 指令都在 `ipas-study-app/` 目錄下執行；本文件中相對路徑亦以該目錄為根。git 倉庫初始化於專案根目錄 `Claude-0612/`，故 `git` 指令可在任一子目錄執行。平台為 Windows PowerShell。

---

## 檔案結構（Phase 1 完成後）

```
Claude-0612/
├─ docs/                         # 設計與計畫文件（已存在）
├─ 初級/ 中級/ *.pdf             # 來源教材（已存在）
└─ ipas-study-app/
   ├─ index.html
   ├─ vite.config.ts             # Vite + Tailwind + PWA + Vitest 設定
   ├─ package.json
   ├─ public/
   │   ├─ icon-192.png  icon-512.png   # PWA 圖示
   ├─ src/
   │   ├─ main.tsx               # 進入點 + Router
   │   ├─ App.tsx                # 版面骨架 + 路由表 + 導覽列
   │   ├─ index.css              # Tailwind 匯入
   │   ├─ types.ts               # 全域型別（單一真實來源）
   │   ├─ data/
   │   │   ├─ subjects.ts        # 科目註冊表（聚合 JSON）
   │   │   ├─ exam-info/beginner.json
   │   │   └─ beginner/
   │   │       ├─ ai-basics/{questions.json,summaries.json,subject.json}
   │   │       └─ genai/{questions.json,summaries.json,subject.json}
   │   ├─ lib/
   │   │   ├─ scoreQuiz.ts       # 純計分函式
   │   │   ├─ validateData.ts    # 題庫資料驗證
   │   │   └─ quizBuilder.ts     # 出題（抽題、打亂）
   │   ├─ store/
   │   │   └─ progress.ts        # localStorage 讀寫 + 匯出匯入
   │   ├─ components/
   │   │   ├─ NavBar.tsx         # 底部分頁 / 側欄
   │   │   ├─ ProgressBar.tsx
   │   │   └─ SummaryBlocks.tsx  # 摘要區塊渲染
   │   └─ features/
   │       ├─ HomePage.tsx
   │       ├─ SubjectPage.tsx
   │       ├─ SummaryPage.tsx
   │       ├─ QuizPage.tsx
   │       ├─ ResultPage.tsx
   │       ├─ WrongBookPage.tsx
   │       └─ ExamInfoPage.tsx
   └─ tests/                     # 跨模組整合測試（單元測試與被測檔同層 *.test.ts）
```

---

## Task 1: 專案骨架與工具鏈

**Files:**
- Create: `ipas-study-app/` (整個 Vite 專案)
- Modify: `ipas-study-app/vite.config.ts`
- Modify: `ipas-study-app/src/index.css`
- Create: `Claude-0612/.gitignore`

- [ ] **Step 1: 初始化 git 倉庫（於專案根目錄）**

Run（在 `Claude-0612/`）：
```powershell
git init
```

- [ ] **Step 2: 建立 Vite React-TS 專案**

Run（在 `Claude-0612/`）：
```powershell
npm create vite@latest ipas-study-app -- --template react-ts
cd ipas-study-app
npm install
```
Expected: 產生 `ipas-study-app/` 與預設 React-TS 範本，`npm install` 成功。

- [ ] **Step 3: 安裝相依套件**

Run（在 `ipas-study-app/`）：
```powershell
npm install react-router-dom
npm install tailwindcss @tailwindcss/vite
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event vite-plugin-pwa
```

- [ ] **Step 4: 設定 `vite.config.ts`**

寫入 `ipas-study-app/vite.config.ts`：
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'iPAS 備考',
        short_name: 'iPAS備考',
        start_url: '.',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#185fa5',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
})
```

- [ ] **Step 5: 設定 Tailwind 與測試 setup**

寫入 `ipas-study-app/src/index.css`（取代原內容）：
```css
@import "tailwindcss";
```
寫入 `ipas-study-app/src/test-setup.ts`：
```ts
import '@testing-library/jest-dom'
```
在 `ipas-study-app/package.json` 的 `"scripts"` 加入：
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 6: 放置 PWA 圖示佔位**

建立 `ipas-study-app/public/icon-192.png` 與 `icon-512.png`（任一純色 PNG 即可，正式圖示後續替換）。

- [ ] **Step 7: 驗證可啟動與可測試**

Run（在 `ipas-study-app/`）：
```powershell
npm run dev
```
Expected: Vite 啟動，瀏覽器開 `http://localhost:5173` 顯示預設頁，無錯誤。按 Ctrl+C 結束。
```powershell
npm run test
```
Expected: Vitest 執行（目前 0 測試）成功結束、退出碼 0。

- [ ] **Step 8: Commit**

```powershell
git add -A
git commit -m "chore: scaffold vite react-ts pwa project with tailwind and vitest"
```

---

## Task 2: 全域型別定義

**Files:**
- Create: `src/types.ts`
- Test: `src/types.test.ts`

- [ ] **Step 1: 寫一個型別守門測試（編譯即驗證）**

寫入 `src/types.test.ts`：
```ts
import { describe, it, expect } from 'vitest'
import type { Question, Subject, ProgressState, QuizResult } from './types'

describe('types', () => {
  it('a Question literal matches the interface', () => {
    const q: Question = {
      id: 'B1-Q001', level: 'beginner', subject: 'ai-basics',
      source: '114-4-official', stem: 'x',
      options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }],
      answer: 'B', tags: [],
    }
    expect(q.answer).toBe('B')
  })

  it('a ProgressState literal matches the interface', () => {
    const p: ProgressState = { version: 1, subjects: {} }
    expect(p.version).toBe(1)
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm run test src/types.test.ts`
Expected: FAIL，找不到模組 `./types`。

- [ ] **Step 3: 建立型別**

寫入 `src/types.ts`：
```ts
export type Level = 'beginner' | 'intermediate'
export type OptionKey = 'A' | 'B' | 'C' | 'D'

export interface Option { key: OptionKey; text: string }

export interface Question {
  id: string
  level: Level
  subject: string
  source: string
  stem: string
  options: Option[]
  answer: OptionKey
  explanation?: string
  tags: string[]
}

export interface ExamFormat {
  questionCount: number
  minutes: number
  passScore: number
  pointsPerQuestion: number
}

export interface TopicWeight { tag: string; weight: number }

export interface Subject {
  id: string
  level: Level
  title: string
  examFormat: ExamFormat
  topics: TopicWeight[]
}

export type SummaryBlock =
  | { type: 'text'; content: string }
  | { type: 'keypoints'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'image'; svg: string; caption?: string }

export interface SummaryChapter {
  id: string
  subject: string
  chapter: number
  title: string
  blocks: SummaryBlock[]
}

export type QuizMode = 'practice' | 'mock'

export interface QuizResultDetail {
  questionId: string
  selected: OptionKey | null
  correct: OptionKey
  isCorrect: boolean
}

export interface QuizResult {
  score: number
  correct: number
  total: number
  pass: boolean
  details: QuizResultDetail[]
}

export interface QuizHistoryEntry {
  date: string
  mode: QuizMode
  score: number
  correct: number
  total: number
}

export interface SubjectProgress {
  summariesRead: string[]
  quizHistory: QuizHistoryEntry[]
  wrongQuestions: string[]
  bookmarks: string[]
}

export interface ProgressState {
  version: number
  subjects: Record<string, SubjectProgress>
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm run test src/types.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```powershell
git add src/types.ts src/types.test.ts
git commit -m "feat: add global data-model types"
```

---

## Task 3: 計分純函式 `scoreQuiz`

**Files:**
- Create: `src/lib/scoreQuiz.ts`
- Test: `src/lib/scoreQuiz.test.ts`

- [ ] **Step 1: 寫失敗測試**

寫入 `src/lib/scoreQuiz.test.ts`：
```ts
import { describe, it, expect } from 'vitest'
import { scoreQuiz } from './scoreQuiz'
import type { Question, ExamFormat } from '../types'

const fmt: ExamFormat = { questionCount: 2, minutes: 60, passScore: 60, pointsPerQuestion: 50 }
const qs: Question[] = [
  { id: 'q1', level: 'beginner', subject: 's', source: 'x', stem: '', options: [{ key: 'A', text: '' }, { key: 'B', text: '' }], answer: 'A', tags: [] },
  { id: 'q2', level: 'beginner', subject: 's', source: 'x', stem: '', options: [{ key: 'A', text: '' }, { key: 'B', text: '' }], answer: 'B', tags: [] },
]

describe('scoreQuiz', () => {
  it('scores all correct as full marks and pass', () => {
    const r = scoreQuiz(qs, { q1: 'A', q2: 'B' }, fmt)
    expect(r.correct).toBe(2)
    expect(r.score).toBe(100)
    expect(r.pass).toBe(true)
  })

  it('scores all wrong as zero and fail', () => {
    const r = scoreQuiz(qs, { q1: 'B', q2: 'A' }, fmt)
    expect(r.correct).toBe(0)
    expect(r.score).toBe(0)
    expect(r.pass).toBe(false)
  })

  it('treats missing answer as null and incorrect', () => {
    const r = scoreQuiz(qs, { q1: 'A' }, fmt)
    expect(r.correct).toBe(1)
    expect(r.score).toBe(50)
    expect(r.details[1].selected).toBeNull()
    expect(r.details[1].isCorrect).toBe(false)
  })

  it('passes exactly at the threshold', () => {
    const r = scoreQuiz(qs, { q1: 'A' }, { ...fmt, passScore: 50 })
    expect(r.pass).toBe(true)
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm run test src/lib/scoreQuiz.test.ts`
Expected: FAIL，找不到 `scoreQuiz`。

- [ ] **Step 3: 實作**

寫入 `src/lib/scoreQuiz.ts`：
```ts
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm run test src/lib/scoreQuiz.test.ts`
Expected: PASS（4 通過）。

- [ ] **Step 5: Commit**

```powershell
git add src/lib/scoreQuiz.ts src/lib/scoreQuiz.test.ts
git commit -m "feat: add scoreQuiz pure scoring function"
```

---

## Task 4: 出題工具 `quizBuilder`

**Files:**
- Create: `src/lib/quizBuilder.ts`
- Test: `src/lib/quizBuilder.test.ts`

- [ ] **Step 1: 寫失敗測試**

寫入 `src/lib/quizBuilder.test.ts`：
```ts
import { describe, it, expect } from 'vitest'
import { takeQuestions, shuffleOptions } from './quizBuilder'
import type { Question } from '../types'

function make(id: string): Question {
  return { id, level: 'beginner', subject: 's', source: 'x', stem: '',
    options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }, { key: 'C', text: 'c' }, { key: 'D', text: 'd' }],
    answer: 'A', tags: [] }
}

describe('takeQuestions', () => {
  it('returns at most n questions', () => {
    const pool = [make('1'), make('2'), make('3')]
    expect(takeQuestions(pool, 2, () => 0)).toHaveLength(2)
  })
  it('returns the whole pool when n exceeds size', () => {
    const pool = [make('1'), make('2')]
    expect(takeQuestions(pool, 10, () => 0)).toHaveLength(2)
  })
})

describe('shuffleOptions', () => {
  it('keeps the answer text pointing at the same option after reordering', () => {
    const q = make('1')
    const s = shuffleOptions(q, () => 0.99)
    const answerText = q.options.find((o) => o.key === q.answer)!.text
    const newAnswerText = s.options.find((o) => o.key === s.answer)!.text
    expect(newAnswerText).toBe(answerText)
    expect(s.options).toHaveLength(4)
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm run test src/lib/quizBuilder.test.ts`
Expected: FAIL，找不到模組。

- [ ] **Step 3: 實作**

寫入 `src/lib/quizBuilder.ts`：
```ts
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm run test src/lib/quizBuilder.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```powershell
git add src/lib/quizBuilder.ts src/lib/quizBuilder.test.ts
git commit -m "feat: add quiz builder (sampling and option shuffling)"
```

---

## Task 5: 進度儲存 `progress` store

**Files:**
- Create: `src/store/progress.ts`
- Test: `src/store/progress.test.ts`

- [ ] **Step 1: 寫失敗測試**

寫入 `src/store/progress.test.ts`：
```ts
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
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm run test src/store/progress.test.ts`
Expected: FAIL，找不到模組。

- [ ] **Step 3: 實作**

寫入 `src/store/progress.ts`：
```ts
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm run test src/store/progress.test.ts`
Expected: PASS（6 通過）。

- [ ] **Step 5: Commit**

```powershell
git add src/store/progress.ts src/store/progress.test.ts
git commit -m "feat: add localStorage progress store with export/import"
```

---

## Task 6: 資料驗證 `validateData`

**Files:**
- Create: `src/lib/validateData.ts`
- Test: `src/lib/validateData.test.ts`

- [ ] **Step 1: 寫失敗測試**

寫入 `src/lib/validateData.test.ts`：
```ts
import { describe, it, expect } from 'vitest'
import { validateQuestions } from './validateData'
import type { Question } from '../types'

const ok: Question = { id: 'q1', level: 'beginner', subject: 's', source: 'x', stem: 'a',
  options: [{ key: 'A', text: 'a' }, { key: 'B', text: 'b' }], answer: 'A', tags: [] }

describe('validateQuestions', () => {
  it('accepts a valid set', () => {
    expect(validateQuestions([ok])).toEqual([])
  })
  it('flags an answer not present in options', () => {
    const bad = { ...ok, id: 'q2', answer: 'D' as const }
    expect(validateQuestions([bad])[0]).toMatch(/answer/i)
  })
  it('flags duplicate ids', () => {
    expect(validateQuestions([ok, { ...ok }]).some((e) => /duplicate/i.test(e))).toBe(true)
  })
  it('flags missing stem', () => {
    expect(validateQuestions([{ ...ok, id: 'q3', stem: '' }]).some((e) => /stem/i.test(e))).toBe(true)
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm run test src/lib/validateData.test.ts`
Expected: FAIL。

- [ ] **Step 3: 實作**

寫入 `src/lib/validateData.ts`：
```ts
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm run test src/lib/validateData.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```powershell
git add src/lib/validateData.ts src/lib/validateData.test.ts
git commit -m "feat: add question data validation"
```

---

## Task 7: 從簡章擷取 examFormat 與科目設定

**Files:**
- Create: `src/data/exam-info/beginner.json`
- Create: `src/data/beginner/ai-basics/subject.json`
- Create: `src/data/beginner/genai/subject.json`

來源：`Claude-0612/115年度…簡章…pdf`、`AI應用規劃師能力鑑定評鑑內容範圍參考11404.pdf`。

- [ ] **Step 1: 從簡章讀出初級兩科的題型/題數/測驗時間/配分/及格分數**

開啟 115 年度簡章 PDF，找到初級各科的測驗方式表，逐欄抄錄：題數、每題配分、測驗時間（分鐘）、及格分數。若簡章未列每題配分，以 `100 / questionCount` 計算 `pointsPerQuestion`。將實際數字填入下一步的 JSON（不可留 0）。

- [ ] **Step 2: 寫入考試資訊 JSON**

寫入 `src/data/exam-info/beginner.json`（範例結構，數值以簡章為準替換）：
```json
{
  "level": "beginner",
  "title": "iPAS AI 應用規劃師（初級）",
  "registration": "依 iPAS 官方公告報名期程與費用",
  "subjects": [
    { "id": "ai-basics", "title": "人工智慧基礎概論" },
    { "id": "genai", "title": "生成式 AI 應用與規劃" }
  ],
  "notes": "兩科皆為單選題；及格標準與題數依當年度簡章。"
}
```

- [ ] **Step 3: 寫入兩科 subject.json**

寫入 `src/data/beginner/ai-basics/subject.json`（`examFormat` 數值替換為簡章實際值）：
```json
{
  "id": "ai-basics",
  "level": "beginner",
  "title": "人工智慧基礎概論",
  "examFormat": { "questionCount": 50, "minutes": 90, "passScore": 60, "pointsPerQuestion": 2 },
  "topics": []
}
```
寫入 `src/data/beginner/genai/subject.json`（同結構，title 為「生成式 AI 應用與規劃」、`examFormat` 依簡章替換）。

> 註：`topics` 於 Phase 1 留空陣列（弱點分析為 Phase 2）。`examFormat` 的四個數值必須為簡章實際數字，禁止保留範例值未經查核。

- [ ] **Step 4: Commit**

```powershell
git add src/data/exam-info/beginner.json src/data/beginner/ai-basics/subject.json src/data/beginner/genai/subject.json
git commit -m "data: add beginner subject configs and exam info from official guide"
```

---

## Task 8: 數位化「人工智慧基礎概論」題庫

**Files:**
- Create: `src/data/beginner/ai-basics/questions.json`

來源 PDF：`初級/114年第四梯次…第一科人工智慧基礎概論…公告試題…pdf`、`初級/iPAS+AI應用規劃師初級能力鑑定-考試樣題…pdf`（科目一段落）。

- [ ] **Step 1: 建立題庫 JSON，逐題抄錄（含正解校對）**

開啟兩份來源 PDF，將每題抄成下列結構。`id` 規則：`AB-<source>-<題號>`（AB=ai-basics）。`answer` 取自 PDF「答案」欄並逐題對照確認。寫入 `src/data/beginner/ai-basics/questions.json`（以下為已自來源抄錄的前兩筆真實範例，其餘比照補齊）：
```json
[
  {
    "id": "AB-114-4-Q001",
    "level": "beginner",
    "subject": "ai-basics",
    "source": "114-4-official",
    "stem": "在人工智慧系統的決策流程中，下列哪一種情境最符合「人在迴圈上（Human-over-the-loop）」所強調的監督機制？",
    "options": [
      { "key": "A", "text": "AI 系統只能提供建議，人類需主動下達命令才能進行決策" },
      { "key": "B", "text": "人類對 AI 的運行進行日常監督，必要時可立即介入修正或干預" },
      { "key": "C", "text": "人類平時不參與 AI 的運作，僅在發生異常或重大錯誤時才接手控制" },
      { "key": "D", "text": "AI 的所有判斷與行動在執行前，皆須經過人類逐一審核與批准" }
    ],
    "answer": "B",
    "tags": []
  },
  {
    "id": "AB-sample-Q001",
    "level": "beginner",
    "subject": "ai-basics",
    "source": "114-09-sample",
    "stem": "關於 AI，下列敘述何者正確？",
    "options": [
      { "key": "A", "text": "AI 僅能處理結構化數據的分析" },
      { "key": "B", "text": "AI 涵蓋多種專業領域與技術" },
      { "key": "C", "text": "AI 系統只能在學術研究中應用" },
      { "key": "D", "text": "AI 無法應用於金融領域" }
    ],
    "answer": "B",
    "tags": []
  }
]
```

- [ ] **Step 2: 寫資料驗證測試（守住題庫正確性）**

寫入 `src/data/beginner/ai-basics/questions.test.ts`：
```ts
import { describe, it, expect } from 'vitest'
import { validateQuestions } from '../../../lib/validateData'
import questions from './questions.json'
import type { Question } from '../../../types'

describe('ai-basics questions', () => {
  it('has no validation errors', () => {
    expect(validateQuestions(questions as Question[])).toEqual([])
  })
  it('has at least the two announced sources', () => {
    const sources = new Set((questions as Question[]).map((q) => q.source))
    expect(sources.has('114-4-official')).toBe(true)
    expect(sources.has('114-09-sample')).toBe(true)
  })
})
```
若使用 `import ... from './questions.json'` 需在 `tsconfig` 啟用 `resolveJsonModule`（Vite 範本預設已啟用；若否，於 `tsconfig.app.json` 的 `compilerOptions` 加入 `"resolveJsonModule": true`）。

- [ ] **Step 3: 跑驗證測試**

Run: `npm run test src/data/beginner/ai-basics/questions.test.ts`
Expected: PASS（驗證 0 錯誤；兩來源皆存在）。

- [ ] **Step 4: Commit**

```powershell
git add src/data/beginner/ai-basics/questions.json src/data/beginner/ai-basics/questions.test.ts
git commit -m "data: digitize ai-basics question bank (official + sample)"
```

---

## Task 9: 數位化「生成式 AI 應用與規劃」題庫

**Files:**
- Create: `src/data/beginner/genai/questions.json`
- Create: `src/data/beginner/genai/questions.test.ts`

來源 PDF：`初級/114年第四梯次…第二科生成式AI應用與規劃…公告試題…pdf`、考試樣題 PDF（科目二段落）。

- [ ] **Step 1: 逐題抄錄題庫 JSON**

比照 Task 8 的結構，`id` 前綴用 `GA-`（genai），`subject` 為 `"genai"`，`answer` 取自 PDF 答案欄並逐題對照。寫入 `src/data/beginner/genai/questions.json`，至少涵蓋公告試題與樣題兩來源（`source` 用 `114-4-official` 與 `114-09-sample`）。每題需含 4 個選項、stem 非空、answer 對應存在選項。

- [ ] **Step 2: 寫資料驗證測試**

寫入 `src/data/beginner/genai/questions.test.ts`：
```ts
import { describe, it, expect } from 'vitest'
import { validateQuestions } from '../../../lib/validateData'
import questions from './questions.json'
import type { Question } from '../../../types'

describe('genai questions', () => {
  it('has no validation errors', () => {
    expect(validateQuestions(questions as Question[])).toEqual([])
  })
  it('every question belongs to the genai subject', () => {
    expect((questions as Question[]).every((q) => q.subject === 'genai')).toBe(true)
  })
})
```

- [ ] **Step 3: 跑驗證測試**

Run: `npm run test src/data/beginner/genai/questions.test.ts`
Expected: PASS。

- [ ] **Step 4: Commit**

```powershell
git add src/data/beginner/genai/questions.json src/data/beginner/genai/questions.test.ts
git commit -m "data: digitize genai question bank (official + sample)"
```

---

## Task 10: 圖文摘要內容（兩科）

**Files:**
- Create: `src/data/beginner/ai-basics/summaries.json`
- Create: `src/data/beginner/genai/summaries.json`
- Test: `src/data/beginner/summaries.test.ts`

來源：兩科學習指引 PDF（含勘誤表）。

- [ ] **Step 1: 依學習指引章節整理摘要 JSON**

每科建立一個 `SummaryChapter[]`。每章含標題與區塊陣列（`text` / `keypoints` / `table` / `image`）。`image` 的 `svg` 欄位放一段 inline `<svg>` 字串（流程圖或心智圖）。寫入 `src/data/beginner/ai-basics/summaries.json`（以下為結構與最小真實範例，其餘章節比照補齊）：
```json
[
  {
    "id": "ai-basics-ch1",
    "subject": "ai-basics",
    "chapter": 1,
    "title": "人工智慧基本概念",
    "blocks": [
      { "type": "text", "content": "人工智慧涵蓋機器學習、深度學習等多種技術，應用橫跨多個專業領域。" },
      { "type": "keypoints", "items": ["AI 不等於單一演算法", "機器學習是 AI 的子集", "深度學習是機器學習的子集"] },
      { "type": "table", "headers": ["層級", "範例"], "rows": [["人工智慧", "專家系統"], ["機器學習", "決策樹"], ["深度學習", "CNN"]] }
    ]
  }
]
```

- [ ] **Step 2: 整理第二科摘要**

比照寫入 `src/data/beginner/genai/summaries.json`，`subject` 為 `"genai"`、`id` 前綴 `genai-chN`。

- [ ] **Step 3: 寫摘要結構驗證測試**

寫入 `src/data/beginner/summaries.test.ts`：
```ts
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm run test src/data/beginner/summaries.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```powershell
git add src/data/beginner/ai-basics/summaries.json src/data/beginner/genai/summaries.json src/data/beginner/summaries.test.ts
git commit -m "data: add illustrated summaries for both beginner subjects"
```

---

## Task 11: 科目註冊表 `subjects.ts`

**Files:**
- Create: `src/data/subjects.ts`
- Test: `src/data/subjects.test.ts`

- [ ] **Step 1: 寫失敗測試**

寫入 `src/data/subjects.test.ts`：
```ts
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
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm run test src/data/subjects.test.ts`
Expected: FAIL。

- [ ] **Step 3: 實作註冊表**

寫入 `src/data/subjects.ts`：
```ts
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
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm run test src/data/subjects.test.ts`
Expected: PASS。

- [ ] **Step 5: Commit**

```powershell
git add src/data/subjects.ts src/data/subjects.test.ts
git commit -m "feat: add subject registry aggregating data files"
```

---

## Task 12: App 骨架、路由與導覽列

**Files:**
- Create: `src/components/NavBar.tsx`
- Modify: `src/App.tsx`
- Modify: `src/main.tsx`

- [ ] **Step 1: 建立導覽列元件**

寫入 `src/components/NavBar.tsx`：
```tsx
import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: '首頁' },
  { to: '/wrong', label: '錯題本' },
  { to: '/info', label: '考試資訊' },
]

export function NavBar() {
  return (
    <nav className="fixed bottom-0 inset-x-0 border-t bg-white flex md:static md:border-t-0 md:border-r md:flex-col md:w-48">
      {items.map((it) => (
        <NavLink
          key={it.to}
          to={it.to}
          end={it.to === '/'}
          className={({ isActive }) =>
            `flex-1 text-center py-3 text-sm ${isActive ? 'text-sky-700 font-medium' : 'text-gray-500'}`
          }
        >
          {it.label}
        </NavLink>
      ))}
    </nav>
  )
}
```

- [ ] **Step 2: 設定路由骨架**

寫入 `src/App.tsx`：
```tsx
import { Routes, Route } from 'react-router-dom'
import { NavBar } from './components/NavBar'
import { HomePage } from './features/HomePage'
import { SubjectPage } from './features/SubjectPage'
import { SummaryPage } from './features/SummaryPage'
import { QuizPage } from './features/QuizPage'
import { ResultPage } from './features/ResultPage'
import { WrongBookPage } from './features/WrongBookPage'
import { ExamInfoPage } from './features/ExamInfoPage'

export default function App() {
  return (
    <div className="min-h-screen md:flex">
      <NavBar />
      <main className="flex-1 max-w-2xl mx-auto p-4 pb-20 md:pb-4">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/subject/:subjectId" element={<SubjectPage />} />
          <Route path="/subject/:subjectId/summary/:chapterId" element={<SummaryPage />} />
          <Route path="/subject/:subjectId/quiz/:mode" element={<QuizPage />} />
          <Route path="/subject/:subjectId/result" element={<ResultPage />} />
          <Route path="/wrong" element={<WrongBookPage />} />
          <Route path="/info" element={<ExamInfoPage />} />
        </Routes>
      </main>
    </div>
  )
}
```

- [ ] **Step 3: 包上 Router**

寫入 `src/main.tsx`：
```tsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
)
```

- [ ] **Step 4: 建立各頁最小佔位以利編譯**

為 `HomePage / SubjectPage / SummaryPage / QuizPage / ResultPage / WrongBookPage / ExamInfoPage` 各建立一個最小檔，內容為 `export function X() { return <div>X</div> }`（後續任務逐一實作）。放在 `src/features/` 下對應檔名。

- [ ] **Step 5: 驗證可編譯啟動**

Run: `npm run dev`
Expected: 啟動無錯誤，底部/側邊出現「首頁、錯題本、考試資訊」三個分頁，可點擊切換。Ctrl+C 結束。

- [ ] **Step 6: Commit**

```powershell
git add src/components/NavBar.tsx src/App.tsx src/main.tsx src/features/*.tsx
git commit -m "feat: add app shell, routing and nav bar"
```

---

## Task 13: 共用元件 ProgressBar 與 SummaryBlocks

**Files:**
- Create: `src/components/ProgressBar.tsx`
- Create: `src/components/SummaryBlocks.tsx`
- Test: `src/components/SummaryBlocks.test.tsx`

- [ ] **Step 1: 寫 SummaryBlocks 失敗測試**

寫入 `src/components/SummaryBlocks.test.tsx`：
```tsx
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { SummaryBlocks } from './SummaryBlocks'
import type { SummaryBlock } from '../types'

describe('SummaryBlocks', () => {
  it('renders text, keypoints and table blocks', () => {
    const blocks: SummaryBlock[] = [
      { type: 'text', content: '說明文字' },
      { type: 'keypoints', items: ['重點一'] },
      { type: 'table', headers: ['欄'], rows: [['值']] },
    ]
    render(<SummaryBlocks blocks={blocks} />)
    expect(screen.getByText('說明文字')).toBeInTheDocument()
    expect(screen.getByText('重點一')).toBeInTheDocument()
    expect(screen.getByText('值')).toBeInTheDocument()
  })
})
```

- [ ] **Step 2: 跑測試確認失敗**

Run: `npm run test src/components/SummaryBlocks.test.tsx`
Expected: FAIL。

- [ ] **Step 3: 實作兩個元件**

寫入 `src/components/ProgressBar.tsx`：
```tsx
export function ProgressBar({ value }: { value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className="h-1.5 bg-gray-100 rounded-full">
      <div className="h-1.5 bg-sky-600 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  )
}
```
寫入 `src/components/SummaryBlocks.tsx`：
```tsx
import type { SummaryBlock } from '../types'

export function SummaryBlocks({ blocks }: { blocks: SummaryBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((b, i) => {
        if (b.type === 'text') return <p key={i} className="leading-7">{b.content}</p>
        if (b.type === 'keypoints')
          return <ul key={i} className="list-disc pl-5 space-y-1">{b.items.map((it, j) => <li key={j}>{it}</li>)}</ul>
        if (b.type === 'table')
          return (
            <table key={i} className="w-full text-sm border-collapse">
              <thead><tr>{b.headers.map((h, j) => <th key={j} className="border p-2 text-left bg-gray-50">{h}</th>)}</tr></thead>
              <tbody>{b.rows.map((r, j) => <tr key={j}>{r.map((c, k) => <td key={k} className="border p-2">{c}</td>)}</tr>)}</tbody>
            </table>
          )
        return <div key={i} className="my-2" dangerouslySetInnerHTML={{ __html: b.svg }} aria-label={b.caption ?? '示意圖'} />
      })}
    </div>
  )
}
```

- [ ] **Step 4: 跑測試確認通過**

Run: `npm run test src/components/SummaryBlocks.test.tsx`
Expected: PASS。

- [ ] **Step 5: Commit**

```powershell
git add src/components/ProgressBar.tsx src/components/SummaryBlocks.tsx src/components/SummaryBlocks.test.tsx
git commit -m "feat: add ProgressBar and SummaryBlocks components"
```

---

## Task 14: 首頁（級別切換、科目卡、進度）

**Files:**
- Modify: `src/features/HomePage.tsx`

- [ ] **Step 1: 實作首頁**

寫入 `src/features/HomePage.tsx`：
```tsx
import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Level } from '../types'
import { listSubjects, getSummaries } from '../data/subjects'
import { getSubjectProgress } from '../store/progress'
import { ProgressBar } from '../components/ProgressBar'

export function HomePage() {
  const [level, setLevel] = useState<Level>('beginner')
  const subjects = listSubjects(level)
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-medium">iPAS 備考</h1>
      <div className="flex gap-2">
        <button onClick={() => setLevel('beginner')}
          className={`px-3 py-1 rounded text-sm ${level === 'beginner' ? 'bg-sky-100 text-sky-700' : 'border text-gray-500'}`}>初級</button>
        <button onClick={() => setLevel('intermediate')}
          className={`px-3 py-1 rounded text-sm ${level === 'intermediate' ? 'bg-sky-100 text-sky-700' : 'border text-gray-500'}`}>中級</button>
      </div>
      {subjects.length === 0 && <p className="text-gray-500 text-sm">此級別尚未上架（Phase 3）。</p>}
      {subjects.map((s) => {
        const total = getSummaries(s.id).length
        const read = getSubjectProgress(s.id).summariesRead.length
        const ratio = total ? read / total : 0
        const last = getSubjectProgress(s.id).quizHistory[0]
        return (
          <Link key={s.id} to={`/subject/${s.id}`} className="block border rounded-lg p-4 space-y-2">
            <div className="font-medium">{s.title}</div>
            <ProgressBar value={ratio} />
            <div className="text-xs text-gray-500">
              摘要進度 {Math.round(ratio * 100)}%{last ? `　最近成績 ${last.score} 分` : ''}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
```

- [ ] **Step 2: 驗證畫面**

Run: `npm run dev`
Expected: 首頁顯示初級兩科卡片、進度條；切換到中級顯示「尚未上架」。Ctrl+C。

- [ ] **Step 3: Commit**

```powershell
git add src/features/HomePage.tsx
git commit -m "feat: implement home dashboard with level switch and subject cards"
```

---

## Task 15: 科目頁（摘要清單 + 開始測驗）

**Files:**
- Modify: `src/features/SubjectPage.tsx`

- [ ] **Step 1: 實作科目頁**

寫入 `src/features/SubjectPage.tsx`：
```tsx
import { useParams, Link } from 'react-router-dom'
import { getSubject, getSummaries } from '../data/subjects'
import { getSubjectProgress } from '../store/progress'

export function SubjectPage() {
  const { subjectId = '' } = useParams()
  const subject = getSubject(subjectId)
  if (!subject) return <p>找不到此科目。</p>
  const summaries = getSummaries(subjectId)
  const read = new Set(getSubjectProgress(subjectId).summariesRead)
  return (
    <div className="space-y-4">
      <Link to="/" className="text-sm text-gray-500">‹ 初級</Link>
      <h1 className="text-lg font-medium">{subject.title}</h1>
      <section className="space-y-2">
        <div className="text-xs text-gray-500">圖文摘要</div>
        {summaries.map((c) => (
          <Link key={c.id} to={`/subject/${subjectId}/summary/${c.id}`}
            className="flex justify-between border rounded p-3 text-sm">
            <span>{c.chapter}　{c.title}</span>
            {read.has(c.id) && <span className="text-green-600">已讀</span>}
          </Link>
        ))}
      </section>
      <div className="flex gap-2">
        <Link to={`/subject/${subjectId}/quiz/practice`} className="flex-1 text-center bg-sky-600 text-white rounded py-2 text-sm">練習模式</Link>
        <Link to={`/subject/${subjectId}/quiz/mock`} className="flex-1 text-center border rounded py-2 text-sm">模擬考</Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 驗證畫面**

Run: `npm run dev`
Expected: 點首頁科目卡進入，顯示章節清單與「練習／模擬考」按鈕。Ctrl+C。

- [ ] **Step 3: Commit**

```powershell
git add src/features/SubjectPage.tsx
git commit -m "feat: implement subject page with summary list and quiz entry"
```

---

## Task 16: 摘要閱讀頁

**Files:**
- Modify: `src/features/SummaryPage.tsx`

- [ ] **Step 1: 實作摘要閱讀頁**

寫入 `src/features/SummaryPage.tsx`：
```tsx
import { useParams, Link } from 'react-router-dom'
import { getSummaries } from '../data/subjects'
import { getSubjectProgress, toggleSummaryRead } from '../store/progress'
import { SummaryBlocks } from '../components/SummaryBlocks'
import { useState } from 'react'

export function SummaryPage() {
  const { subjectId = '', chapterId = '' } = useParams()
  const chapter = getSummaries(subjectId).find((c) => c.id === chapterId)
  const [read, setRead] = useState(getSubjectProgress(subjectId).summariesRead.includes(chapterId))
  if (!chapter) return <p>找不到此章節。</p>
  return (
    <div className="space-y-4">
      <Link to={`/subject/${subjectId}`} className="text-sm text-gray-500">‹ {chapter.title}</Link>
      <h1 className="text-lg font-medium">{chapter.chapter}　{chapter.title}</h1>
      <SummaryBlocks blocks={chapter.blocks} />
      <button onClick={() => { toggleSummaryRead(subjectId, chapterId); setRead((r) => !r) }}
        className={`w-full rounded py-2 text-sm ${read ? 'bg-green-100 text-green-700' : 'bg-sky-600 text-white'}`}>
        {read ? '已標記為讀過（點擊取消）' : '標記為讀過'}
      </button>
    </div>
  )
}
```

- [ ] **Step 2: 驗證畫面**

Run: `npm run dev`
Expected: 進入章節顯示文字/條列/表格/示意圖，可標記已讀並反映回科目頁。Ctrl+C。

- [ ] **Step 3: Commit**

```powershell
git add src/features/SummaryPage.tsx
git commit -m "feat: implement summary reading page with read toggle"
```

---

## Task 17: 測驗頁（練習 + 模擬考）

**Files:**
- Modify: `src/features/QuizPage.tsx`

- [ ] **Step 1: 實作測驗頁**

寫入 `src/features/QuizPage.tsx`：
```tsx
import { useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import type { OptionKey, QuizMode } from '../types'
import { getSubject, getQuestions } from '../data/subjects'
import { takeQuestions, shuffleOptions } from '../lib/quizBuilder'
import { scoreQuiz } from '../lib/scoreQuiz'
import { recordQuiz, addWrongQuestions } from '../store/progress'

export function QuizPage() {
  const { subjectId = '', mode = 'practice' } = useParams()
  const quizMode = (mode === 'mock' ? 'mock' : 'practice') as QuizMode
  const navigate = useNavigate()
  const subject = getSubject(subjectId)
  const questions = useMemo(() => {
    const pool = getQuestions(subjectId)
    const n = quizMode === 'mock' ? (subject?.examFormat.questionCount ?? pool.length) : 10
    const picked = takeQuestions(pool, n)
    return quizMode === 'mock' ? picked.map((q) => shuffleOptions(q)) : picked
  }, [subjectId, quizMode, subject])

  const [answers, setAnswers] = useState<Record<string, OptionKey | null>>({})
  const [revealed, setRevealed] = useState<Record<string, boolean>>({})

  if (!subject) return <p>找不到此科目。</p>

  function choose(qid: string, key: OptionKey) {
    setAnswers((a) => ({ ...a, [qid]: key }))
    if (quizMode === 'practice') setRevealed((r) => ({ ...r, [qid]: true }))
  }

  function submit() {
    const result = scoreQuiz(questions, answers, subject!.examFormat)
    const wrong = result.details.filter((d) => !d.isCorrect).map((d) => d.questionId)
    addWrongQuestions(subjectId, wrong)
    recordQuiz(subjectId, {
      date: new Date().toISOString().slice(0, 10),
      mode: quizMode, score: result.score, correct: result.correct, total: result.total,
    })
    sessionStorage.setItem('lastResult', JSON.stringify({ subjectId, result }))
    navigate(`/subject/${subjectId}/result`)
  }

  return (
    <div className="space-y-6">
      <h1 className="text-lg font-medium">{subject.title}・{quizMode === 'mock' ? '模擬考' : '練習'}</h1>
      {questions.map((q, idx) => (
        <div key={q.id} className="border rounded-lg p-4 space-y-2">
          <div className="text-sm font-medium">{idx + 1}. {q.stem}</div>
          {q.options.map((o) => {
            const picked = answers[q.id] === o.key
            const show = revealed[q.id]
            const isAns = o.key === q.answer
            const cls = show
              ? isAns ? 'border-green-500 bg-green-50' : picked ? 'border-red-400 bg-red-50' : 'border-gray-200'
              : picked ? 'border-sky-500 bg-sky-50' : 'border-gray-200'
            return (
              <button key={o.key} onClick={() => choose(q.id, o.key)}
                className={`block w-full text-left border rounded p-2 text-sm ${cls}`}>
                ({o.key}) {o.text}
              </button>
            )
          })}
          {revealed[q.id] && q.explanation && <p className="text-xs text-gray-500">解析：{q.explanation}</p>}
        </div>
      ))}
      <button onClick={submit} className="w-full bg-sky-600 text-white rounded py-2 text-sm">交卷計分</button>
    </div>
  )
}
```

- [ ] **Step 2: 驗證畫面**

Run: `npm run dev`
Expected: 練習模式作答即時顯示對錯與解析；模擬考可作答後交卷並跳轉結果頁。Ctrl+C。

- [ ] **Step 3: Commit**

```powershell
git add src/features/QuizPage.tsx
git commit -m "feat: implement quiz page with practice and mock modes"
```

---

## Task 18: 計分結果頁

**Files:**
- Modify: `src/features/ResultPage.tsx`

- [ ] **Step 1: 實作結果頁**

寫入 `src/features/ResultPage.tsx`：
```tsx
import { Link } from 'react-router-dom'
import type { QuizResult } from '../types'

export function ResultPage() {
  const raw = sessionStorage.getItem('lastResult')
  if (!raw) return <p>尚無測驗結果。<Link to="/" className="text-sky-700">回首頁</Link></p>
  const { subjectId, result } = JSON.parse(raw) as { subjectId: string; result: QuizResult }
  return (
    <div className="space-y-4 text-center">
      <div className="text-sm text-gray-500">測驗結果</div>
      <div className="text-5xl font-medium">{result.score}</div>
      <div className="text-sm text-gray-500">答對 {result.correct} / {result.total} 題</div>
      <span className={`inline-block text-xs px-3 py-1 rounded-full ${result.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
        {result.pass ? '通過' : '未通過'}
      </span>
      <div className="flex gap-2 pt-4">
        <Link to={`/subject/${subjectId}/quiz/practice`} className="flex-1 border rounded py-2 text-sm">再練一次</Link>
        <Link to="/wrong" className="flex-1 bg-sky-600 text-white rounded py-2 text-sm">看錯題本</Link>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: 驗證畫面**

Run: `npm run dev`
Expected: 交卷後顯示分數、答對數、通過/未通過徽章與動作按鈕。Ctrl+C。

- [ ] **Step 3: Commit**

```powershell
git add src/features/ResultPage.tsx
git commit -m "feat: implement score result page"
```

---

## Task 19: 錯題本（含匯出匯入）

**Files:**
- Modify: `src/features/WrongBookPage.tsx`

- [ ] **Step 1: 實作錯題本**

寫入 `src/features/WrongBookPage.tsx`：
```tsx
import { useState } from 'react'
import { listSubjects, getQuestions } from '../data/subjects'
import { getSubjectProgress, removeWrongQuestion, exportProgress, importProgress } from '../store/progress'

export function WrongBookPage() {
  const [, force] = useState(0)
  const subjects = listSubjects('beginner')

  function doExport() {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ipas-progress.json'; a.click()
    URL.revokeObjectURL(url)
  }
  function doImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    file.text().then((t) => { importProgress(t); force((n) => n + 1) })
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-lg font-medium">錯題本</h1>
        <div className="flex gap-2 text-sm">
          <button onClick={doExport} className="border rounded px-2 py-1">匯出</button>
          <label className="border rounded px-2 py-1 cursor-pointer">匯入
            <input type="file" accept="application/json" className="hidden" onChange={doImport} />
          </label>
        </div>
      </div>
      {subjects.map((s) => {
        const wrongIds = new Set(getSubjectProgress(s.id).wrongQuestions)
        const items = getQuestions(s.id).filter((q) => wrongIds.has(q.id))
        if (items.length === 0) return null
        return (
          <section key={s.id} className="space-y-2">
            <div className="text-sm font-medium">{s.title}（{items.length}）</div>
            {items.map((q) => (
              <div key={q.id} className="border rounded p-3 text-sm space-y-1">
                <div>{q.stem}</div>
                <div className="text-green-700 text-xs">正解：({q.answer}) {q.options.find((o) => o.key === q.answer)?.text}</div>
                <button onClick={() => { removeWrongQuestion(s.id, q.id); force((n) => n + 1) }}
                  className="text-xs text-gray-400">移除</button>
              </div>
            ))}
          </section>
        )
      })}
      {subjects.every((s) => getSubjectProgress(s.id).wrongQuestions.length === 0) &&
        <p className="text-gray-500 text-sm">目前沒有錯題，去測驗看看吧。</p>}
    </div>
  )
}
```

- [ ] **Step 2: 驗證畫面**

Run: `npm run dev`
Expected: 顯示各科錯題與正解，可移除；可匯出 JSON 檔、匯入後還原紀錄。Ctrl+C。

- [ ] **Step 3: Commit**

```powershell
git add src/features/WrongBookPage.tsx
git commit -m "feat: implement wrong-question book with export/import"
```

---

## Task 20: 考試資訊頁

**Files:**
- Modify: `src/features/ExamInfoPage.tsx`

- [ ] **Step 1: 實作考試資訊頁**

寫入 `src/features/ExamInfoPage.tsx`：
```tsx
import info from '../data/exam-info/beginner.json'
import { getSubject } from '../data/subjects'

export function ExamInfoPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-lg font-medium">{info.title}・考試資訊</h1>
      <p className="text-sm text-gray-600">{info.notes}</p>
      <table className="w-full text-sm border-collapse">
        <thead><tr><th className="border p-2 bg-gray-50 text-left">科目</th><th className="border p-2 bg-gray-50">題數</th><th className="border p-2 bg-gray-50">時間</th><th className="border p-2 bg-gray-50">及格</th></tr></thead>
        <tbody>
          {info.subjects.map((s) => {
            const fmt = getSubject(s.id)?.examFormat
            return (
              <tr key={s.id}>
                <td className="border p-2">{s.title}</td>
                <td className="border p-2 text-center">{fmt?.questionCount}</td>
                <td className="border p-2 text-center">{fmt?.minutes} 分</td>
                <td className="border p-2 text-center">{fmt?.passScore}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
      <p className="text-xs text-gray-400">{info.registration}</p>
    </div>
  )
}
```

- [ ] **Step 2: 驗證畫面**

Run: `npm run dev`
Expected: 顯示初級兩科題數/時間/及格分數表（數值來自 Task 7 簡章擷取）。Ctrl+C。

- [ ] **Step 3: Commit**

```powershell
git add src/features/ExamInfoPage.tsx
git commit -m "feat: implement exam info page"
```

---

## Task 21: PWA 離線與全測試／建置驗收

**Files:**
- Modify: `Claude-0612/.gitignore`
- 全專案

- [ ] **Step 1: 設定 .gitignore**

寫入 `Claude-0612/.gitignore`：
```
node_modules/
ipas-study-app/node_modules/
ipas-study-app/dist/
ipas-study-app/dev-dist/
```

- [ ] **Step 2: 全測試通過**

Run（在 `ipas-study-app/`）：`npm run test`
Expected: 所有測試（types / scoreQuiz / quizBuilder / progress / validateData / subjects / SummaryBlocks / 兩科題庫 / 摘要）皆 PASS，退出碼 0。

- [ ] **Step 3: 正式建置並本機預覽（驗證 PWA 與離線）**

Run（在 `ipas-study-app/`）：
```powershell
npm run build
npm run preview
```
Expected: build 成功並產生 service worker；瀏覽器開 preview 連結，DevTools → Application 可見 manifest 與 service worker 已註冊，可離線重新整理仍開啟。Ctrl+C。

- [ ] **Step 4: Commit**

```powershell
git add -A
git commit -m "chore: add gitignore and finalize phase 1 pwa build"
```

---

## 驗收標準（Phase 1 Done）

- [ ] 初級兩科題庫已數位化、`validateQuestions` 0 錯誤、含公告試題與樣題兩來源
- [ ] 兩科圖文摘要可閱讀（文字／條列／表格／SVG 示意圖），可標記已讀
- [ ] 練習模式逐題即時對答案＋解析；模擬考依簡章題數作答後一次計分
- [ ] 計分正確（`scoreQuiz` 測試全綠），結果頁顯示分數與通過與否
- [ ] 答錯題目自動進錯題本，可移除、可匯出／匯入個人紀錄
- [ ] 考試資訊頁數值來自簡章擷取（非範例值）
- [ ] `npm run build` 成功、PWA 可安裝、可離線開啟
- [ ] `npm run test` 全數通過

> Phase 2（弱點章節標籤分析）、Phase 3（中級 3 科）不在本計畫範圍。
