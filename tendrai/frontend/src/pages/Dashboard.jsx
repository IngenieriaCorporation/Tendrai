import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../utils/api'
import StatusBadge from '../components/StatusBadge'

export default function Dashboard() {
  const [tenders, setTenders] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/tenders/')
      .then((r) => setTenders(r.data))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400 text-sm">
        Loading tenders…
      </div>
    )
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <h1 className="text-xl font-bold text-navy">My Tenders</h1>
        <Link to="/upload" className="btn-primary">+ New Tender</Link>
      </div>

      {tenders.length === 0 ? (
        <div className="card text-center py-16">
          <div className="text-4xl mb-4">📂</div>
          <p className="text-gray-400 mb-4 text-sm">No tenders yet.</p>
          <Link to="/upload" className="btn-primary">Upload First Tender</Link>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Title</th>
                  <th className="text-left px-4 py-3 font-medium">Status</th>
                  <th className="text-left px-4 py-3 font-medium">Created</th>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {tenders.map((t, i) => (
                  <tr
                    key={t.id}
                    className={`border-b border-brand-border last:border-0 ${
                      i % 2 === 0 ? 'bg-white' : 'bg-brand-bg'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-navy max-w-xs truncate">
                      {t.title}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {new Date(t.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`/tender/${t.id}`}
                        className="text-navy font-semibold hover:underline text-sm"
                      >
                        Open →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
