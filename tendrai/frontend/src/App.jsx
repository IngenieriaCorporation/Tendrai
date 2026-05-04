import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { isLoggedIn } from './utils/auth'
import Layout       from './components/Layout'
import Login        from './pages/Login'
import Register     from './pages/Register'
import Home         from './pages/Home'
import Upload       from './pages/Upload'
import Dashboard    from './pages/Dashboard'
import TenderDetail from './pages/TenderDetail'
import Payment      from './pages/Payment'
import Result       from './pages/Result'

function Protected({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login"    element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Protected><Layout /></Protected>}>
          <Route index            element={<Home />} />
          <Route path="upload"    element={<Upload />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="tender/:id" element={<TenderDetail />} />
          <Route path="payment"   element={<Payment />} />
          <Route path="result/:id" element={<Result />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
