import { Link } from 'react-router-dom';
import { LiveDashboardStats } from '../../components/dashboard/live-stats';
import { useAuth } from '../../hooks/use-auth';

interface ActionCardProps {
  title: string;
  description: string;
  icon: string;
  to?: string;
  disabled?: boolean;
  color: string;
  badge?: string;
}

function ActionCard({
  title,
  description,
  icon,
  to,
  disabled = false,
  color,
  badge,
}: ActionCardProps) {
  const cardContent = (
    <>
      <div className='card-body text-center p-4'>
        <div
          className={`d-flex align-items-center justify-content-center rounded-circle mx-auto mb-3`}
          style={{ width: '64px', height: '64px', backgroundColor: `${color}15` }}
        >
          <i className={`${icon} fs-3`} style={{ color }}></i>
        </div>
        <h6 className='card-title mb-2'>{title}</h6>
        <p className='card-text text-muted small mb-0'>{description}</p>
        {badge && <span className='badge bg-warning text-dark mt-2'>{badge}</span>}
      </div>
    </>
  );

  if (disabled || !to) {
    return (
      <div className='col-sm-6 col-lg-4 col-xl-3'>
        <div className='card h-100 text-muted action-card' style={{ opacity: 0.6 }}>
          {cardContent}
        </div>
      </div>
    );
  }

  return (
    <div className='col-sm-6 col-lg-4 col-xl-3'>
      <Link to={to} className='text-decoration-none'>
        <div className='card h-100 action-card hover-lift'>{cardContent}</div>
      </Link>
    </div>
  );
}

interface RecentActivityProps {
  items: Array<{
    id: number;
    title: string;
    description: string;
    time: string;
    icon: string;
    color: string;
  }>;
}

