import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

interface MenuCardProps {
  title: string;
  description: string;
  icon: string;
  to?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
}

function MenuCard({ title, description, icon, to, disabled = false, variant = 'primary' }: MenuCardProps) {
  const cardContent = (
    <>
      <div className="card-body text-center">
        <div className={`display-6 text-${variant} mb-3`}>
          <i className={icon}></i>
        </div>
        <h5 className="card-title">{title}</h5>
        <p className="card-text text-muted">{description}</p>
        {disabled ? (
          <button className="btn btn-secondary" disabled>
            Em breve
          </button>
        ) : (
          <div className={`btn btn-${variant}`}>
            Acessar
          </div>
        )}
      </div>
    </>
  );

  if (disabled || !to) {
    return (
      <div className="card h-100 shadow-sm">
        {cardContent}
      </div>
    );
  }

  return (
    <Link to={to} className="text-decoration-none">
      <div className="card h-100 shadow-sm hover-shadow">
        {cardContent}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="container">
      <div className="row mb-4">
        <div className="col-12">
          <div className="bg-white rounded p-4 shadow-sm mb-4">
            <h1 className="h2 text-primary mb-2">
              <i className="bi bi-shop me-2"></i>
              Sistema Cantina - Dashboard
            </h1>
            <p className="lead text-muted mb-1">
              Bem-vindo ao sistema de cantina escolar, <strong>{user?.nome}</strong>!
            </p>
            <small className="text-muted">
              Utilize o menu abaixo para acessar as funcionalidades do sistema.
            </small>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <h3 className="h4 mb-4 text-secondary">
            <i className="bi bi-grid-3x3-gap me-2"></i>
            Menu Principal
          </h3>
        </div>
      </div>

      <div className="row g-4">
        <div className="col-md-6 col-lg-4">
          <MenuCard
            title="Categorias de Produtos"
            description="Gerencie os tipos de produtos da cantina (salgados, doces, bebidas, etc.)"
            icon="bi bi-tags"
            to="/tipos-produtos"
            variant="primary"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <MenuCard
            title="Produtos"
            description="Cadastre e gerencie produtos, preços e descrições"
            icon="bi bi-box"
            disabled
            variant="success"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <MenuCard
            title="Vendas"
            description="Realize vendas para alunos e funcionários da escola"
            icon="bi bi-cart3"
            disabled
            variant="warning"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <MenuCard
            title="Estoque"
            description="Controle entradas, saídas e ajustes de estoque"
            icon="bi bi-boxes"
            disabled
            variant="info"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <MenuCard
            title="Alunos"
            description="Consulte dados de alunos e saldos de contas"
            icon="bi bi-people"
            disabled
            variant="secondary"
          />
        </div>

        <div className="col-md-6 col-lg-4">
          <MenuCard
            title="Relatórios"
            description="Visualize relatórios de vendas, consumo e financeiro"
            icon="bi bi-graph-up"
            disabled
            variant="primary"
          />
        </div>
      </div>

      <div className="row mt-5">
        <div className="col-12">
          <div className="bg-white rounded p-4 shadow-sm">
            <h4 className="h5 text-secondary mb-3">
              <i className="bi bi-info-circle me-2"></i>
              Informações do Sistema
            </h4>
            <div className="row text-center">
              <div className="col-md-4">
                <div className="border-end">
                  <h5 className="text-primary">Módulos</h5>
                  <p className="h4 mb-0">6</p>
                  <small className="text-muted">Funcionalidades</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="border-end">
                  <h5 className="text-success">Disponíveis</h5>
                  <p className="h4 mb-0">1</p>
                  <small className="text-muted">Prontos para uso</small>
                </div>
              </div>
              <div className="col-md-4">
                <h5 className="text-warning">Em desenvolvimento</h5>
                <p className="h4 mb-0">5</p>
                <small className="text-muted">Em breve</small>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}