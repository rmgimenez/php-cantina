import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/login-form';
import { useAuth } from '../hooks/use-auth';

export default function LoginPage() {
  const { token } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (token) navigate('/');
  }, [token, navigate]);

  return (
    <div className='login-page'>
      <LoginForm />
    </div>
  );
}
