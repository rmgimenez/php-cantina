import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { verifyToken } from '../../lib/auth/tokens';

type TokenPayload = {
  username: string;
  role: 'administrador' | 'atendente' | 'estoquista';
  iat?: number;
  exp?: number;
};

async function getUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('cant_token')?.value;
  if (!token) return null;
  try {
    const payload = verifyToken(token) as TokenPayload;
    return payload;
  } catch (err) {
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect('/login');
  }

  return (
    <div className='container py-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <div>
          <h2 className='mb-0'>Dashboard</h2>
          <small className='text-muted'>
            Bem-vindo, {user.username} ({user.role})
          </small>
        </div>
        <form action='/api/auth/logout' method='post'>
          <button className='btn btn-outline-secondary btn-sm'>Sair</button>
        </form>
      </div>

      <div className='row g-4'>
        <div className='col-md-3'>
          <div className='card h-100 shadow-sm'>
            <div className='card-body'>
              <h5 className='card-title'>Resumo</h5>
              <p className='card-text small text-muted'>
                Indicadores rápidos do dia (placeholder).
              </p>
              <ul className='list-unstyled mb-0 small'>
                <li>Vendas: --</li>
                <li>Itens vendidos: --</li>
                <li>Saldo médio alunos: --</li>
              </ul>
            </div>
          </div>
        </div>
        <div className='col-md-9'>
          <div className='row g-4'>
            <div className='col-md-4'>
              <div className='card h-100 border-primary'>
                <div className='card-body d-flex flex-column'>
                  <h5 className='card-title'>Registrar Venda</h5>
                  <p className='card-text small flex-grow-1'>
                    Iniciar processo de venda para aluno, funcionário ou avulso.
                  </p>
                  <a className='btn btn-primary btn-sm disabled'>Abrir (em breve)</a>
                </div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='card h-100 border-success'>
                <div className='card-body d-flex flex-column'>
                  <h5 className='card-title'>Produtos</h5>
                  <p className='card-text small flex-grow-1'>
                    Gerenciar cadastro e tipos de produtos.
                  </p>
                  <a className='btn btn-success btn-sm disabled'>Gerenciar</a>
                </div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='card h-100 border-warning'>
                <div className='card-body d-flex flex-column'>
                  <h5 className='card-title'>Estoque</h5>
                  <p className='card-text small flex-grow-1'>
                    Movimentações, ajustes e alertas de mínimo.
                  </p>
                  <a className='btn btn-warning btn-sm text-white disabled'>Estoque</a>
                </div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='card h-100 border-info'>
                <div className='card-body d-flex flex-column'>
                  <h5 className='card-title'>Pacotes</h5>
                  <p className='card-text small flex-grow-1'>
                    Consulta e consumo de pacotes de alimentação.
                  </p>
                  <a className='btn btn-info btn-sm text-white disabled'>Ver Pacotes</a>
                </div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='card h-100 border-secondary'>
                <div className='card-body d-flex flex-column'>
                  <h5 className='card-title'>Relatórios</h5>
                  <p className='card-text small flex-grow-1'>
                    Vendas diárias, consumo e financeiros.
                  </p>
                  <a className='btn btn-secondary btn-sm disabled'>Abrir</a>
                </div>
              </div>
            </div>
            <div className='col-md-4'>
              <div className='card h-100 border-dark'>
                <div className='card-body d-flex flex-column'>
                  <h5 className='card-title'>Administração</h5>
                  <p className='card-text small flex-grow-1'>Usuários, limites e configurações.</p>
                  <a className='btn btn-dark btn-sm disabled'>Configurar</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
