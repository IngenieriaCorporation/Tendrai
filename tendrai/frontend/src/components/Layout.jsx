import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom'
import { getUser, clearAuth } from '../utils/auth'
import logo from '../assets/logo.png'

const NAV = [
  { to: '/',          label: 'Home' },
  { to: '/upload',    label: 'New Tender' },
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/payment',   label: 'Payment' },
]

export default function Layout() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const user = getUser()

  const logout = () => { clearAuth(); navigate('/login') }

  return (
    <div className="min-h-screen flex flex-col bg-brand-bg">
      {/* ── Navbar ── */}
      <header className="bg-navy text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <img src={logo} alt="TendrAI" className="h-8 w-auto" />
          </Link>

          <nav className="hidden md:flex items-center gap-0.5">
            {NAV.map(({ to, label }) => (
              <Link
                key={to}
                to={to}
                className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
                  pathname === to
                    ? 'bg-white/20 text-white'
                    : 'text-white/75 hover:text-white hover:bg-white/10'
                }`}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-3">
            <span className="hidden sm:block text-xs text-white/60 truncate max-w-[160px]">
              {user?.email}
            </span>
            <button
              onClick={logout}
              className="border border-white/30 text-white/80 hover:text-white px-3 py-1 rounded text-xs font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── Page ── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 py-8">
        <Outlet />
      </main>

      {/* ── Footer ── */}
      <footer className="bg-white border-t border-brand-border text-center text-xs text-gray-400 py-3">
        Tendrai assists in documentation preparation and submission support.
        Final responsibility remains with the bidder.
      </footer>
    </div>
  )
}
