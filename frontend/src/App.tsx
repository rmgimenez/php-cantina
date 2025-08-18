import { Routes, Route, Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import "./App.css";
import LoginPage from "./pages/login";
import TiposProdutosList from "./pages/tipos-produtos/tipos-produtos-list";
import TipoProdutoForm from "./pages/tipos-produtos/tipo-produto-form";
import { useAuth } from "./hooks/use-auth";

function DashboardPlaceholder() {
  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <h1>Sistema Cantina - Dashboard</h1>
          <p className="lead">Bem-vindo ao sistema de cantina escolar!</p>
          
          <div className="row mt-4">
            <div className="col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Categorias de Produtos</h5>
                  <p className="card-text">Gerencie os tipos de produtos da cantina.</p>
                  <a href="/tipos-produtos" className="btn btn-primary">
                    Acessar
                  </a>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Produtos</h5>
                  <p className="card-text">Cadastre e gerencie produtos.</p>
                  <button className="btn btn-secondary" disabled>
                    Em breve
                  </button>
                </div>
              </div>
            </div>
            <div className="col-md-6 col-lg-4 mb-3">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Vendas</h5>
                  <p className="card-text">Realize vendas e controle o estoque.</p>
                  <button className="btn btn-secondary" disabled>
                    Em breve
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function NotFound() {
  return (
    <div>
      <h2>Página não encontrada</h2>
      <a href="/">Voltar</a>
    </div>
  );
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <DashboardPlaceholder />
          </PrivateRoute>
        }
      />
      <Route
        path="/tipos-produtos"
        element={
          <PrivateRoute>
            <TiposProdutosList />
          </PrivateRoute>
        }
      />
      <Route
        path="/tipos-produtos/novo"
        element={
          <PrivateRoute>
            <TipoProdutoForm />
          </PrivateRoute>
        }
      />
      <Route
        path="/tipos-produtos/:id/editar"
        element={
          <PrivateRoute>
            <TipoProdutoForm />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
