import { Routes, Route, Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import "./App.css";
import LoginPage from "./pages/login";
import { useAuth } from "./hooks/use-auth";

function DashboardPlaceholder() {
  return (
    <div>
      <h1>Sistema Cantina - Frontend Base</h1>
      <p>Configuração inicial concluída. Implemente as próximas telas.</p>
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
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
