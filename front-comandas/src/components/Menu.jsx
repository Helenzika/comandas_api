import { Link } from "react-router-dom";
import "./Menu.css";

export default function Menu() {
  return (
    <div className="menu">
      <h2>Comandas da Helen ✨</h2>

      <Link to="/dashboard">Dashboard</Link>
      <Link to="/funcionarios">Funcionários</Link>
      <Link to="/clientes">Clientes</Link>
      <Link to="/produtos">Produtos</Link>
      <Link to="/comandas">Comandas</Link>
      <Link to="/caixa">Caixa</Link>
    </div>
  );
}