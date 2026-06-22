///helen de oliveira
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const [cpf, setCpf] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErro('');
    
    const sucesso = await login(cpf, senha);
    if (sucesso) {
      navigate('/dashboard'); // Roda para o dashboard após login bem sucedido
    } else {
      setErro('CPF ou Senha incorretos.');
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0f172a' }}>
      <form onSubmit={handleLogin} style={{ backgroundColor: 'white', padding: '40px', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)', width: '100%', maxWidth: '380px' }}>
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <h2 style={{ color: '#1e293b', margin: 0, fontSize: '1.8rem' }}>🍔 Comandas do Zé</h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem', marginTop: '5px' }}>Área de acesso restrito ao caixa</p>
        </div>

        {erro && (
          <div style={{ color: '#ef4444', backgroundColor: '#fee2e2', padding: '10px', borderRadius: '8px', marginBottom: '15px', fontSize: '0.85rem', textAlign: 'center', fontWeight: '500' }}>
            {erro}
          </div>
        )}

        <div style={{ marginBottom: '18px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>CPF do Operador</label>
          <input 
            type="text" 
            value={cpf} 
            onChange={(e) => setCpf(e.target.value)} 
            placeholder="Apenas números" 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
          />
        </div>

        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '6px', fontSize: '0.9rem', fontWeight: '600', color: '#475569' }}>Senha</label>
          <input 
            type="password" 
            value={senha} 
            onChange={(e) => setSenha(e.target.value)} 
            placeholder="Sua senha secreta" 
            required 
            style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1', outline: 'none' }} 
          />
        </div>

        <button 
          type="submit" 
          disabled={loading} 
          style={{ width: '100%', padding: '14px', backgroundColor: '#0ea5e9', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s' }}
        >
          {loading ? 'Verificando...' : 'Entrar no Sistema'}
        </button>
      </form>
    </div>
  );
}
