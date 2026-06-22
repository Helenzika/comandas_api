///helen de oliveira
import { useState, useEffect } from 'react';

export default function Funcionarios() {
  const [funcionarios, setFuncionarios] = useState([]);
  const [modalAberto, setModalAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [nome, setNome] = useState('');
  const [cargo, setCargo] = useState('caixa');

  const listaPadrao = [
    { id: 1, nome: "helen", cargo: "operador de caixa" },
    { id: 2, nome: "seu zé", cargo: "gerente / proprietário" },
    { id: 3, nome: "lucas atendente", cargo: "atendente de mesa" }
  ];

  const carregarDados = () => {
    const locais = JSON.parse(sessionStorage.getItem('funcionarios_crud'));
    if (locais) {
      setFuncionarios(locais);
    } else {
      sessionStorage.setItem('funcionarios_crud', JSON.stringify(listaPadrao));
      setFuncionarios(listaPadrao);
    }
  };

  useEffect(() => { carregarDados(); }, []);

  const handleSalvar = (e) => {
    e.preventDefault();
    if (!nome) return;

    const todos = JSON.parse(sessionStorage.getItem('funcionarios_crud') || '[]');

    if (idEditando) {
      const atualizados = todos.map(f => f.id === idEditando ? { ...f, nome: nome.toLowerCase(), cargo } : f);
      sessionStorage.setItem('funcionarios_crud', JSON.stringify(atualizados));
    } else {
      const novo = { id: Math.floor(Math.random() * 1000) + 10, nome: nome.toLowerCase(), cargo };
      todos.push(novo);
      sessionStorage.setItem('funcionarios_crud', JSON.stringify(todos));
    }

    setNome(''); setCargo('caixa'); setIdEditando(null); setModalAberto(false);
    carregarDados();
  };

  const deletar = (id) => {
    if (window.confirm("Remover este funcionário do sistema?")) {
      const todos = JSON.parse(sessionStorage.getItem('funcionarios_crud') || '[]');
      sessionStorage.setItem('funcionarios_crud', JSON.stringify(todos.filter(f => f.id !== id)));
      carregarDados();
    }
  };

  return (
    <div style={{ padding: '30px', backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#1e293b', flex: 1 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a' }}>Equipe de Funcionários</h1>
          <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Controle de acessos e colaboradores do estabelecimento.</p>
        </div>
        <button onClick={() => { setIdEditando(null); setNome(''); setCargo('operador de caixa'); setModalAberto(true); }} style={{ padding: '12px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>
          ➕ Novo Colaborador
        </button>
      </div>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Funcionário</th>
              <th style={{ padding: '12px' }}>Cargo / Atribuição</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {funcionarios.map(f => (
              <tr key={f.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={{ padding: '12px' }}>#{f.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{f.nome}</td>
                <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#f1f5f9', padding: '4px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '0.85rem' }}>{f.cargo}</span></td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  <button onClick={() => { setIdEditando(f.id); setNome(f.nome); setCargo(f.cargo); setModalAberto(true); }} style={{ padding: '5px 10px', marginRight: '5px', backgroundColor: '#f1f5f9', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer' }}>✏️ Editar</button>
                  <button onClick={() => deletar(f.id)} style={{ padding: '5px 10px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>🗑️ Remover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <form onSubmit={handleSalvar} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a' }}>{idEditando ? '✏️ Editar Colaborador' : '🧑‍💼 Novo Colaborador'}</h2>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Nome do Profissional</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="ex: ricardo souza" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ marginBottom: '25px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px' }}>Função</label>
              <input type="text" value={cargo} onChange={e => setCargo(e.target.value)} placeholder="ex: operador de caixa" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>Salvar Colaborador</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}