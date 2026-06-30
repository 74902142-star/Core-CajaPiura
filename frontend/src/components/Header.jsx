import { useAuth } from '../contexts/AuthContext';
import logoImg from '../assets/images/ic_launcher_cp.png';

export default function Header() {
  const { user, logout } = useAuth();
  const initials = user ? `${user.nombre?.[0] || ''}${user.apellido?.[0] || ''}` : 'U';

  return (
    <div className="top-header">
      <div className="header-left">
        <img src={logoImg} alt="Caja Piura" />
        <span>Core Mobile - Caja Piura</span>
      </div>
      <div className="header-right">
        <span style={{ fontSize: '0.85rem', color: '#6C757D' }}>
          {user?.nombre} {user?.apellido}
        </span>
        <div className="header-avatar">{initials}</div>
        <button
          className="btn btn-sm btn-outline-secondary"
          onClick={logout}
          title="Cerrar sesión"
        >
          <i className="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </div>
  );
}
