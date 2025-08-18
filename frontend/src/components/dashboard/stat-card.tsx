type StatCardProps = {
  title: string;
  value: string | number;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'info';
};

export default function StatCard({ title, value, icon, variant = 'primary' }: StatCardProps) {
  return (
    <div className={`card stat-card shadow-sm h-100 border-0`}>
      <div className='card-body d-flex align-items-center gap-3'>
        <div
          className={`stat-icon bg-${variant} text-white d-flex align-items-center justify-content-center`}
        >
          {icon ? <i className={icon}></i> : <i className='bi bi-bar-chart-line'></i>}
        </div>

        <div className='flex-grow-1 text-start'>
          <div className='text-muted small'>{title}</div>
          <div className='h5 mb-0'>{value}</div>
        </div>
      </div>
    </div>
  );
}
