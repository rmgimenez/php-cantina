import { ReactNode } from 'react';

interface FormGroupProps {
  label: string;
  required?: boolean;
  children: ReactNode;
  error?: string;
  help?: string;
}

export function FormGroup({ label, required = false, children, error, help }: FormGroupProps) {
  return (
    <div className='mb-3'>
      <label className='form-label fw-medium'>
        {label}
        {required && <span className='text-danger ms-1'>*</span>}
      </label>
      {children}
      {error && (
        <div className='form-text text-danger small'>
          <span className='me-1'>⚠️</span>
          {error}
        </div>
      )}
      {help && !error && <div className='form-text text-muted small'>{help}</div>}
    </div>
  );
}

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  help?: string;
}

export function Input({ label, error, help, required, className = '', ...props }: InputProps) {
  return (
    <FormGroup label={label} required={required} error={error} help={help}>
      <input
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
        required={required}
      />
    </FormGroup>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  help?: string;
  options: Array<{ value: string | number; label: string; disabled?: boolean }>;
  placeholder?: string;
}

export function Select({
  label,
  error,
  help,
  required,
  className = '',
  options,
  placeholder,
  ...props
}: SelectProps) {
  return (
    <FormGroup label={label} required={required} error={error} help={help}>
      <select
        className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
        required={required}
      >
        {placeholder && <option value=''>{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value} disabled={option.disabled}>
            {option.label}
          </option>
        ))}
      </select>
    </FormGroup>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  help?: string;
}

export function Textarea({
  label,
  error,
  help,
  required,
  className = '',
  ...props
}: TextareaProps) {
  return (
    <FormGroup label={label} required={required} error={error} help={help}>
      <textarea
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        {...props}
        required={required}
      />
    </FormGroup>
  );
}
