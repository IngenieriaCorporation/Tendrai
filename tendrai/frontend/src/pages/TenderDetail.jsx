import { useState, useEffect, useRef } from 'react'
import { useParams } from 'react-router-dom'
import api from '../utils/api'
import StatusBadge from '../components/StatusBadge'

// ── Sub-components ────────────────────────────────────────────────────────

function Field({ label, value }) {
  return (
    <div className="py-3 border-b border-brand-border last:border-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-1">{label}</p>
      <p className="text-sm text-navy leading-relaxed">
        {value || <span className="italic text-gray-300">Not specified</span>}
      </p>
    </div>
  )
}

function ListField({ label, items }) {
  return (
    <div className="py-3 border-b border-brand-border last:border-0">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">{label}</p>
      {items?.length ? (
        <ul className="space-y-1">
          {items.map((item, i) => (
            <li key={i} className="text-sm text-navy flex gap-2">
              <span className="text-gray-300 shrink-0">•</span> {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm italic text-gray-300">None listed</p>
      )}
    </div>
  )
}

function DatesTable({ dates }) {
  if (!dates?.length) return <p className="text-sm italic text-gray-300 py-2">No dates found</p>
  return (
    <table className="w-full text-sm mt-1">
      <thead>
        <tr className="border-b border-brand-border">
          <th className="text-left text-gray-400 font-medium pb-2 text-xs">Event</th>
          <th className="text-left text-gray-400 font-medium pb-2 text-xs">Date</th>
        </tr>
      </thead>
      <tbody>
        {dates.map((d, i) => (
          <tr key={i} className="border-b border-brand-border last:border-0">
            <td className="py-2 text-navy pr-4">{d.event}</td>
            <td className="py-2 text-gray-600 font-medium">{d.date}</td>
          </tr>
        ))}
      </tbody>
    </table>
  )
}

// ── Main Component ────────────────────────────────────────────────────────

const TABS = ['data', 'command', 'history', 'audit']
const TAB_LABELS = {
  data: '📋 Extracted Data',
  command: '💬 AI Commands',
  history: '🕐 Version History',
  audit: '📝 Audit Log',
}

export default function TenderDetail() {
  const { id } = useParams()
  const [tender, setTender]       = useState(null)
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('data')
  const [analyzing, setAnalyzing] = useState(false)
  const [generating, setGenerating] = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState('')

  // Command bar state
  const [command, setCommand]     = useState('')
  const [cmdBusy, setCmdBusy]     = useState(false)
  const [messages, setMessages]   = useState([])

  // Audit
  const [auditLogs, setAuditLogs] = useState([])

  const msgRef = useRef(null)

  const load = async () => {
    try {
      const { data } = await api.get(`/tenders/${id}`)
      setTender(data)
    } catch { setError('Failed to load tender') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [id])

  useEffect(() => {
    if (tab === 'audit') {
      api.get(`/tenders/${id}/audit`).then((r) => setAuditLogs(r.data)).catch(() => {})
    }
  }, [tab])

  useEffect(() => {
    if (msgRef.current) msgRef.current.scrollTop = msgRef.current.scrollHeight
  }, [messages])

  const flash = (msg, isErr = false) => {
    isErr ? setError(msg) : setSuccess(msg)
    setTimeout(() => isErr ? setError('') : setSuccess(''), 4000)
  }

  const analyze = async () => {
    setAnalyzing(true); setError('')
    try {
      const { data } = await api.post(`/tenders/${id}/analyze`)
      setTender((t) => ({ ...t, status: data.status, extracted_data: data.data }))
      setTab('data')
      flash('AI extraction complete!')
    } catch (e) {
      flash(e.response?.data?.detail || 'Analysis failed', true)
    } finally { setAnalyzing(false) }
  }

  const generate = async () => {
    setGenerating(true); setError('')
    try {
      await api.post(`/tenders/${id}/generate`)
      await load()
      flash('Documents generated! Download ZIP below.')
    } catch (e) {
      flash(e.response?.data?.detail || 'Generation failed', true)
    } finally { setGenerating(false) }
  }

  const sendCommand = async (e) => {
    e.preventDefault()
    const cmd = command.trim()
    if (!cmd) return
    setCommand('')
    setMessages((m) => [...m, { role: 'user', text: cmd }])
    setCmdBusy(true)
    try {
      const { data } = await api.post(`/tenders/${id}/command`, { command: cmd })
      setMessages((m) => [...m, { role: 'ai', text: `✓ ${data.summary}` }])
      setTender((t) => ({ ...t, extracted_data: data.data }))
    } catch (e) {
      setMessages((m) => [...m, { role: 'ai', text: `⚠ ${e.response?.data?.detail || 'Command failed'}`, err: true }])
    } finally { setCmdBusy(false) }
  }

  if (loading) return <div className="text-center py-24 text-gray-400 text-sm">Loading tender…</div>
  if (!tender) return <div className="text-center py-24 text-red-400 text-sm">Tender not found.</div>

  const d = tender.extracted_data

  return (
    <div className="max-w-5xl mx-auto space-y-4">

      {/* ── Header ── */}
      <div className="card flex items-start gap-4 justify-between flex-wrap">
        <div>
          <h1 className="text-xl font-bold text-navy">{tender.title}</h1>
          <div className="mt-1">
            <StatusBadge status={tender.status} />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {['uploaded', 'analyzed'].includes(tender.status) && (
            <button onClick={analyze} disabled={analyzing} className="btn-primary">
              {analyzing ? 'Analyzing…' : '🤖 Run AI Analysis'}
            </button>
          )}
          {tender.status === 'analyzed' && (
            <button onClick={generate} disabled={generating} className="btn-green">
              {generating ? 'Generating…' : '📦 Generate Documents'}
            </button>
          )}
          {tender.status === 'completed' && (
            <>
              <button onClick={generate} disabled={generating} className="btn-secondary text-sm">
                {generating ? '…' : '↺ Regenerate'}
              </button>
              <a
                href={`${import.meta.env.VITE_API_URL || ''}/api/tenders/${id}/download`}
                className="btn-green inline-flex items-center gap-1"
              >
                ⬇ Download ZIP
              </a>
            </>
          )}
        </div>
      </div>

      {/* ── Alerts ── */}
      {error   && <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-4 py-2">{error}</div>}
      {success && <div className="bg-green-50 border border-green-200 text-green-700 text-sm rounded px-4 py-2">{success}</div>}

      {/* ── Tabs ── */}
      <div className="border-b border-brand-border flex gap-0 overflow-x-auto">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t
                ? 'border-navy text-navy'
                : 'border-transparent text-gray-400 hover:text-navy'
            }`}
          >
            {TAB_LABELS[t]}
          </button>
        ))}
      </div>

      {/* ── Data Tab ── */}
      {tab === 'data' && (
        <div className="card">
          {!d ? (
            <div className="text-center py-12">
              <p className="text-gray-400 text-sm mb-4">No extracted data yet.</p>
              <button onClick={analyze} disabled={analyzing} className="btn-primary">
                {analyzing ? 'Analyzing…' : '🤖 Run AI Analysis'}
              </button>
            </div>
          ) : (
            <dl>
              <Field label="Eligibility Criteria" value={d.eligibility} />
              <Field label="EMD Requirement"       value={d.emd} />
              <Field label="Minimum Turnover"      value={d.turnover} />
              <Field label="Experience Required"   value={d.experience} />
              <ListField label="Certificates Required"   items={d.certificates_required} />
              <ListField label="Technical Requirements"  items={d.technical_requirements} />
              <div className="py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
                  Important Dates
                </p>
                <DatesTable dates={d.important_dates} />
              </div>
            </dl>
          )}
        </div>
      )}

      {/* ── Command Tab ── */}
      {tab === 'command' && (
        <div className="card flex flex-col" style={{ height: '500px' }}>
          <div className="mb-3">
            <p className="text-xs text-gray-400">
              Try:{' '}
              {[
                '"Change turnover to 2 crore"',
                '"Add ISO 14001 certificate"',
                '"Remove EMD clause"',
                '"Set experience to 5 years"',
              ].join('  ·  ')}
            </p>
          </div>

          <div ref={msgRef} className="flex-1 overflow-y-auto space-y-3 pr-1 mb-3">
            {messages.length === 0 && (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-300 text-sm text-center">
                  {d ? 'Type a command to modify the tender data' : 'Run AI Analysis first to extract data'}
                </p>
              </div>
            )}
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[78%] px-4 py-2.5 rounded-lg text-sm leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-navy text-white'
                      : m.err
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : 'bg-brand-bg text-navy border border-brand-border'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
            {cmdBusy && (
              <div className="flex justify-start">
                <div className="bg-brand-bg border border-brand-border text-gray-400 text-sm px-4 py-2.5 rounded-lg">
                  Processing command…
                </div>
              </div>
            )}
          </div>

          <form onSubmit={sendCommand} className="flex gap-2 border-t border-brand-border pt-3">
            <input
              className="input flex-1"
              value={command}
              disabled={!d || cmdBusy}
              placeholder={d ? 'Type a command…' : 'Run AI Analysis first'}
              onChange={(e) => setCommand(e.target.value)}
            />
            <button type="submit" disabled={!d || cmdBusy || !command.trim()} className="btn-primary px-5">
              Send
            </button>
          </form>
        </div>
      )}

      {/* ── History Tab ── */}
      {tab === 'history' && (
        <div className="card p-0 overflow-hidden">
          {!tender.version_history?.length ? (
            <p className="text-gray-400 text-sm text-center py-10">No version history yet.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Version</th>
                  <th className="text-left px-4 py-3 font-medium">Command / Action</th>
                  <th className="text-left px-4 py-3 font-medium">Summary</th>
                  <th className="text-left px-4 py-3 font-medium">Time</th>
                </tr>
              </thead>
              <tbody>
                {[...tender.version_history].reverse().map((v, i) => (
                  <tr key={i} className={`border-b border-brand-border ${i % 2 === 0 ? 'bg-white' : 'bg-brand-bg'}`}>
                    <td className="px-4 py-3 font-semibold text-navy">v{v.version}</td>
                    <td className="px-4 py-3 text-gray-600 max-w-xs truncate">
                      {v.command || 'Initial extraction'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{v.summary || '—'}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">{v.timestamp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ── Audit Tab ── */}
      {tab === 'audit' && (
        <div className="card p-0 overflow-hidden">
          {!auditLogs.length ? (
            <p className="text-gray-400 text-sm text-center py-10">No audit logs.</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-navy text-white">
                <tr>
                  <th className="text-left px-4 py-3 font-medium">Action</th>
                  <th className="text-left px-4 py-3 font-medium">Details</th>
                  <th className="text-left px-4 py-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {auditLogs.map((log, i) => (
                  <tr key={i} className={`border-b border-brand-border ${i % 2 === 0 ? 'bg-white' : 'bg-brand-bg'}`}>
                    <td className="px-4 py-3 font-semibold text-navy text-xs">{log.action}</td>
                    <td className="px-4 py-3 text-gray-600 text-xs max-w-sm">{log.details}</td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
