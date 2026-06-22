import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Menu Lateral Fixo */}
      <Sidebar />

      {/* Conteúdo à direita */}
      <main style={{ flex: 1, padding: '40px', overflowY: 'auto', backgroundColor: '#f8fafc' }}>
        <Outlet />
      </main>
    </div>
  );
}
