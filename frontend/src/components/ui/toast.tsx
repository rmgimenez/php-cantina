import { useEffect, useState } from 'react';

interface Toast {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface ToastProps extends Toast {
  onRemove: (id: string) => void;
}

function ToastItem({ id, title, message, type, duration = 5000, onRemove }: ToastProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => onRemove(id), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [id, duration, onRemove]);

  const getToastClass = () => {
    switch (type) {
      case 'success':
        return 'text-bg-success';
      case 'error':
        return 'text-bg-danger';
      case 'warning':
        return 'text-bg-warning';
      case 'info':
        return 'text-bg-info';
      default:
        return 'text-bg-primary';
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'bi bi-check-circle';
      case 'error':
        return 'bi bi-x-circle';
      case 'warning':
        return 'bi bi-exclamation-triangle';
      case 'info':
        return 'bi bi-info-circle';
      default:
        return 'bi bi-bell';
    }
  };

  return (
    <div
      className={`toast ${getToastClass()} ${isVisible ? 'show' : 'hide'}`}
      role='alert'
      style={{
        transition: 'all 0.3s ease',
        transform: isVisible ? 'translateX(0)' : 'translateX(100%)',
        opacity: isVisible ? 1 : 0,
      }}
    >
      <div className='toast-header'>
        <i className={`${getIcon()} me-2`}></i>
        <strong className='me-auto'>{title}</strong>
        <button
          type='button'
          className='btn-close'
          onClick={() => {
            setIsVisible(false);
            setTimeout(() => onRemove(id), 300);
          }}
        ></button>
      </div>
      <div className='toast-body'>{message}</div>
    </div>
  );
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    setToasts((prev) => [...prev, { ...toast, id }]);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  };

  // Expose addToast globally for easy access
  useEffect(() => {
    (window as typeof window & { showToast?: typeof addToast }).showToast = addToast;
  }, []);

  return (
    <div className='toast-container position-fixed top-0 end-0 p-3' style={{ zIndex: 1055 }}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} {...toast} onRemove={removeToast} />
      ))}
    </div>
  );
}
