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
