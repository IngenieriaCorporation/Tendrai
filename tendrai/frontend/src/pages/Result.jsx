import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import api from '../utils/api'
import StatusBadge from '../components/StatusBadge'

const ZIP_CONTENTS = [
  '📄  Cover_Letter.pdf',
  '✅  Compliance.pdf',
  '📝  Summary.txt',
  '📊  BOQ.xlsx  (if uploaded)',
  '🖼   Images/  (if uploaded)',
]

export default function Result() {
  const { id }        = useParams()
  const [tender, setTender]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get(`/tenders/${id}`)
      .then((r) => setTender(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="text-center py-24 text-gray-400 text-sm">Loading…</div>
  if (!tender) return <div className="text-center py-24 text-red-400 text-sm">Tender not found.</div>

  const isComplete = tender.status === 'completed'

  return (
    <div className="max-w-xl mx-auto">
      <div className="card text-center space-y-4">
        <div className="text-5xl">{isComplete ? '✅' : '⏳'}</div>

        <h1 className="text-xl font-bold text-navy">{tender.title}</h1>
        <StatusBadge status={tender.status} />

        <p className="text-gray-500 text-sm">
          {isComplete
            ? 'Your tender package is ready. Download the ZIP and submit.'
            : `Status: ${tender.status}. Return to the tender to continue the workflow.`}
        </p>

        {isComplete && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
            <p className="font-semibold text-green-800 text-sm mb-3">📦 Tender_Final.zip contains:</p>
            <ul className="space-y-1.5">
              {ZIP_CONTENTS.map((line) => (
                <li key={line} className="text-green-700 text-sm">{line}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 justify-center flex-wrap pt-2">
          {isComplete && (
            <a
              href={`${import.meta.env.VITE_API_URL || ''}/api/tenders/${id}/download`}
              className="btn-green"
            >
              ⬇ Download ZIP
            </a>
          )}
          <Link to={`/tender/${id}`} className="btn-secondary">View Tender</Link>
          <Link to="/dashboard"      className="btn-secondary">Dashboard</Link>
        </div>
      </div>
    </div>
  )
}
