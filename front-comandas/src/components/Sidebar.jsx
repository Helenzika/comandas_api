import { Link, useLocation } from 'react-router-dom';
import helenPhoto from '../assets/helen.jpg';

export default function Sidebar() {
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/funcionarios', label: 'Funcionários', icon: '👥' },
    { path: '/clientes', label: 'Clientes', icon: '👤' },
    { path: '/produtos', label: 'Produtos', icon: '📦' },
    { path: '/comandas', label: 'Comandas', icon: '📋' },
    { path: '/caixa', label: 'Caixa', icon: '🏪' },
  ];

  return (
    <div style={{ width: '260px', backgroundColor: '#ffffff', minHeight: '100vh', borderRight: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', padding: '20px' }}>
      
      {/* Perfil Helen */}
      <div style={{ textAlign: 'center', marginBottom: '30px', paddingBottom: '20px', borderBottom: '1px solid #e2e8f0' }}>
        <img src={helenPhoto} alt="Helen" style={{ width: '70px', height: '70px', borderRadius: '50%', objectFit: 'cover', marginBottom: '10px', border: '2px solid #cbd5e1' }} />
        <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>Helen</h3>
        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Gerente Geral</span>
      </div>

      {/* Links do Menu */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 16px',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '0.95rem',
                color: isActive ? '#0284c7' : '#475569',
                backgroundColor: isActive ? '#f0f9ff' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Botão Sair */}
      <button 
        onClick={() => { sessionStorage.clear(); window.location.href = '/'; }}
        style={{ width: '100%', padding: '12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
      >
        🚪 Sair
      </button>
    </div>
  );
}