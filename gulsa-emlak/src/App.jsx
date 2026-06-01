import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import { SocketProvider } from './context/SocketContext'
import MainLayout from './components/Layout/MainLayout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Properties from './pages/Properties'
import PropertyDetail from './pages/PropertyDetail'
import AddEditProperty from './pages/AddEditProperty'
import MapView from './pages/MapView'
import Gallery from './pages/Gallery'
import Agents from './pages/Agents'
import Statistics from './pages/Statistics'
import Settings from './pages/Settings'
import { Toaster } from 'react-hot-toast'

function PrivateRoute({ children }) {
  const { user } = useAuth()
  return user ? children : <Navigate to="/" replace />
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth()
  if (!user) return <Navigate to="/" replace />
  if (!isAdmin) return <Navigate to="/dashboard" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
        <Route path="/dashboard"              element={<Dashboard />} />
        <Route path="/properties"             element={<Properties />} />
        <Route path="/properties/new"         element={<AddEditProperty />} />
        <Route path="/properties/:id"         element={<PropertyDetail />} />
        <Route path="/properties/:id/edit"    element={<AddEditProperty />} />
        <Route path="/map"                    element={<MapView />} />
        <Route path="/gallery"                element={<Gallery />} />
        <Route path="/agents"                 element={<AdminRoute><Agents /></AdminRoute>} />
        <Route path="/statistics"             element={<Statistics />} />
        <Route path="/settings"              element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <AppRoutes />
            <Toaster
              position="bottom-right"
              toastOptions={{
                duration: 3500,
                style: { borderRadius: '12px', fontSize: '14px' },
              }}
            />
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
