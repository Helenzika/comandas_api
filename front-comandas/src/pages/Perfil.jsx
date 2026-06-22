///helen de oliveira
import Menu from "../components/Menu";

export default function Perfil() {
  return (
    <div style={{ display: "flex" }}>
      <Menu />

      <div style={{ marginLeft: "240px", padding: "20px" }}>
        <h1>Funcionários</h1>

        <form>
          <input type="text" placeholder="Nome" maxLength={100} />

          <input type="email" placeholder="E-mail" />

          <button>Cadastrar</button>
        </form>
      </div>
    </div>
  );
}