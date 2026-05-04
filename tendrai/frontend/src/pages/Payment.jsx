import { useState, useEffect } from 'react'
import api from '../utils/api'
import StatusBadge from '../components/StatusBadge'

export default function Payment() {
  const [amount, setAmount]   = useState('')
  const [desc, setDesc]       = useState('Tender Processing Fee')
  const [loading, setLoading] = useState(false)
  const [result, setResult]   = useState(null)
  const [error, setError]     = useState('')
  const [history, setHistory] = useState([])

  useEffect(() => {
    api.get('/payments/history')
      .then((r) => setHistory(r.data))
      .catch(() => {})
  }, [])

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError(''); setResult(null)
    try {
      const { data } = await api.post('/payments/create-payment', {
        amount: parseFloat(amount),
        description: desc,
      })
      setResult(data)
      // Refresh history
      api.get('/payments/history').then((r) => setHistory(r.data)).catch(() => {})
    } catch (err) {
      setError(err.response?.data?.detail || 'Payment initiation failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold text-navy">SBI ePay — Payment Gateway</h1>

      {/* Initiate Form */}
      <div className="card">
        <h2 className="font-semibold text-navy mb-4 text-sm">Initiate Payment Order</h2>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
            {error}
          </div>
        )}

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Amount (INR) *</label>
            <input
              className="input"
              type="number"
              min="1"
              step="0.01"
              required
              value={amount}
              placeholder="e.g. 2500.00"
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy mb-1">Description</label>
            <input
              className="input"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
              placeholder="Tender Processing Fee"
            />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
            {loading ? 'Processing…' : 'Create Payment Order'}
          </button>
        </form>

        {/* Order Result */}
        {result && (
          <div className="mt-5 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="font-semibold text-blue-800 text-sm mb-3">✓ Payment Order Created</p>
            <table className="w-full text-xs">
              <tbody className="divide-y divide-blue-100">
                {[
                  ['Order ID',    result.order_id],
                  ['Merchant ID', result.merchant_id],
                  ['Amount',      `₹${result.amount.toFixed(2)}`],
                  ['Status',      result.status],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-1.5 pr-4 text-blue-600 font-medium w-28">{k}</td>
                    <td className="py-1.5 font-mono text-navy">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="text-xs text-blue-600 mt-3 leading-relaxed">{result.note}</p>
          </div>
        )}
      </div>

      {/* History */}
      {history.length > 0 && (
        <div className="card p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-brand-border">
            <h2 className="font-semibold text-navy text-sm">Payment History</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-gray-500 text-xs">
                <tr>
                  <th className="text-left px-4 py-2 font-medium">Order ID</th>
                  <th className="text-left px-4 py-2 font-medium">Amount</th>
                  <th className="text-left px-4 py-2 font-medium">Status</th>
                  <th className="text-left px-4 py-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                {history.map((p, i) => (
                  <tr
                    key={i}
                    className={`border-b border-brand-border last:border-0 ${i % 2 === 0 ? 'bg-white' : 'bg-brand-bg'}`}
                  >
                    <td className="px-4 py-2.5 font-mono text-xs text-gray-600">{p.order_id}</td>
                    <td className="px-4 py-2.5 font-medium">₹{p.amount.toFixed(2)}</td>
                    <td className="px-4 py-2.5">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-4 py-2.5 text-gray-400 text-xs">
                      {new Date(p.created_at).toLocaleDateString('en-IN', {
                        day: '2-digit', month: 'short', year: 'numeric',
                      })}
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