function RecentActivity({ items }: RecentActivityProps) {
  return (
    <div className='card h-100'>
      <div className='card-header d-flex align-items-center justify-content-between'>
        <h6 className='mb-0'>
          <i className='bi bi-clock-history me-2'></i>
          Atividade Recente
        </h6>
        <button className='btn btn-sm btn-outline-primary'>Ver Todas</button>
      </div>
      <div className='card-body p-0'>
        <div className='list-group list-group-flush activity-feed'>
          {items.map((item) => (
            <div key={item.id} className='list-group-item d-flex align-items-center'>
              <div
                className={`d-flex align-items-center justify-content-center rounded activity-icon me-3`}
                style={{ width: '32px', height: '32px', backgroundColor: `${item.color}15` }}
              >
                <i className={`${item.icon} small`} style={{ color: item.color }}></i>
              </div>
              <div className='flex-grow-1 min-w-0'>
                <div className='fw-semibold small'>{item.title}</div>
                <div className='text-muted small text-truncate'>{item.description}</div>
              </div>
              <small className='text-muted'>{item.time}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function SystemStatusCard() {
  return (
    <div className='card'>
      <div className='card-header'>
        <h6 className='mb-0'>
          <i className='bi bi-info-circle me-2'></i>
          Status do Sistema
        </h6>
      </div>
      <div className='card-body'>
        <div className='d-flex align-items-center justify-content-between mb-3'>
          <span className='small'>Status</span>
          <span className='d-flex align-items-center'>
            <span className='status-indicator online'></span>
            <span className='badge bg-success'>Online</span>
          </span>
        </div>
        <div className='d-flex align-items-center justify-content-between mb-3'>
          <span className='small'>Versão</span>
          <span className='small text-muted'>v1.0.0</span>
        </div>
        <div className='d-flex align-items-center justify-content-between mb-3'>
          <span className='small'>Último backup</span>
          <span className='small text-muted'>Hoje, 09:00</span>
        </div>
        <div className='d-flex align-items-center justify-content-between mb-3'>
          <span className='small'>Uptime</span>
          <span className='small text-success'>99.9%</span>
        </div>
        <hr />
        <div className='d-grid'>
          <button className='btn btn-outline-primary btn-sm' disabled>
            <i className='bi bi-gear me-1'></i>
            Configurações
          </button>
        </div>
      </div>
    </div>
  );
}

function QuickHelp() {
  return (
    <div className='card border-primary'>
      <div className='card-header bg-primary text-white'>
        <h6 className='mb-0'>
          <i className='bi bi-question-circle me-2'></i>
          Primeiros Passos
        </h6>
      </div>
      <div className='card-body'>
        <ol className='list-unstyled mb-0'>
          <li className='d-flex align-items-start mb-3'>
            <span className='badge bg-primary rounded-pill me-2'>1</span>
            <div>
              <div className='small fw-semibold'>Criar categorias</div>
              <div className='small text-muted'>Organize seus produtos por tipo</div>
              <Link to='/tipos-produtos/novo' className='btn btn-sm btn-outline-primary mt-2'>
                <i className='bi bi-plus-circle me-1'></i>
                Começar
              </Link>
            </div>
          </li>
          <li className='d-flex align-items-start mb-3'>
            <span className='badge bg-secondary rounded-pill me-2'>2</span>
            <div>
              <div className='small fw-semibold text-muted'>Cadastrar produtos</div>
              <div className='small text-muted'>Em desenvolvimento</div>
            </div>
          </li>
          <li className='d-flex align-items-start'>
            <span className='badge bg-secondary rounded-pill me-2'>3</span>
            <div>
              <div className='small fw-semibold text-muted'>Configurar estoque</div>
              <div className='small text-muted'>Em desenvolvimento</div>
            </div>
          </li>
        </ol>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();

  const mockActivities = [
    {
      id: 1,
      title: 'Categoria "Salgados" criada',
      description: 'Nova categoria adicionada ao sistema',
      time: '2 min',
      icon: 'bi bi-tags',
      color: '#0d6efd',
    },
    {
      id: 2,
      title: 'Sistema inicializado',
      description: 'Primeiro acesso ao painel administrativo',
      time: '5 min',
      icon: 'bi bi-power',
      color: '#198754',
    },
    {
      id: 3,
      title: 'Configuração inicial',
      description: 'Base de dados configurada com sucesso',
      time: '1h',
      icon: 'bi bi-gear',
      color: '#fd7e14',
    },
  ];

  return (
    <div className='dashboard-container fade-in'>
      {/* Welcome Header */}
      <div className='row mb-4'>
        <div className='col-12'>
          <div className='welcome-banner text-white rounded p-4 mb-4'>
            <div className='row align-items-center'>
              <div className='col-md-8'>
                <h1 className='h3 mb-2'>Bem-vindo, {user?.nome}! 👋</h1>
                <p className='mb-0 opacity-75'>
                  Gerencie sua cantina escolar de forma eficiente e organizada. Aqui você encontra
                  um resumo das principais atividades e acesso rápido às funcionalidades.
                </p>
              </div>
              <div className='col-md-4 text-md-end'>
                <div className='d-flex gap-2 justify-content-md-end flex-wrap'>
                  <Link to='/tipos-produtos/novo' className='btn btn-light quick-action-btn'>
                    <i className='bi bi-plus-circle me-1'></i>
                    Nova Categoria
                  </Link>
                  <button className='btn btn-outline-light quick-action-btn' disabled>
                    <i className='bi bi-cart-plus me-1'></i>
                    Nova Venda
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Live Statistics */}
      <LiveDashboardStats />

      <div className='row g-4'>
        {/* Main Actions */}
        <div className='col-12 col-xl-8'>
          <div className='card mb-4'>
            <div className='card-header'>
              <h6 className='mb-0'>
                <i className='bi bi-grid-3x3-gap me-2'></i>
                Funcionalidades Principais
              </h6>
            </div>
            <div className='card-body'>
              <div className='action-cards-grid'>
                <ActionCard
                  title='Categorias'
                  description='Gerenciar tipos de produtos'
                  icon='bi bi-tags'
                  to='/tipos-produtos'
                  color='#0d6efd'
                />
                <ActionCard
                  title='Produtos'
                  description='Cadastro e preços'
                  icon='bi bi-box-seam'
                  disabled
                  color='#198754'
                  badge='Em breve'
                />
                <ActionCard
                  title='Vendas'
                  description='Registrar vendas'
                  icon='bi bi-cart3'
                  disabled
                  color='#fd7e14'
                  badge='Em breve'
                />
                <ActionCard
                  title='Estoque'
                  description='Controle de entrada/saída'
                  icon='bi bi-boxes'
                  disabled
                  color='#6f42c1'
                  badge='Em breve'
                />
                <ActionCard
                  title='Alunos'
                  description='Saldos e movimentações'
                  icon='bi bi-people'
                  disabled
                  color='#20c997'
                  badge='Em breve'
                />
                <ActionCard
                  title='Relatórios'
                  description='Vendas e financeiro'
                  icon='bi bi-graph-up'
                  disabled
                  color='#dc3545'
                  badge='Em breve'
                />
                <ActionCard
                  title='Funcionários'
                  description='Gestão de usuários'
                  icon='bi bi-person-gear'
                  disabled
                  color='#6c757d'
                  badge='Em breve'
                />
                <ActionCard
                  title='Configurações'
                  description='Preferências do sistema'
                  icon='bi bi-sliders'
                  disabled
                  color='#fd7e14'
                  badge='Em breve'
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className='col-12 col-xl-4'>
          <div className='row g-4'>
            {/* Recent Activity */}
            <div className='col-12'>
              <RecentActivity items={mockActivities} />
            </div>

            {/* System Status */}
            <div className='col-12'>
              <SystemStatusCard />
            </div>

            {/* Quick Help */}
            <div className='col-12'>
              <QuickHelp />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
