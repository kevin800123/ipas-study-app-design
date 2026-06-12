import { useState } from 'react'
import type { Level } from '../types'
import beginnerInfo from '../data/exam-info/beginner.json'
import intermediateInfo from '../data/exam-info/intermediate.json'
import { getSubject } from '../data/subjects'

const INFO: Record<Level, typeof beginnerInfo> = {
  beginner: beginnerInfo,
  intermediate: intermediateInfo,
}

export function ExamInfoPage() {
  const [level, setLevel] = useState<Level>('beginner')
  const info = INFO[level]
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <button onClick={() => setLevel('beginner')}
          className={`px-3 py-1 rounded text-sm ${level === 'beginner' ? 'bg-sky-100 text-sky-700' : 'border text-gray-500'}`}>初級</button>
        <button onClick={() => setLevel('intermediate')}
          className={`px-3 py-1 rounded text-sm ${level === 'intermediate' ? 'bg-sky-100 text-sky-700' : 'border text-gray-500'}`}>中級</button>
      </div>
      <h1 className="text-lg font-medium">{info.title}・考試資訊</h1>
      <p className="text-sm text-gray-600 leading-relaxed">{info.notes}</p>
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
