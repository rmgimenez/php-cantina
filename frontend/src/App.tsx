import { type ReactNode, useEffect } from 'react';
import { Link, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import { Layout } from './components/layout';
import { useAuth } from './hooks/use-auth';
import Dashboard from './pages/dashboard';
import LoginPage from './pages/login';
import TipoProdutoForm from './pages/tipos-produtos/tipo-produto-form';
import TiposProdutosList from './pages/tipos-produtos/tipos-produtos-list';

function NotFound() {
  return (
    <Layout>
      <div className='container'>
        <div className='row justify-content-center'>
          <div className='col-md-6 text-center'>
            <div className='card'>
              <div className='card-body py-5'>
                <div className='display-1 text-muted mb-3'>
                  <i className='bi bi-exclamation-triangle'></i>
                </div>
                <h2 className='text-muted'>Página não encontrada</h2>
                <p className='text-muted mb-4'>A página que você está procurando não existe.</p>
                <Link to='/' className='btn btn-primary'>
                  <i className='bi bi-house-door me-2'></i>
                  Voltar ao Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

function PrivateRoute({ children }: { children: ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to='/login' replace />;
  }
  return <Layout>{children}</Layout>;
}

function App() {
  const { loadUser, token } = useAuth();
  useEffect(() => {
    if (token) {
      void loadUser();
    }
  }, [token, loadUser]);

  return (
    <Routes>
      <Route path='/login' element={<LoginPage />} />
      <Route
        path='/'
        element={
          <PrivateRoute>
            <Dashboard />
          </PrivateRoute>
        }
      />
      <Route
        path='/tipos-produtos'
        element={
          <PrivateRoute>
            <TiposProdutosList />
          </PrivateRoute>
        }
      />
      <Route
        path='/tipos-produtos/novo'
        element={
          <PrivateRoute>
            <TipoProdutoForm />
          </PrivateRoute>
        }
      />
      <Route
        path='/tipos-produtos/:id/editar'
        element={
          <PrivateRoute>
            <TipoProdutoForm />
          </PrivateRoute>
        }
      />
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
}

export default App;
