export function ProgressBar({ value }: { value: number }) {
  const pct = Math.round(Math.max(0, Math.min(1, value)) * 100)
  return (
    <div className="h-1.5 bg-gray-100 rounded-full">
      <div className="h-1.5 bg-sky-600 rounded-full" style={{ width: `${pct}%` }} />
    </div>
  )
}
