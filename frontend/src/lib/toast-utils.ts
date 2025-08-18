// Types for toast functionality
interface ToastData {
  title: string;
  message: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

declare global {
  interface Window {
    showToast?: (toast: ToastData) => void;
  }
}

// Helper functions to show toasts
export const showSuccessToast = (title: string, message: string) => {
  window.showToast?.({ title, message, type: 'success' });
};

export const showErrorToast = (title: string, message: string) => {
  window.showToast?.({ title, message, type: 'error' });
};

export const showWarningToast = (title: string, message: string) => {
  window.showToast?.({ title, message, type: 'warning' });
};

export const showInfoToast = (title: string, message: string) => {
  window.showToast?.({ title, message, type: 'info' });
};
