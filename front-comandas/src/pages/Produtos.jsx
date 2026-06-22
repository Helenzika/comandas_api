///helen de oliveira
import { useState, useEffect } from 'react';
import api from '../services/api';

export default function Produtos() {
  const [produtos, setProdutos] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Estados para controlar o Modal de cadastro simulado
  const [modalAberto, setModalAberto] = useState(false);
  const [nome, setNome] = useState('');
  const [categoria, setCategoria] = useState('pastéis');
  const [preco, setPreco] = useState('');
  const [estoque, setEstoque] = useState('');

  // Lista base de produtos padrão
  const produtosPadrao = [
    { id: 101, nome: "pastel de carne", categoria: "pastéis", preco: 12.00, estoque: 45 },
    { id: 102, nome: "pastel de queijo", categoria: "pastéis", preco: 11.00, estoque: 60 },
    { id: 103, nome: "refrigerante lata", categoria: "bebidas", preco: 6.00, estoque: 150 },
    { id: 201, nome: "pastel de frango catupiry", categoria: "pastéis", preco: 14.00, estoque: 35 },
    { id: 202, nome: "cerveja artesanal", categoria: "bebidas", preco: 18.00, estoque: 80 },
    { id: 203, nome: "cerveja lata", categoria: "bebidas", preco: 8.50, estoque: 120 },
    { id: 301, nome: "pastel de vento", categoria: "pastéis", preco: 9.00, estoque: 100 },
    { id: 302, nome: "refrigerante 2l", categoria: "bebidas", preco: 13.00, estoque: 40 }
  ];

  useEffect(() => {
    async function loadProdutos() {
      try {
        const response = await api.get('/produtos');
        setProdutos(response.data);
      } catch (error) {
        console.warn("Backend offline. Carregando catálogo híbrido (padrão + novos cadastros).");
        
        // Pega os produtos customizados que você cadastrou durante a sessão
        const cadastradosLocal = JSON.parse(sessionStorage.getItem('novos_produtos') || '[]');
        
        // Junta a lista padrão com as suas criações do vídeo
        setProdutos([...produtosPadrao, ...cadastradosLocal]);
      } finally {
        setLoading(false);
      }
    }
    loadProdutos();
  }, []);

  const handleSalvarProduto = (e) => {
    e.preventDefault();
    if (!nome || !preco || !estoque) return;

    const novoItem = {
      id: Math.floor(Math.random() * 1000) + 400, // Gera um ID aleatório alto
      nome: nome.toLowerCase(),
      categoria: categoria,
      preco: parseFloat(preco),
      estoque: parseInt(estoque)
    };

    // Salva no sessionStorage para persistir enquanto o navegador estiver aberto
    const cadastradosAtuais = JSON.parse(sessionStorage.getItem('novos_produtos') || '[]');
    const novaLista = [...cadastradosAtuais, novoItem];
    sessionStorage.setItem('novos_produtos', JSON.stringify(novaLista));

    // Atualiza a tabela na hora
    setProdutos([...produtosPadrao, ...novaLista]);

    // Limpa o formulário e fecha o modal
    setNome('');
    setPreco('');
    setEstoque('');
    setModalAberto(false);
  };

  if (loading) {
    return <div style={{ padding: '30px', color: '#0f172a', backgroundColor: '#f1f5f9', height: '100vh' }}>Carregando produtos...</div>;
  }

  return (
    <div style={{ padding: '30px', backgroundColor: '#f1f5f9', minHeight: '100vh', color: '#1e293b', flex: 1, position: 'relative' }}>
      <h1 style={{ margin: 0, fontSize: '2rem', color: '#0f172a', marginBottom: '5px' }}>Catálogo de Produtos</h1>
      <p style={{ color: '#64748b', marginBottom: '30px' }}>Controle de estoque e preços do cardápio do Zé.</p>

      <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px' }}>
          <input type="text" placeholder="Filtrar por nome do item..." style={{ padding: '10px 15px', borderRadius: '6px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', color: '#0f172a', width: '300px' }} readOnly />
          
          {/* BOTÃO AGORA ATIVA O MODAL */}
          <button 
            onClick={() => setModalAberto(true)}
            style={{ padding: '10px 20px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            + Adicionar ao Cardápio
          </button>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0', color: '#64748b', textAlign: 'left' }}>
              <th style={{ padding: '12px' }}>ID</th>
              <th style={{ padding: '12px' }}>Item</th>
              <th style={{ padding: '12px' }}>Categoria</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Preço Unitário</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Estoque</th>
            </tr>
          </thead>
          <tbody>
            {produtos.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #f1f5f9', color: '#334155' }}>
                <td style={{ padding: '12px' }}>#{p.id}</td>
                <td style={{ padding: '12px', fontWeight: 'bold', color: '#0f172a' }}>{p.nome}</td>
                <td style={{ padding: '12px' }}><span style={{ backgroundColor: '#e2e8f0', color: '#334155', padding: '4px 8px', borderRadius: '6px', fontSize: '0.85rem' }}>{p.categoria}</span></td>
                <td style={{ padding: '12px', textAlign: 'right', color: '#16a34a', fontWeight: 'bold' }}>R$ {p.preco.toFixed(2).replace('.', ',')}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{p.estoque} un</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL DE CADASTRO SIMULADO PARA O VÍDEO */}
      {modalAberto && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(0,0,0,0.4)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 2000 }}>
          <form onSubmit={handleSalvarProduto} style={{ backgroundColor: 'white', padding: '30px', borderRadius: '12px', width: '400px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)' }}>
            <h2 style={{ margin: '0 0 20px 0', color: '#0f172a', fontSize: '1.4rem' }}>Novo Item do Cardápio</h2>
            
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Nome do Produto (em minúsculo)</label>
              <input type="text" value={nome} onChange={e => setNome(e.target.value)} placeholder="ex: pastel de palmito" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Categoria</label>
              <select value={categoria} onChange={e => setCategoria(e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }}>
                <option value="pastéis">pastéis</option>
                <option value="bebidas">bebidas</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '15px', marginBottom: '25px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Preço (R$)</label>
                <input type="number" step="0.01" value={preco} onChange={e => setPreco(e.target.value)} placeholder="15.00" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 'bold', marginBottom: '5px', color: '#475569' }}>Estoque Inicial</label>
                <input type="number" value={estoque} onChange={e => setEstoque(e.target.value)} placeholder="50" style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', boxSizing: 'border-box' }} required />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setModalAberto(false)} style={{ padding: '10px 15px', backgroundColor: '#e2e8f0', color: '#475569', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Cancelar</button>
              <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#16a34a', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}>Salvar Item</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}