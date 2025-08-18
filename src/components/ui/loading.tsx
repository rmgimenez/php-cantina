interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary' | 'light';
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  variant = 'primary',
  text = 'Carregando...',
}: LoadingSpinnerProps) {
  const sizeClass = {
    sm: 'spinner-border-sm',
    md: '',
    lg: 'spinner-border-lg',
  }[size];

  return (
    <div className='d-flex flex-column align-items-center justify-content-center p-4'>
      <div className={`spinner-border text-${variant} ${sizeClass}`} role='status'>
        <span className='visually-hidden'>Loading...</span>
      </div>
      {text && <div className='mt-2 text-muted'>{text}</div>}
    </div>
  );
}

export function PageLoading() {
  return (
    <div className='container-fluid vh-100 d-flex align-items-center justify-content-center'>
      <LoadingSpinner size='lg' text='Carregando página...' />
    </div>
  );
}

export function ButtonLoading({ text = 'Processando...' }: { text?: string }) {
  return (
    <>
      <span
        className='spinner-border spinner-border-sm me-2'
        role='status'
        aria-hidden='true'
      ></span>
      {text}
    </>
  );
}
