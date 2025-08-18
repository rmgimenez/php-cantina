import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";
import { useNavigate } from "react-router-dom";

interface FormState {
  usuario: string;
  senha: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ usuario: "", senha: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.usuario || !form.senha) {
      setError("Preencha usuário e senha.");
      return;
    }
    setLoading(true);
    const resp = await login(form);
    setLoading(false);
    if (!resp.success) {
      setError(resp.message || "Erro ao entrar");
    } else {
      navigate("/");
    }
  }

  return (
    <div className="card" style={{ maxWidth: '400px', width: '100%' }}>
      <div className="card-body">
        <div className="text-center mb-4">
          <h2 className="card-title">Login Cantina</h2>
          <p className="text-muted">Acesse o sistema com suas credenciais</p>
        </div>
        
        {error && (
          <div className="alert alert-danger" role="alert">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="usuario" className="form-label">Usuário</label>
            <input
              type="text"
              id="usuario"
              name="usuario"
              className="form-control"
              value={form.usuario}
              onChange={handleChange}
              autoComplete="username"
              placeholder="Digite seu usuário"
              required
            />
          </div>
          
          <div className="mb-3">
            <label htmlFor="senha" className="form-label">Senha</label>
            <input
              type="password"
              id="senha"
              name="senha"
              className="form-control"
              value={form.senha}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder="Digite sua senha"
              required
            />
          </div>
          
          <div className="d-grid">
            <button 
              type="submit" 
              className="btn btn-primary btn-lg"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
