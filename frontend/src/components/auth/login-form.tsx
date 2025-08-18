import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/use-auth';

interface FormState {
  usuario: string;
  senha: string;
}

export function LoginForm() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<FormState>({ usuario: '', senha: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.usuario || !form.senha) {
      setError('Preencha usuário e senha.');
      return;
    }
    setLoading(true);
    const resp = await login(form);
    setLoading(false);
    if (!resp.success) {
      setError(resp.message || 'Erro ao entrar');
    } else {
      navigate('/');
    }
  }

  return (
    <div className='login-card' role='region' aria-label='Login cantina'>
      <img src='/vite.svg' alt='Cantina' className='login-logo' />
      <h2 className='login-title'>Login Cantina</h2>

      {error && (
        <div className='login-error' role='alert'>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className='login-form'>
        <label className='field'>
          <span className='field-label'>Usuário</span>
          <input
            name='usuario'
            value={form.usuario}
            onChange={handleChange}
            autoComplete='username'
            placeholder='Usuário'
            className='field-input'
          />
        </label>

        <label className='field'>
          <span className='field-label'>Senha</span>
          <input
            name='senha'
            type='password'
            value={form.senha}
            onChange={handleChange}
            autoComplete='current-password'
            placeholder='Senha'
            className='field-input'
          />
        </label>

        <button type='submit' className='btn-primary' disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </div>
  );
}
