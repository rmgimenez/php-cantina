import Link from 'next/link';
import { ReactNode } from 'react';

interface DashboardCardProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconClass: string;
  href?: string;
  disabled?: boolean;
  buttonText?: string;
  buttonVariant?: 'primary' | 'success' | 'warning' | 'info' | 'secondary' | 'dark';
  onClick?: () => void;
}

export default function DashboardCard({
  title,
  description,
  icon,
  iconClass,
  href,
  disabled = false,
  buttonText = 'Abrir',
  buttonVariant = 'primary',
  onClick,
}: DashboardCardProps) {
  const buttonClass = `btn btn-${buttonVariant} btn-sm ${disabled ? 'disabled' : ''}`;

  return (
    <div className='col-md-4 mb-4'>
      <div className='card feature-card h-100'>
        <div className='card-body d-flex flex-column text-center'>
          <div className={`feature-icon ${iconClass} mx-auto`}>{icon}</div>
          <h5 className='card-title mb-3'>{title}</h5>
          <p className='card-text text-muted flex-grow-1 small'>{description}</p>
          <div className='mt-auto'>
            {href && !disabled ? (
              <Link href={href} className={buttonClass}>
                {buttonText}
              </Link>
            ) : (
              <button className={buttonClass} onClick={onClick} disabled={disabled}>
                {buttonText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
