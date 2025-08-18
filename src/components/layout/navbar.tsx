"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type User = {
  username: string;
  role: "administrador" | "atendente" | "estoquista";
};

interface NavbarProps {
  user?: User;
  showLogout?: boolean;
}

export default function Navbar({ user, showLogout = true }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "administrador":
        return "Administrador";
      case "atendente":
        return "Atendente";
      case "estoquista":
        return "Estoquista";
      default:
        return role;
    }
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark">
      <div className="container">
        <Link href="/dashboard" className="navbar-brand">
          🍽️ Cantina Escolar
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          {user && (
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <Link href="/dashboard" className="nav-link">
                  Dashboard
                </Link>
              </li>
              <li className="nav-item">
                <Link href="/produtos" className="nav-link">
                  Produtos
                </Link>
              </li>
              {(user.role === "administrador" || user.role === "atendente") && (
                <>
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-expanded="false"
                    >
                      Vendas
                    </a>
                    <ul className="dropdown-menu">
                      <li>
                        <Link href="/vendas" className="dropdown-item">
                          Nova Venda
                        </Link>
                      </li>
                      <li>
                        <Link href="/vendas/consulta" className="dropdown-item">
                          Consultar Vendas
                        </Link>
                      </li>
                    </ul>
                  </li>
                  <li className="nav-item">
                    <Link href="/alunos" className="nav-link">
                      Alunos
                    </Link>
                  </li>
                </>
              )}
              {(user.role === "administrador" ||
                user.role === "estoquista") && (
                <li className="nav-item">
                  <Link href="/estoque" className="nav-link">
                    Estoque
                  </Link>
                </li>
              )}
              {user.role === "administrador" && (
                <li className="nav-item">
                  <Link href="/relatorios" className="nav-link">
                    Relatórios
                  </Link>
                </li>
              )}
            </ul>
          )}

          {user && showLogout && (
            <div className="navbar-nav">
              <div className="nav-item dropdown">
                <button
                  className="btn btn-link nav-link dropdown-toggle text-white"
                  data-bs-toggle="dropdown"
                >
                  {user.username} ({getRoleLabel(user.role)})
                </button>
                <ul className="dropdown-menu dropdown-menu-end">
                  <li>
                    <button className="dropdown-item" onClick={handleLogout}>
                      Sair
                    </button>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
