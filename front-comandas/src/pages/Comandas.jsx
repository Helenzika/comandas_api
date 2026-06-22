///helen de oliveira
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Comandas() {
  const [comandas, setComandas] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados do Modal / Formulário do CRUD
  const [modalAberto, setModalAberto] = useState(false);
  const [idEditando, setIdEditando] = useState(null);
  const [nomeCliente, setNomeCliente] = useState('');
  const [itensSelecionados, setItensSelecionados] = useState([]);

  
  const opcoesProdutos = [
    { nome: "pastel de carne", preco: 12.00 },
    { id: 102, nome: "pastel de queijo", preco: 11.00 },
    { nome: "pastel de frango catupiry", preco: 14.00 },
    { nome: "pastel de vento", preco: 9.00 },
    { nome: "refrigerante lata", preco: 6.00 },
    { nome: "cerveja lata", preco: 8.50 },
    { nome: "cerveja artesanal", preco: 18.00 },
    { nome: "refrigerante 2l", preco: 13.00 }
  ];

  const listaPadrao = [
    { id: 1, comanda: "Helen", produtos: ["pastel de carne", "pastel de queijo", "refrigerante lata"], total: 29.00, data_hora: "24/06/2026 20:15" },
    { id: 2, comanda: "Mesa 05", produtos: ["pastel de frango catupiry", "cerveja artesanal", "cerveja lata"], total: 40.50, data_hora: "24/06/2026 19:30" },
    { id: 3, comanda: "Mesa 12", produtos: ["pastel de vento", "refrigerante 2l"], total: 22.00, data_hora: "24/06/2026 19:45" }
  ];

  const carregarDados = () => {
    // Busca do sessionStorage os dados customizados criados/editados pelo CRUD
    const locais = JSON.parse(sessionStorage.getItem('comandas_crud') || 'null');
    
    if (locais) {
      const filtradas = locais.filter(item => !sessionStorage.getItem(`comanda_fechada_${item.id}`));
      setComandas(filtradas);
      setLoading(false);
    } else {
      // Se não tem nada salvo ainda no CRUD, usa a lista padrão filtrando as pagas no caixa
      const filtradas = listaPadrao.filter(item => !sessionStorage.getItem(`comanda_fechada_${item.id}`));
      sessionStorage.setItem('comandas_crud', JSON.stringify(listaPadrao));
      setComandas(filtradas);
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, []);

  // [C]REATE & [U]PDATE - Salvar ou Atualizar Comanda
  const handleSalvarComanda = (e) => {
    e.preventDefault();
    if (!nomeCliente || itensSelecionados.length === 0) return;

    // Calcula o valor total com base nos itens marcados
    const totalCalculado = itensSelecionados.reduce((acc, itemNome) => {
      const prodObj = opcoesProdutos.find(p => p.nome === itemNome);
      return acc + (prodObj ? prodObj.preco : 0);
    }, 0);

    const todasNoStorage = JSON.parse(sessionStorage.getItem('comandas_crud') || '[]');

    if (idEditando) {
      // UPDATE: Edita uma comanda existente
      const listaAtualizada = todasNoStorage.map(c => {
        if (c.id === idEditando) {
          return { ...c, comanda: nomeCliente, produtos: itensSelecionados, total: totalCalculado };
        }
        return c;
      });
      sessionStorage.setItem('comandas_crud', JSON.stringify(listaAtualizada));
    } else {
      // CREATE: Cria uma nova comanda do zero
      const novaComanda = {
        id: Math.floor(Math.random() * 1000) + 10,
        comanda: nomeCliente,
        produtos: itensSelecionados,
        total: totalCalculado,
        data_hora: new Date().toLocaleString('pt-BR')
      };
      todasNoStorage.push(novaComanda);
      sessionStorage.setItem('comandas_crud', JSON.stringify(todasNoStorage));
    }

    // Reseta estados e recarrega a tela
    setNomeCliente('');
    setItensSelecionados([]);
    setIdEditando(null);
    setModalAberto(false);
    carregarDados();
  };

  // Abrir o modal para edição de dados existentes
  const iniciarEdicao = (comandaObj) => {
    setIdEditando(comandaObj.id);
    setNomeCliente(comandaObj.comanda);
    setItensSelecionados(comandaObj.produtos || []);
    setModalAberto(true);
  };

  // [D]ELETE - Excluir Comanda permanentemente
  const handleDeletarComanda = (id) => {
    if (window.confirm("Deseja realmente excluir esta comanda do sistema?")) {
      const todasNoStorage = JSON.parse(sessionStorage.getItem('comandas_crud') || '[]');
      const novaLista = todasNoStorage.filter(c => c.id !== id);
      sessionStorage.setItem('comandas_crud', JSON.stringify(novaLista));
      carregarDados();
    }
  };

  // Controlar os checkboxes dos produtos do formulário
  const handleCheckboxChange = (nomeProduto) => {
    if (itensSelecionados.includes(nomeProduto)) {
      setItensSelecionados(itensSelecionados.filter(i => i !== nomeProduto));
    } else {
      setItensSelecionados([...itensSelecionados, nomeProduto]);
    }
  };

  if (loading) {
    return <div style={{ padding: '30px', color: '#0f172a', backgroundColor: '#f1f5f9', height: '100vh' }}>Carregando comandas...</div>;
  }

  return (
    <div style={{ padding: '30px', backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#1e293b', flex: 1 }}>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', marginBottom: '5px' }}>Gerenciamento de Comandas (CRUD)</h1>
          <p style={{ color: '#64748b', margin: 0 }}>Histórico, abertura e controle manual de consumo.</p>
        </div>
        {/* BOTÃO DO CREATE */}
        <button 
          onClick={() => { setIdEditando(null); setNomeCliente(''); setItensSelecionados([]); setModalAberto(true); }}
          style={{ padding: '12px 24px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          ➕ Abrir Nova Comanda
        </button>
      </div>

      {/* LISTAGEM DAS COMANDAS [READ] */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {comandas.map((c) => (
          <div key={c.id} style={{ backgroundColor: '#ffffff', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <h3 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{c.comanda}</h3>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>#{c.id}</span>
            </div>

            <p style={{ margin: '0 0 15px 0', fontSize: '0.85rem', color: '#94a3b8' }}>⏰ {c.data_hora}</p>

            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '8px', marginBottom: '20px', border: '1px solid #f1f5f9' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' }}>Itens Pedidos</span>
              <ul style={{ margin: 0, paddingLeft: '20px', color: '#475569', fontSize: '0.9rem', lineHeight: '1.6' }}>
                {c.produtos?.map((prod, idx) => (
                  <li key={idx} style={{ color: '#334155' }}>{prod}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
              <div>
                <span style={{ display: 'block', fontSize: '0.75rem', color: '#64748b' }}>Total Atual</span>
                <strong style={{ fontSize: '1.3rem', color: '#16a34a' }}>R$ {c.total.toFixed(2).replace('.', ',')}</strong>
              </div>
              <button 
                onClick={() => window.location.href = `/caixa?comanda=${c.id}`}
                style={{ padding: '6px 12px', backgroundColor: '#e0f2fe', color: '#0369a1', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Atender no Caixa
              </button>
            </div>

            {/* BOTÕES DE EDICAO [UPDATE] E EXCLUSÃO [DELETE] */}
            <div style={{ display: 'flex', gap: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => iniciarEdicao(c)} style={{ padding: '6px 12px', backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem' }}>
                ✏️ Editar
              </button>
              <button onClick={() => handleDeletarComanda(c.id)} style={{ padding: '6px 12px', backgroundColor: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}>
                🗑️ Excluir
              </button>
            </div>

          </div>
        ))}
      </div>

      {/* MODAL PARA CREATE E UPDATE */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <form onSubmit={handleSalvarComanda} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '450px', maxHeight: '85vh', overflowY: 'auto', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.4rem' }}>
              {idEditando ? '✏️ Editar Dados da Comanda' : '📋 Abrir Nova Comanda'}
            </h2>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '6px', color: '#475569' }}>Nome da Mesa ou Cliente</label>
              <input 
                type="text" 
                value={nomeCliente} 
                onChange={e => setNomeCliente(e.target.value)} 
                placeholder="Ex: Mesa 08 ou Marcos" 
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} 
                required 
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '8px', color: '#475569' }}>Selecione os Itens Consumidos</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '10px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                {opcoesProdutos.map((p, idx) => (
                  <label key={idx} style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.95rem', color: '#334155', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={itensSelecionados.includes(p.nome)} 
                      onChange={() => handleCheckboxChange(p.nome)}
                      style={{ width: '16px', height: '16px' }}
                    />
                    <span>{p.nome} - <span style={{ color: '#16a34a', fontWeight: 'bold' }}>R$ {p.preco.toFixed(2)}</span></span>
                  </label>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', marginTop: '10px' }}>
              <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>
                {idEditando ? 'Salvar Alterações' : 'Criar Comanda'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}