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
