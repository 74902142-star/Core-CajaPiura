import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Cartera from './pages/Cartera';
import FichaCliente from './pages/FichaCliente';
import PreEvaluacion from './pages/PreEvaluacion';
import SolicitudCredito from './pages/SolicitudCredito';
import Buro from './pages/Buro';
import MisSolicitudes from './pages/MisSolicitudes';
import Desembolso from './pages/Desembolso';
import NotFound from './pages/NotFound';

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <Navigate to="/dashboard" replace /> : children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/cartera" element={<ProtectedRoute><Cartera /></ProtectedRoute>} />
          <Route path="/ficha-cliente" element={<ProtectedRoute><FichaCliente /></ProtectedRoute>} />
          <Route path="/pre-evaluacion" element={<ProtectedRoute><PreEvaluacion /></ProtectedRoute>} />
          <Route path="/solicitud" element={<ProtectedRoute><SolicitudCredito /></ProtectedRoute>} />
          <Route path="/buro" element={<ProtectedRoute><Buro /></ProtectedRoute>} />
          <Route path="/mis-solicitudes" element={<ProtectedRoute><MisSolicitudes /></ProtectedRoute>} />
          <Route path="/desembolso" element={<ProtectedRoute><Desembolso /></ProtectedRoute>} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
