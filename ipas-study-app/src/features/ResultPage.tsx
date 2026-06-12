import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { Question, OptionKey, QuizResult, QuizMode } from '../types'

interface Stored {
  subjectId: string
  mode?: QuizMode
  result: QuizResult
  questions?: Question[]
  answers?: Record<string, OptionKey | null>
}

export function ResultPage() {
  const raw = sessionStorage.getItem('lastResult')
  const [wrongOnly, setWrongOnly] = useState(false)
  if (!raw) return <p>尚無測驗結果。<Link to="/" className="text-sky-700">回首頁</Link></p>
  const { subjectId, result, questions = [], answers = {} } = JSON.parse(raw) as Stored

  const review = questions.filter((q) => {
    if (!wrongOnly) return true
    return answers[q.id] !== q.answer
  })

  return (
    <div className="space-y-6">
      <div className="space-y-3 text-center">
        <div className="text-sm text-gray-500">測驗結果</div>
        <div className="text-5xl font-medium">{result.score}</div>
        <div className="text-sm text-gray-500">答對 {result.correct} / {result.total} 題</div>
        <span className={`inline-block text-xs px-3 py-1 rounded-full ${result.pass ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {result.pass ? '通過' : '未通過'}
        </span>
        <div className="flex gap-2 pt-2">
          <Link to={`/subject/${subjectId}/quiz/practice`} className="flex-1 border rounded py-2 text-sm">再練一次</Link>
          <Link to="/wrong" className="flex-1 bg-sky-600 text-white rounded py-2 text-sm">看錯題本</Link>
        </div>
      </div>

      {questions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium">詳解逐題檢討</h2>
            <label className="text-xs text-gray-500 flex items-center gap-1">
              <input type="checkbox" checked={wrongOnly} onChange={(e) => setWrongOnly(e.target.checked)} />
              只看答錯
            </label>
          </div>
          {review.length === 0 && <p className="text-sm text-gray-500">全部答對，太棒了！</p>}
          {review.map((q, idx) => {
            const mine = answers[q.id] ?? null
            const correct = mine === q.answer
            return (
              <div key={q.id} className="border rounded-lg p-4 space-y-2">
                <div className="flex items-start gap-2">
                  <span className={`shrink-0 text-xs px-1.5 py-0.5 rounded ${correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {correct ? '✓' : '✗'}
                  </span>
                  <div className="text-sm font-medium">{idx + 1}. {q.stem}</div>
                </div>
                <div className="space-y-1">
                  {q.options.map((o) => {
                    const isAns = o.key === q.answer
                    const isMine = o.key === mine
                    const cls = isAns
                      ? 'border-green-500 bg-green-50'
                      : isMine ? 'border-red-400 bg-red-50' : 'border-gray-200'
                    return (
                      <div key={o.key} className={`border rounded p-2 text-sm ${cls}`}>
                        ({o.key}) {o.text}
                        {isAns && <span className="ml-1 text-xs text-green-700">← 正解</span>}
                        {isMine && !isAns && <span className="ml-1 text-xs text-red-500">← 你的選擇</span>}
                      </div>
                    )
                  })}
                </div>
                <p className="text-xs text-gray-600 leading-relaxed rounded bg-gray-50 border border-gray-100 p-2">
                  <span className="text-gray-400">詳解：</span>
                  {q.explanation || '詳解整理中，敬請期待。'}
                </p>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
