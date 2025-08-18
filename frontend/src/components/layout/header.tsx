import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

export function Header() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className='navbar navbar-expand-lg navbar-dark bg-primary shadow-sm navbar-sticky'>
      <div className='container-fluid px-4'>
        <Link className='navbar-brand fw-bold d-flex align-items-center gap-2' to='/'>
          <div
            className='d-flex align-items-center justify-content-center bg-white text-primary rounded'
            style={{ width: '32px', height: '32px' }}
          >
            <i className='bi bi-shop fs-6'></i>
          </div>
          <span className='d-none d-md-inline'>Sistema Cantina</span>
          <span className='d-md-none'>Cantina</span>
        </Link>

        {/* Search bar - center */}
        <form
          className='d-none d-lg-flex align-items-center mx-auto'
          role='search'
          onSubmit={(e) => e.preventDefault()}
          style={{ maxWidth: '400px', width: '100%' }}
        >
          <div className='input-group'>
            <span className='input-group-text bg-white border-end-0'>
              <i className='bi bi-search text-muted'></i>
            </span>
            <input
              className='form-control border-start-0'
              type='search'
              placeholder='Buscar alunos, produtos, vendas...'
              aria-label='Search'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </form>

        <button
          className='navbar-toggler'
          type='button'
          data-bs-toggle='collapse'
          data-bs-target='#navbarNav'
          aria-controls='navbarNav'
          aria-expanded='false'
          aria-label='Toggle navigation'
        >
          <span className='navbar-toggler-icon'></span>
        </button>

        <div className='collapse navbar-collapse' id='navbarNav'>
          {/* Right side actions */}
          <div className='navbar-nav ms-auto align-items-center gap-2'>
            {/* Quick Actions */}
            <div className='nav-item dropdown d-none d-md-block'>
              <button
                className='btn btn-outline-light btn-sm dropdown-toggle'
                type='button'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                <i className='bi bi-plus-circle me-1'></i>
                Ações Rápidas
              </button>
              <ul className='dropdown-menu dropdown-menu-end'>
                <li>
                  <Link className='dropdown-item' to='/tipos-produtos/novo'>
                    <i className='bi bi-tags me-2'></i>Nova Categoria
                  </Link>
                </li>
                <li>
                  <a className='dropdown-item disabled' href='#'>
                    <i className='bi bi-box me-2'></i>Novo Produto
                  </a>
                </li>
                <li>
                  <a className='dropdown-item disabled' href='#'>
                    <i className='bi bi-cart-plus me-2'></i>Nova Venda
                  </a>
                </li>
                <li>
                  <hr className='dropdown-divider' />
                </li>
                <li>
                  <a className='dropdown-item disabled' href='#'>
                    <i className='bi bi-arrow-down-circle me-2'></i>Entrada Estoque
                  </a>
                </li>
              </ul>
            </div>

            {/* Notifications */}
            <button className='btn btn-outline-light btn-sm position-relative' title='Notificações'>
              <i className='bi bi-bell'></i>
              <span className='position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger'>
                3<span className='visually-hidden'>notificações não lidas</span>
              </span>
            </button>

            {/* User dropdown */}
            <div className='nav-item dropdown'>
              <button
                className='nav-link dropdown-toggle btn btn-link text-white text-decoration-none border-0 d-flex align-items-center'
                id='navbarDropdown'
                data-bs-toggle='dropdown'
                aria-expanded='false'
              >
                <div
                  className='d-flex align-items-center justify-content-center bg-white text-primary rounded-circle me-2'
                  style={{ width: '32px', height: '32px' }}
                >
                  <i className='bi bi-person-fill'></i>
                </div>
                <span className='d-none d-md-inline'>{user?.nome || 'Usuário'}</span>
              </button>
              <ul className='dropdown-menu dropdown-menu-end'>
                <li>
                  <span className='dropdown-item-text'>
                    <div className='d-flex align-items-center mb-2'>
                      <div
                        className='d-flex align-items-center justify-content-center bg-primary text-white rounded-circle me-3'
                        style={{ width: '40px', height: '40px' }}
                      >
                        <i className='bi bi-person-fill'></i>
                      </div>
                      <div>
                        <div className='fw-semibold'>{user?.nome}</div>
                        <small className='text-muted'>{user?.usuario}</small>
                      </div>
                    </div>
                  </span>
                </li>
                <li>
                  <hr className='dropdown-divider' />
                </li>
                <li>
                  <a className='dropdown-item' href='#'>
                    <i className='bi bi-person me-2'></i>Meu Perfil
                  </a>
                </li>
                <li>
                  <a className='dropdown-item' href='#'>
                    <i className='bi bi-gear me-2'></i>Configurações
                  </a>
                </li>
                <li>
                  <hr className='dropdown-divider' />
                </li>
                <li>
                  <button className='dropdown-item' onClick={handleLogout}>
                    <i className='bi bi-box-arrow-right me-2'></i>
                    Sair
                  </button>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
