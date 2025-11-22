import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { PermissionProvider } from './contexts/PermissionContext'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ValoracionPublica from './pages/ValoracionPublica'

function App() {
  const isAuthenticated = localStorage.getItem('isAuthenticated')

  return (
    <PermissionProvider>
      <Router>
        <Routes>
          {/* Ruta pública de valoración */}
          <Route path="/valoracion" element={<ValoracionPublica />} />
          
          <Route path="/login" element={<Login />} />
          <Route 
            path="/dashboard" 
            element={isAuthenticated ? <Dashboard /> : <Navigate to="/login" />} 
          />
          <Route path="/" element={<Navigate to="/login" />} />
        </Routes>
      </Router>
    </PermissionProvider>
  )
}

export default App
