import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import { setAuth } from '../utils/auth'
import logo from '../assets/logo.png'

export default function Login() {
  const [form, setForm]     = useState({ email: '', password: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const { data } = await api.post('/auth/login', form)
      setAuth(data.access_token, { email: form.email })
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Check credentials.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="TendrAI" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy">Sign in to TendrAI</h1>
          <p className="text-sm text-gray-500 mt-1">AI-Powered Tender Management Platform</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Email Address</label>
              <input className="input" type="email" required
                value={form.email} onChange={set('email')}
                placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Password</label>
              <input className="input" type="password" required
                value={form.password} onChange={set('password')}
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            No account?{' '}
            <Link to="/register" className="text-navy font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
