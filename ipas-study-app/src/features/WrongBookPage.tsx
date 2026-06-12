import { useState, type ChangeEvent } from 'react'
import { allSubjects, getQuestions } from '../data/subjects'
import { getSubjectProgress, removeWrongQuestion, exportProgress, importProgress } from '../store/progress'

export function WrongBookPage() {
  const [, force] = useState(0)
  const subjects = allSubjects()

  function doExport() {
    const blob = new Blob([exportProgress()], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ipas-progress.json'; a.click()
    URL.revokeObjectURL(url)
  }
  function doImport(e: ChangeEvent<HTMLInputElement>) {
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
            <div className="text-sm font-medium">
              <span className="text-xs text-gray-400 mr-1">{s.level === 'intermediate' ? '中級' : '初級'}</span>
              {s.title}（{items.length}）
            </div>
            {items.map((q) => (
              <div key={q.id} className="border rounded p-3 text-sm space-y-1">
                <div>{q.stem}</div>
                <div className="text-green-700 text-xs">正解：({q.answer}) {q.options.find((o) => o.key === q.answer)?.text}</div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  <span className="text-gray-400">詳解：</span>
                  {q.explanation || '詳解整理中，敬請期待。'}
                </p>
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
