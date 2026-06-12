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
