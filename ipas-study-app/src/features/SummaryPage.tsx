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
