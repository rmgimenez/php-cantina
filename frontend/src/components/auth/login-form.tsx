import { useState } from "react";
import { useAuth } from "../../hooks/use-auth";

interface FormState {
  usuario: string;
  senha: string;
}

export function LoginForm() {
  const { login } = useAuth();
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
      window.location.href = "/";
    }
  }

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 360, margin: "0 auto" }}>
      <h2>Login Cantina</h2>
      {error && (
        <div style={{ color: "red", marginBottom: 12 }} role="alert">
          {error}
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
          }}
        >
          <span>Usuário</span>
          <input
            name="usuario"
            value={form.usuario}
            onChange={handleChange}
            autoComplete="username"
            placeholder="Usuário"
          />
        </label>
        <label
          style={{
            display: "flex",
            flexDirection: "column",
            textAlign: "left",
          }}
        >
          <span>Senha</span>
          <input
            name="senha"
            type="password"
            value={form.senha}
            onChange={handleChange}
            autoComplete="current-password"
            placeholder="Senha"
          />
        </label>
        <button type="submit" disabled={loading}>
          {loading ? "Entrando..." : "Entrar"}
        </button>
      </div>
    </form>
  );
}
