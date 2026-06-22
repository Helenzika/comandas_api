///helen de oliveira
import { useState, useEffect } from 'react';
import api from '../services/api';
import helenPhoto from '../assets/helen.jpg'; 

export default function Dashboard() {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const response = await api.get('/recebimento/dashboard');
        // Filtra as comandas REAIS vindas do Docker se tiverem sido fechadas na sessão
        const ativas = response.data.filter(item => !sessionStorage.getItem(`comanda_fechada_${item.id}`));
        setComandas(ativas);
      } catch (error) {

        const dadosSimulados = [
          { id: 1, comanda: "Helen", quantidade_produtos: 3, total: 29.00, status: 0, data_hora: "24/06/2026 20:15" },
          { id: 2, comanda: "Mesa 05", quantidade_produtos: 3, total: 40.50, status: 0, data_hora: "24/06/2026 19:30" },
          { id: 3, comanda: "Mesa 12", quantidade_produtos: 2, total: 22.00, status: 0, data_hora: "24/06/2026 19:45" }
        ];

        const filtradas = dadosSimulados.filter(item => !sessionStorage.getItem(`comanda_fechada_${item.id}`));
        setComandas(filtradas);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div style={{ padding: '20px', color: '#1e293b', backgroundColor: '#f8fafc', height: '100vh' }}>Carregando Dashboard...</div>;
  }

  return (
    <div style={{ padding: '30px', backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#1e293b', flex: 1 }}>
      
      {/* CABEÇALHO WHITE MODE */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', border: '1px solid #e2e8f0' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>Comandas do Zé</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b' }}>Painel do Caixa - Monitor de Comandas Abertas</p>
        </div>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginLeft: 'auto' }}>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: '0.8rem', color: '#64748b' }}>Aluno(a) Logado(a)</span>
            <strong style={{ display: 'block', color: '#0f172a' }}>Helen</strong>
          </div>
          <img 
            src={helenPhoto} 
            alt="Helen" 
            style={{ width: '60px', height: '60px', borderRadius: '50%', border: '2px solid #0284c7', objectFit: 'cover' }}
          />
        </div>
      </div>

      <h2 style={{ fontSize: '1.3rem', marginBottom: '20px', color: '#334155' }}>Comandas Atualmente Abertas ({comandas.length})</h2>
      
      {/* GRID DE CARDS CLAROS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '20px' }}>
        {comandas.map((item) => (
          <div key={item.id} style={{ backgroundColor: '#ffffff', borderRadius: '10px', padding: '20px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#0f172a' }}>{item.comanda}</span>
              <span style={{ backgroundColor: '#e0f2fe', color: '#0369a1', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>ABERTA</span>
            </div>
            
            <div style={{ color: '#475569', fontSize: '0.9rem', marginBottom: '15px' }}>
              <p style={{ margin: '5px 0' }}>📦 Qtd. Itens: <strong style={{ color: '#0f172a' }}>{item.quantidade_produtos}</strong></p>
              <p style={{ margin: '5px 0' }}>⏰ Abertura: {item.data_hora}</p>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '15px', borderTop: '1px solid #f1f5f9' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Total</span>
                <span style={{ fontSize: '1.4rem', fontWeight: 'bold', color: '#16a34a' }}>R$ {item.total.toFixed(2).replace('.', ',')}</span>
              </div>
              <button 
                style={{ backgroundColor: '#16a34a', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
                onClick={() => window.location.href = `/caixa?comanda=${item.id}`}
              >
                Atender
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}