'use client';

import { createContext, ReactNode, useContext, useState } from 'react';

interface Toast {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

interface ToastContextType {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString();
    const newToast = { ...toast, id };
    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast
    setTimeout(() => {
      removeToast(id);
    }, toast.duration || 5000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}

function ToastContainer() {
  const { toasts, removeToast } = useToast();

  const getIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return '✅';
      case 'error':
        return '❌';
      case 'warning':
        return '⚠️';
      case 'info':
        return 'ℹ️';
    }
  };

  const getBgClass = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'bg-success';
      case 'error':
        return 'bg-danger';
      case 'warning':
        return 'bg-warning';
      case 'info':
        return 'bg-info';
    }
  };

  return (
    <div className='toast-container position-fixed top-0 end-0 p-3' style={{ zIndex: 1055 }}>
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast show ${getBgClass(toast.type)} text-white`}
          role='alert'
        >
          <div className='toast-header'>
            <span className='me-2'>{getIcon(toast.type)}</span>
            <strong className='me-auto'>{toast.title || 'Notificação'}</strong>
            <button
              type='button'
              className='btn-close btn-close-white'
              onClick={() => removeToast(toast.id)}
            />
          </div>
          <div className='toast-body'>{toast.message}</div>
        </div>
      ))}
    </div>
  );
}
