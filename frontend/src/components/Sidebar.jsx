import { NavLink } from 'react-router-dom';
import logoImg from '../assets/images/ic_launcher_cp.png';

const menuItems = [
  { path: '/dashboard', icon: 'bi-speedometer2', label: 'Dashboard' },
  { path: '/cartera', icon: 'bi-clipboard2-data', label: 'Cartera del día' },
  { path: '/ficha-cliente', icon: 'bi-person', label: 'Ficha cliente' },
  { path: '/pre-evaluacion', icon: 'bi-calculator', label: 'Pre-evaluación' },
  { path: '/solicitud', icon: 'bi-file-earmark-text', label: 'Solicitud' },
  { path: '/buro', icon: 'bi-bank', label: 'Buró' },
  { path: '/mis-solicitudes', icon: 'bi-box', label: 'Mis solicitudes' },
  { path: '/desembolso', icon: 'bi-cash-stack', label: 'Desembolso' },
];

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <img src={logoImg} alt="Caja Piura" className="sidebar-logo-img" />
        <h6>Core Mobile</h6>
      </div>
      <nav className="sidebar-menu">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => isActive ? 'active' : ''}
          >
            <i className={`bi ${item.icon}`}></i>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
