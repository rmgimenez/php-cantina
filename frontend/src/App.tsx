import { Routes, Route } from "react-router-dom";
import "./App.css";

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

function App() {
  return (
    <Routes>
      <Route path="/" element={<DashboardPlaceholder />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
