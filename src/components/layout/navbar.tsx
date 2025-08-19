'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';

type User = {
  username: string;
  role: 'administrador' | 'atendente' | 'estoquista';
};

interface NavbarProps {
  user?: User;
  showLogout?: boolean;
}

export default function Navbar({ user, showLogout = true }: NavbarProps) {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'Administrador';
      case 'atendente':
        return 'Atendente';
      case 'estoquista':
        return 'Estoquista';
      default:
        return role;
    }
  };

  return (
    <nav className='navbar navbar-expand-lg navbar-dark'>
      <div className='container'>
        <Link href='/dashboard' className='navbar-brand'>
          🍽️ Cantina Escolar
        </Link>

        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarNav'
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div className='collapse navbar-collapse' id='navbarNav'>
          {user && (
            <ul className='navbar-nav me-auto'>
              <li className='nav-item'>
                <Link href='/dashboard' className='nav-link'>
                  Dashboard
                </Link>
              </li>

              {/* Módulo de Vendas */}
              {(user.role === 'administrador' || user.role === 'atendente') && (
                <li className='nav-item dropdown'>
                  <a
                    className='nav-link dropdown-toggle'
                    href='#'
                    role='button'
                    data-bs-toggle='dropdown'
                    aria-expanded='false'
                  >
                    Vendas
                  </a>
                  <ul className='dropdown-menu'>
                    <li>
                      <Link href='/vendas' className='dropdown-item'>
                        Nova Venda
                      </Link>
                    </li>
                    <li>
                      <Link href='/vendas/consulta' className='dropdown-item'>
                        Consultar Vendas
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* Módulo de Produtos e Estoque */}
              <li className='nav-item dropdown'>
                <a
                  className='nav-link dropdown-toggle'
                  href='#'
                  role='button'
                  data-bs-toggle='dropdown'
                  aria-expanded='false'
                >
                  Produtos
                </a>
                <ul className='dropdown-menu'>
                  <li>
                    <Link href='/produtos' className='dropdown-item'>
                      Gerenciar Produtos
                    </Link>
                  </li>
                  {(user.role === 'administrador' || user.role === 'estoquista') && (
                    <li>
                      <Link href='/estoque' className='dropdown-item'>
                        Controle de Estoque
                      </Link>
                    </li>
                  )}
                </ul>
              </li>

              {/* Módulo de Alunos */}
              {(user.role === 'administrador' || user.role === 'atendente') && (
                <li className='nav-item dropdown'>
                  <a
                    className='nav-link dropdown-toggle'
                    href='#'
                    role='button'
                    data-bs-toggle='dropdown'
                    aria-expanded='false'
                  >
                    Alunos
                  </a>
                  <ul className='dropdown-menu'>
                    <li>
                      <Link href='/alunos' className='dropdown-item'>
                        Gerenciar Contas
                      </Link>
                    </li>
                    <li>
                      <Link href='/alunos/consulta' className='dropdown-item'>
                        Consulta de Alunos
                      </Link>
                    </li>
                    <li>
                      <Link href='/recarga' className='dropdown-item'>
                        Recarga de Crédito
                      </Link>
                    </li>
                    <li>
                      <Link href='/restricoes' className='dropdown-item'>
                        Restrições e Observações
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* Módulo Financeiro */}
              {(user.role === 'administrador' || user.role === 'atendente') && (
                <li className='nav-item dropdown'>
                  <a
                    className='nav-link dropdown-toggle'
                    href='#'
                    role='button'
                    data-bs-toggle='dropdown'
                    aria-expanded='false'
                  >
                    Financeiro
                  </a>
                  <ul className='dropdown-menu'>
                    <li>
                      <Link href='/caixas' className='dropdown-item'>
                        Gerenciar Caixas
                      </Link>
                    </li>
                    <li>
                      <Link href='/caixas/relatorios' className='dropdown-item'>
                        Relatórios de Caixa
                      </Link>
                    </li>
                  </ul>
                </li>
              )}

              {/* Relatórios (apenas para administradores) */}
              {user.role === 'administrador' && (
                <li className='nav-item'>
                  <Link href='/relatorios' className='nav-link'>
                    Relatórios
                  </Link>
                </li>
              )}
            </ul>
          )}

          {user && showLogout && (
            <div className='navbar-nav'>
              <div className='nav-item dropdown'>
                <button
                  className='btn btn-link nav-link dropdown-toggle text-white'
                  data-bs-toggle='dropdown'
                >
                  {user.username} ({getRoleLabel(user.role)})
                </button>
                <ul className='dropdown-menu dropdown-menu-end'>
                  <li>
                    <button className='dropdown-item' onClick={handleLogout}>
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
