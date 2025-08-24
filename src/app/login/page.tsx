"use client";

import React, { useState } from "react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // criar função para calcular fibonacci
  function calcularFibonacci(n: number): number {
    if (n <= 1) return n;
    return calcularFibonacci(n - 1) + calcularFibonacci(n - 2);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erro no login");
        return;
      }

      // redirect to dashboard
      window.location.href = "/dashboard";
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-vh-100 d-flex align-items-center justify-content-center"
      style={{
        background:
          "linear-gradient(135deg, var(--cantina-azul), var(--cantina-azul-claro))",
      }}
    >
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 col-lg-4">
            <div className="card shadow-lg border-0">
              <div className="card-body p-5">
                <div className="text-center mb-4">
                  <div className="mb-3">
                    <span style={{ fontSize: "3rem" }}>🍽️</span>
                  </div>
                  <h2 className="h4 text-primary fw-bold">Cantina Escolar</h2>
                  <p className="text-muted">Faça login para continuar</p>
                </div>

                {error && (
                  <div className="alert alert-danger d-flex align-items-center">
                    <span className="me-2">⚠️</span>
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-medium">
                      Usuário
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">👤</span>
                      <input
                        id="username"
                        type="text"
                        className="form-control"
                        placeholder="Digite seu usuário"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-medium">
                      Senha
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">🔒</span>
                      <input
                        id="password"
                        type="password"
                        className="form-control"
                        placeholder="Digite sua senha"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        disabled={loading}
                      />
                    </div>
                  </div>

                  <button
                    className="btn btn-primary w-100 py-2 fw-medium"
                    type="submit"
                    disabled={loading || !username || !password}
                  >
                    {loading ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Entrando...
                      </>
                    ) : (
                      "Entrar no Sistema"
                    )}
                  </button>
                </form>

                <div className="text-center mt-4">
                  <small className="text-muted">
                    Sistema de gestão da cantina escolar
                  </small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
