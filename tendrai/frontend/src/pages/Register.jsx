import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../utils/api'
import logo from '../assets/logo.png'

export default function Register() {
  const [form, setForm]     = useState({ email: '', full_name: '', password: '', confirm: '' })
  const [error, setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }))

  const submit = async (e) => {
    e.preventDefault()
    if (form.password !== form.confirm) return setError('Passwords do not match')
    if (form.password.length < 6)       return setError('Password must be at least 6 characters')
    setLoading(true); setError('')
    try {
      await api.post('/auth/register', {
        email: form.email,
        full_name: form.full_name,
        password: form.password,
      })
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <img src={logo} alt="TendrAI" className="h-16 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-navy">Create Account</h1>
          <p className="text-sm text-gray-500 mt-1">Start automating your tender process</p>
        </div>

        <div className="card">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded px-3 py-2 mb-4">
              {error}
            </div>
          )}
          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Full Name</label>
              <input className="input" required value={form.full_name}
                onChange={set('full_name')} placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Email Address</label>
              <input className="input" type="email" required value={form.email}
                onChange={set('email')} placeholder="you@company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Password</label>
              <input className="input" type="password" required value={form.password}
                onChange={set('password')} placeholder="Min. 6 characters" />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy mb-1">Confirm Password</label>
              <input className="input" type="password" required value={form.confirm}
                onChange={set('confirm')} placeholder="Repeat password" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-2.5">
              {loading ? 'Creating account…' : 'Register'}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-5">
            Already registered?{' '}
            <Link to="/login" className="text-navy font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
