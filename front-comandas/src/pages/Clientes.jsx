///helen de oliveira
import { useState, useEffect } from 'react';

export default function Clientes() {
  const [clientes, setClientes] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [telefone, setTelefone] = useState('');

  const listaPadrao = [
    { id: 1, nome: "helen", telefone: "(47) 99999-1111" },
    { id: 2, nome: "marcos silva", telefone: "(47) 98888-2222" },
    { id: 3, nome: "julia costa", telefone: "(47) 97777-3333" }
  ];

  const carregarDados = () => {
    const locais = JSON.parse(sessionStorage.getItem('clientes_crud'));
    if (locais) {
      setClientes(locais);
    } else {
      sessionStorage.setItem('clientes_crud', JSON.stringify(listaPadrao));
      setClientes(listaPadrao);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!nome) return;

    const todos = JSON.parse(sessionStorage.getItem('clientes_crud') || '[]');

    if (idEditando) {
      const atualizados = todos.map(c => c.id === idEditando ? { ...c, nome: nome.toLowerCase(), telefone } : c);
      sessionStorage.setItem('clientes_crud', JSON.stringify(atualizados));
    } else {
      const novo = { id: Math.floor(Math.random() * 1000) + 10, nome: nome.toLowerCase(), telefone };
      todos.push(novo);
      sessionStorage.setItem('clientes_crud', JSON.stringify(todos));
    }

    setNome(''); setTelefone(''); setIdEditando(null); setModalAberto(false);
    carregarDados();
  };

  const deletar = (id) => {
    if (window.confirm("Excluir este cliente?")) {
      const todos = JSON.parse(sessionStorage.getItem('clientes_crud') || '[]');
      sessionStorage.setItem('clientes_crud', JSON.stringify(todos.filter(c => c.id !== id)));
      carregarDados();
    }
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#1e293b', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>Cadastro de Clientes</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Gerencie os clientes frequentes da pastelaria.</p>
        </div>
        <button onClick={() => { setIdEditando(null); setNome(''); setTelefone(''); setModalAberto(true); }} style={{ padding: '12px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          ➕ Novo Cliente
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Nome</th>
              <th style={{ padding: '12px' }}>Contato/Telefone</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {clientes.map(c => (
              <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>#{c.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{c.nome}</td>
                <td style={{ padding: '12px' }}>{c.telefone || 'Não informado'}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button onClick={() => { setIdEditando(c.id); setNome(c.nome); setTelefone(c.telefone); setModalAberto(true); }} style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>✏️ Editar</button>
                  <button onClick={() => deletar(c.id)} style={{ padding: '5px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Excluir</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <form onSubmit={handleSalvar} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>{idEditando ? '✏️ Editar Cliente' : '👤 Novo Cliente'}</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Nome Completo</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="ex: joão silva" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Telefone</label>
              <input type="text" value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(47) 99999-9999" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Salvar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}