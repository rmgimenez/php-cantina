import { useEffect, useState } from 'react';

interface LiveStatsProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  isLoading?: boolean;
}

export function LiveStatCard({
  title,
  value,
  previousValue,
  icon,
  color,
  trend = 'stable',
  isLoading = false,
}: LiveStatsProps) {
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (previousValue !== undefined && previousValue !== value) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
  }, [value, previousValue]);

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'bi bi-arrow-up';
      case 'down':
        return 'bi bi-arrow-down';
      default:
        return 'bi bi-dash';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-success';
      case 'down':
        return 'text-danger';
      default:
        return 'text-muted';
    }
  };

  return (
    <div className='col-sm-6 col-xl-3'>
      <div className='card h-100 live-stat-card'>
        <div className='card-body d-flex align-items-center'>
          <div
            className='d-flex align-items-center justify-content-center rounded me-3 stat-icon-container'
            style={{
              width: '52px',
              height: '52px',
              backgroundColor: `${color}15`,
              border: `2px solid ${color}20`,
            }}
          >
            <i className={`${icon} fs-4`} style={{ color }}></i>
          </div>

          <div className='flex-grow-1'>
            <div className='text-muted small mb-1 fw-medium'>{title}</div>

            <div className='d-flex align-items-center'>
              <div
                className={`h3 mb-0 me-2 ${isAnimating ? 'stat-value-animate' : ''}`}
                style={{ color: '#212529' }}
              >
                {isLoading ? (
                  <div className='placeholder-glow'>
                    <span className='placeholder col-6'></span>
                  </div>
                ) : (
                  value
                )}
              </div>

              {trend !== 'stable' && !isLoading && (
                <div className={`small ${getTrendColor()}`}>
                  <i className={`${getTrendIcon()} me-1`}></i>
                  <span className='fw-medium'>
                    {trend === 'up' ? '+' : '-'}
                    {Math.abs(Number(value) - Number(previousValue || 0))}
                  </span>
                </div>
              )}
            </div>

            {previousValue !== undefined && !isLoading && (
              <div className='small text-muted mt-1'>Anterior: {previousValue}</div>
            )}
          </div>
        </div>

        {isLoading && (
          <div className='position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center bg-white bg-opacity-75'>
            <div className='spinner-border spinner-border-sm text-primary' role='status'>
              <span className='visually-hidden'>Carregando...</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface DashboardMetric {
  id: string;
  title: string;
  value: string | number;
  icon: string;
  color: string;
  trend?: 'up' | 'down' | 'stable';
  previousValue?: string | number;
}

export function LiveDashboardStats() {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([
    {
      id: 'sales-today',
      title: 'Vendas Hoje',
      value: 'R$ 0,00',
      icon: 'bi bi-cash-coin',
      color: '#198754',
      trend: 'stable',
    },
    {
      id: 'products-active',
      title: 'Produtos Ativos',
      value: '0',
      icon: 'bi bi-box-seam',
      color: '#0d6efd',
      trend: 'stable',
    },
    {
      id: 'students-active',
      title: 'Alunos Ativos',
      value: '--',
      icon: 'bi bi-people',
      color: '#fd7e14',
      trend: 'stable',
    },
    {
      id: 'low-stock',
      title: 'Estoque Baixo',
      value: '0',
      icon: 'bi bi-exclamation-triangle',
      color: '#dc3545',
      trend: 'stable',
    },
  ]);

  const [isLoading, setIsLoading] = useState(false);

  // Simulated data refresh (replace with real API calls)
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // 30% chance of update
        setIsLoading(true);

        setTimeout(() => {
          setMetrics((prevMetrics) =>
            prevMetrics.map((metric) => {
              const shouldUpdate = Math.random() > 0.5;
              if (!shouldUpdate) return metric;

              const newValue =
                metric.id === 'sales-today'
                  ? `R$ ${(Math.random() * 100).toFixed(2)}`
                  : String(Math.floor(Math.random() * 10));

              const newTrend: 'up' | 'down' | 'stable' =
                newValue > metric.value ? 'up' : newValue < metric.value ? 'down' : 'stable';

              return {
                ...metric,
                previousValue: metric.value,
                value: newValue,
                trend: newTrend,
              };
            })
          );
          setIsLoading(false);
        }, 800);
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className='row mb-4 g-3'>
      {metrics.map((metric) => (
        <LiveStatCard
          key={metric.id}
          title={metric.title}
          value={metric.value}
          previousValue={metric.previousValue}
          icon={metric.icon}
          color={metric.color}
          trend={metric.trend}
          isLoading={isLoading}
        />
      ))}
    </div>
  );
}
