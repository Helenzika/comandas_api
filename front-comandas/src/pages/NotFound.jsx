///helen de oliveira
import { Link } from 'react-router-dom';
export default function NotFound() 
{ return <div style={{textAlign: 'center', marginTop: '50px'}}>
  <h1>404 - Não Encontrado</h1><Link to="/dashboard">Ir para o Dashboard</Link></div>; }
