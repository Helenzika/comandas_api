import { FaBars, FaBell, FaUserCircle } from 'react-icons/fa';

export default function Topbar({ toggleMobile }) {
  return (
    <header style={{
      height: '60px',
      backgroundColor: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 20px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      zIndex: 10
    }}>
      {/* Botão Hambúrguer (Só aparece no Mobile via CSS/MainLayout) */}
      <button 
        onClick={toggleMobile}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.5rem',
          cursor: 'pointer',
          color: '#1e293b',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <FaBars />
      </button>

      {/* Título ou Logo curta */}
      <div style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '1.2rem' }}>
        Sistema de Comandas
      </div>

      {/* Ícones da Direita */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
        <FaBell style={{ color: '#64748b', cursor: 'pointer' }} />
        <FaUserCircle size={25} style={{ color: '#1e293b', cursor: 'pointer' }} />
      </div>
    </header>
  );
}