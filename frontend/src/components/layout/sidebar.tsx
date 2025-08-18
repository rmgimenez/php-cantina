import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface SidebarItem {
  title: string;
  icon: string;
  path?: string;
  children?: SidebarItem[];
  badge?: string;
  disabled?: boolean;
}

const sidebarItems: SidebarItem[] = [
  {
    title: 'Dashboard',
    icon: 'bi bi-house-door',
    path: '/',
  },
  {
    title: 'Produtos',
    icon: 'bi bi-box',
    children: [
      {
        title: 'Categorias',
        icon: 'bi bi-tags',
        path: '/tipos-produtos',
      },
      {
        title: 'Produtos',
        icon: 'bi bi-box-seam',
        path: '/produtos',
        disabled: true,
      },
    ],
  },
  {
    title: 'Vendas',
    icon: 'bi bi-cart3',
    children: [
      {
        title: 'Nova Venda',
        icon: 'bi bi-plus-circle',
        path: '/vendas/nova',
        disabled: true,
      },
      {
        title: 'Histórico',
        icon: 'bi bi-clock-history',
        path: '/vendas/historico',
        disabled: true,
      },
    ],
  },
  {
    title: 'Estoque',
    icon: 'bi bi-boxes',
    children: [
      {
        title: 'Controle',
        icon: 'bi bi-clipboard-check',
        path: '/estoque/controle',
        disabled: true,
      },
      {
        title: 'Entrada',
        icon: 'bi bi-arrow-down-circle',
        path: '/estoque/entrada',
        disabled: true,
      },
      {
        title: 'Relatório',
        icon: 'bi bi-file-earmark-text',
        path: '/estoque/relatorio',
        disabled: true,
      },
    ],
  },
  {
    title: 'Alunos',
    icon: 'bi bi-people',
    children: [
      {
        title: 'Buscar Aluno',
        icon: 'bi bi-search',
        path: '/alunos/buscar',
        disabled: true,
      },
      {
        title: 'Créditos',
        icon: 'bi bi-credit-card',
        path: '/alunos/creditos',
        disabled: true,
      },
      {
        title: 'Histórico',
        icon: 'bi bi-journal-text',
        path: '/alunos/historico',
        disabled: true,
      },
    ],
  },
  {
    title: 'Relatórios',
    icon: 'bi bi-graph-up',
    children: [
      {
        title: 'Vendas',
        icon: 'bi bi-bar-chart',
        path: '/relatorios/vendas',
        disabled: true,
      },
      {
        title: 'Financeiro',
        icon: 'bi bi-currency-dollar',
        path: '/relatorios/financeiro',
        disabled: true,
      },
      {
        title: 'Estoque',
        icon: 'bi bi-boxes',
        path: '/relatorios/estoque',
        disabled: true,
      },
    ],
  },
  {
    title: 'Configurações',
    icon: 'bi bi-gear',
    children: [
      {
        title: 'Usuários',
        icon: 'bi bi-person-gear',
        path: '/configuracoes/usuarios',
        disabled: true,
      },
      {
        title: 'Sistema',
        icon: 'bi bi-sliders',
        path: '/configuracoes/sistema',
        disabled: true,
      },
    ],
  },
];

interface SidebarMenuItemProps {
  item: SidebarItem;
  isActive: boolean;
  isExpanded: boolean;
  onToggle: () => void;
}

function SidebarMenuItem({ item, isActive, isExpanded, onToggle }: SidebarMenuItemProps) {
  const location = useLocation();

  if (item.children) {
    return (
      <li className='nav-item'>
        <button
          className={`nav-link d-flex align-items-center justify-content-between w-100 ${
            isExpanded ? 'active' : ''
          }`}
          onClick={onToggle}
        >
          <div className='d-flex align-items-center'>
            <i className={`${item.icon} me-2`}></i>
            <span>{item.title}</span>
          </div>
          <i className={`bi ${isExpanded ? 'bi-chevron-down' : 'bi-chevron-right'} small`}></i>
        </button>

        <div className={`collapse ${isExpanded ? 'show' : ''}`}>
          <ul className='nav flex-column ms-3'>
            {item.children.map((child, index) => {
              const childIsActive = child.path === location.pathname;

              return (
                <li key={index} className='nav-item'>
                  {child.disabled || !child.path ? (
                    <span className='nav-link text-muted disabled d-flex align-items-center'>
                      <i className={`${child.icon} me-2 small`}></i>
                      <span className='small'>{child.title}</span>
                      <span className='badge bg-secondary ms-auto'>Em breve</span>
                    </span>
                  ) : (
                    <Link
                      to={child.path}
                      className={`nav-link d-flex align-items-center ${
                        childIsActive ? 'active' : ''
                      }`}
                    >
                      <i className={`${child.icon} me-2 small`}></i>
                      <span className='small'>{child.title}</span>
                      {child.badge && (
                        <span className='badge bg-primary ms-auto'>{child.badge}</span>
                      )}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      </li>
    );
  }

  return (
    <li className='nav-item'>
      {item.disabled || !item.path ? (
        <span className='nav-link text-muted disabled d-flex align-items-center'>
          <i className={`${item.icon} me-2`}></i>
          <span>{item.title}</span>
          <span className='badge bg-secondary ms-auto'>Em breve</span>
        </span>
      ) : (
        <Link
          to={item.path}
          className={`nav-link d-flex align-items-center ${isActive ? 'active' : ''}`}
        >
          <i className={`${item.icon} me-2`}></i>
          <span>{item.title}</span>
          {item.badge && <span className='badge bg-primary ms-auto'>{item.badge}</span>}
        </Link>
      )}
    </li>
  );
}

export function Sidebar() {
  const location = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>(['Produtos']);

  const toggleExpanded = (title: string) => {
    setExpandedItems((prev) =>
      prev.includes(title) ? prev.filter((item) => item !== title) : [...prev, title]
    );
  };

  return (
    <aside className='app-sidebar bg-white border-end d-none d-lg-block'>
      <div className='sidebar-content p-3'>
        <div className='sidebar-header mb-4'>
          <h6 className='text-muted text-uppercase small fw-bold mb-0'>
            <i className='bi bi-grid-3x3-gap me-2'></i>
            Menu Principal
          </h6>
        </div>

        <nav className='sidebar-nav'>
          <ul className='nav flex-column'>
            {sidebarItems.map((item, index) => {
              const isActive = item.path === location.pathname;
              const isExpanded = expandedItems.includes(item.title);

              return (
                <SidebarMenuItem
                  key={index}
                  item={item}
                  isActive={isActive}
                  isExpanded={isExpanded}
                  onToggle={() => toggleExpanded(item.title)}
                />
              );
            })}
          </ul>
        </nav>

        <div className='sidebar-footer mt-4 pt-3 border-top'>
          <div className='small text-muted'>
            <div className='d-flex align-items-center justify-content-between mb-2'>
              <span>Status do Sistema</span>
              <span className='badge bg-success'>Online</span>
            </div>
            <div className='d-flex align-items-center justify-content-between'>
              <span>Versão</span>
              <span>v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
