import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../utils/api'

export default function Upload() {
  const [title, setTitle]           = useState('')
  const [tenderPdf, setTenderPdf]   = useState(null)
  const [suppPdfs, setSuppPdfs]     = useState([])
  const [boq, setBoq]               = useState(null)
  const [images, setImages]         = useState([])
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const [progress, setProgress]     = useState('')
  const navigate = useNavigate()

  const submit = async (e) => {
    e.preventDefault()
    if (!tenderPdf) return setError('Main Tender PDF is required')
    setLoading(true); setError('')

    try {
      // Step 1: create tender record
      setProgress('Creating tender record…')
      const fd1 = new FormData()
      fd1.append('title', title)
      const { data: t } = await api.post('/tenders/', fd1)
      const tid = t.id

      // Step 2: upload files
      setProgress('Uploading documents…')
      const fd2 = new FormData()
      fd2.append('tender_pdf', tenderPdf)
      suppPdfs.forEach((f) => fd2.append('supporting_pdfs', f))
      if (boq) fd2.append('boq_file', boq)
      images.forEach((f) => fd2.append('images', f))
      await api.post(`/tenders/${tid}/upload`, fd2)

      navigate(`/tender/${tid}`)
    } catch (err) {
      setError(err.response?.data?.detail || 'Upload failed. Please try again.')
      setLoading(false)
      setProgress('')
    }
  }

  const FileRow = ({ label, required, accept, multiple, onChange, selected }) => (
    <div className="card">
      <label className="block text-sm font-semibold text-navy mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <input
        type="file"
        accept={accept}
        multiple={multiple}
        className="input text-sm text-gray-500 file:mr-3 file:py-1 file:px-3 file:rounded file:border-0 file:text-xs file:font-medium file:bg-navy-50 file:text-navy cursor-pointer"
        onChange={onChange}
      />
      {selected && (
        <p className="text-xs text-green-600 mt-1.5 font-medium">
          ✓ {Array.isArray(selected) ? `${selected.length} file(s) selected` : selected.name}
        </p>
      )}
    </div>
  )

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-navy mb-1">Upload Tender Documents</h1>
      <p className="text-sm text-gray-500 mb-6">Max 5 MB per file. PDF files only for documents.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
          {error}
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="card">
          <label className="block text-sm font-semibold text-navy mb-1">
            Tender Title <span className="text-red-500">*</span>
          </label>
          <input
            className="input"
            required
            value={title}
            placeholder="e.g. Construction of Road — District HQ 2025"
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <FileRow
          label="Main Tender PDF (NIT/RFP)"
          required
          accept=".pdf"
          onChange={(e) => setTenderPdf(e.target.files[0])}
          selected={tenderPdf}
        />

        <FileRow
          label="Supporting Documents (up to 20 PDFs)"
          accept=".pdf"
          multiple
          onChange={(e) => setSuppPdfs(Array.from(e.target.files).slice(0, 20))}
          selected={suppPdfs.length > 0 ? suppPdfs : null}
        />

        <FileRow
          label="BOQ Excel File (.xlsx)"
          accept=".xlsx,.xls"
          onChange={(e) => setBoq(e.target.files[0])}
          selected={boq}
        />

        <FileRow
          label="Images (optional)"
          accept="image/*"
          multiple
          onChange={(e) => setImages(Array.from(e.target.files))}
          selected={images.length > 0 ? images : null}
        />

        {loading && (
          <div className="text-sm text-navy text-center py-2 font-medium">{progress}</div>
        )}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
          {loading ? 'Uploading…' : 'Upload & Continue →'}
        </button>
      </form>
    </div>
  )
}
