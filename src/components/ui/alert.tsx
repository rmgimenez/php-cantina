import { ReactNode } from 'react';

interface AlertProps {
  type: 'success' | 'danger' | 'warning' | 'info';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export default function Alert({ type, title, children, onClose, className = '' }: AlertProps) {
  const icons = {
    success: '✅',
    danger: '❌',
    warning: '⚠️',
    info: 'ℹ️',
  };

  return (
    <div className={`alert alert-${type} d-flex align-items-start ${className}`} role='alert'>
      <div className='me-2 flex-shrink-0'>{icons[type]}</div>
      <div className='flex-grow-1'>
        {title && <div className='fw-bold mb-1'>{title}</div>}
        <div>{children}</div>
      </div>
      {onClose && (
        <button type='button' className='btn-close ms-2' aria-label='Fechar' onClick={onClose} />
      )}
    </div>
  );
}

export function SuccessAlert({ children, ...props }: Omit<AlertProps, 'type'>) {
  return (
    <Alert type='success' {...props}>
      {children}
    </Alert>
  );
}

export function ErrorAlert({ children, ...props }: Omit<AlertProps, 'type'>) {
  return (
    <Alert type='danger' {...props}>
      {children}
    </Alert>
  );
}

export function WarningAlert({ children, ...props }: Omit<AlertProps, 'type'>) {
  return (
    <Alert type='warning' {...props}>
      {children}
    </Alert>
  );
}

export function InfoAlert({ children, ...props }: Omit<AlertProps, 'type'>) {
  return (
    <Alert type='info' {...props}>
      {children}
    </Alert>
  );
}
