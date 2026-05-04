import { Link } from 'react-router-dom'
import { getUser } from '../utils/auth'

const FEATURES = [
  { icon: '📄', title: 'Upload Tender Docs',      desc: 'Main tender PDF, up to 20 supporting PDFs, BOQ Excel, and images.' },
  { icon: '🤖', title: 'AI Data Extraction',      desc: 'NLP parsing extracts eligibility, dates, EMD, turnover, and requirements automatically.' },
  { icon: '💬', title: 'Smart Command Bar',       desc: 'Edit extracted data with plain English: "Change turnover to 2 crore".' },
  { icon: '✅', title: 'Compliance Checklist',    desc: 'Auto-generated PDF checklist with all certificates and technical requirements.' },
  { icon: '📦', title: 'Document Package',        desc: 'One-click ZIP: cover letter, compliance doc, BOQ and summary ready to submit.' },
  { icon: '💳', title: 'SBI ePay Integration',   desc: 'Secure payment gateway flow for tender fee and EMD submission.' },
]

export default function Home() {
  const user = getUser()
  const name = user?.email?.split('@')[0] || 'there'

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="card flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-navy">Welcome back, {name}</h1>
          <p className="text-gray-500 text-sm mt-1">
            AI-powered tender documentation — reduce manual work by 90%.
          </p>
        </div>
        <Link to="/upload" className="btn-primary px-6 py-2.5 shrink-0">
          + New Tender
        </Link>
      </div>

      {/* Feature Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {FEATURES.map((f) => (
          <div key={f.title} className="card">
            <div className="text-3xl mb-3">{f.icon}</div>
            <h3 className="font-semibold text-navy mb-1 text-sm">{f.title}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="rounded-lg bg-navy p-6 text-white flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h2 className="font-semibold text-lg">Ready to automate your tender workflow?</h2>
          <p className="text-white/70 text-sm mt-1">
            Upload your first tender and let AI do the heavy lifting.
          </p>
        </div>
        <Link
          to="/upload"
          className="shrink-0 bg-white text-navy font-semibold px-5 py-2.5 rounded hover:bg-gray-100 transition-colors text-sm"
        >
          Get Started →
        </Link>
      </div>
    </div>
  )
}
