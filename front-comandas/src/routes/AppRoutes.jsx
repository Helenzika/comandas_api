///helen de oliveira
import { Routes, Route } from "react-router-dom";

import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";
import Funcionarios from "../pages/Funcionarios";
import Clientes from "../pages/Clientes";
import Produtos from "../pages/Produtos";
import Comandas from "../pages/Comandas";
import Caixa from "../pages/Caixa";
import NotFound from "../pages/NotFound";

import PrivateRoute from "./PrivateRoute";
import MainLayout from "../layouts/MainLayout";

import { AuthProvider } from "../context/AuthContext.jsx";

export default function AppRoutes() {
  return (
    <AuthProvider>
      <Routes>
        {/* Rota pública de Login (na raiz '/') */}
        <Route path="/" element={<Login />} />

        {/* Todas as rotas protegidas encapsuladas no PrivateRoute e no MainLayout para compartilhar o menu */}
        <Route element={<PrivateRoute><MainLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/funcionarios" element={<Funcionarios />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/produtos" element={<Produtos />} />
          <Route path="/comandas" element={<Comandas />} />
          <Route path="/caixa" element={<Caixa />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </AuthProvider>
  );
}
