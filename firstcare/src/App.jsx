import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { TriageProvider } from './context/TriageContext'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Assess from './pages/Assess'
import Results from './pages/Results'
import Dashboard from './pages/Dashboard'
import Library from './pages/Library'
import Hospitals from './pages/Hospitals'
import NotFound from './pages/NotFound'

export default function App() {
  return (
    <AuthProvider>
      <TriageProvider>
        <BrowserRouter>
          <Navbar />
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/assess" element={<Assess />} />
            <Route path="/results" element={<Results />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/hospitals" element={<Hospitals />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TriageProvider>
    </AuthProvider>
  )
}
