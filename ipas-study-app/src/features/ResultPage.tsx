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
