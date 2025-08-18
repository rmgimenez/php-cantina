import { useAuth } from '../../hooks/use-auth';
import { Link } from 'react-router-dom';

export function Header() {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container-fluid">
        <Link className="navbar-brand fw-bold" to="/">
          <i className="bi bi-shop me-2"></i>
          Sistema Cantina
        </Link>

        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto">
            <li className="nav-item">
              <Link className="nav-link" to="/">
                <i className="bi bi-house-door me-1"></i>
                Dashboard
              </Link>
            </li>
            <li className="nav-item">
              <Link className="nav-link" to="/tipos-produtos">
                <i className="bi bi-tags me-1"></i>
                Categorias
              </Link>
            </li>
            <li className="nav-item">
              <span className="nav-link disabled">
                <i className="bi bi-box me-1"></i>
                Produtos
              </span>
            </li>
            <li className="nav-item">
              <span className="nav-link disabled">
                <i className="bi bi-cart3 me-1"></i>
                Vendas
              </span>
            </li>
          </ul>

          <div className="navbar-nav ms-auto">
            <div className="nav-item dropdown">
              <button
                className="nav-link dropdown-toggle btn btn-link text-white text-decoration-none border-0"
                id="navbarDropdown"
                data-bs-toggle="dropdown"
                aria-expanded="false"
              >
                <i className="bi bi-person-circle me-1"></i>
                {user?.nome || 'Usuário'}
              </button>
              <ul className="dropdown-menu dropdown-menu-end">
                <li>
                  <span className="dropdown-item-text">
                    <small className="text-muted">Logado como:</small>
                    <br />
                    <strong>{user?.nome}</strong>
                    <br />
                    <small className="text-muted">{user?.usuario}</small>
                  </span>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button className="dropdown-item" onClick={handleLogout}>
                    <i className="bi bi-box-arrow-right me-2"></i>
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