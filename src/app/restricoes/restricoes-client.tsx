'use client';
import { useState } from 'react';
import LoadingSpinner from '../../components/ui/loading';

type Restricao = {
  id: number;
  tipo: 'produto' | 'tipo_produto';
  alvoId: number | null;
  descricao?: string | null;
  ativo: boolean;
  permitido: boolean;
};

export default function RestricoesClient() {
  const [restricoes, setRestricoes] = useState<Restricao[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [raBusca, setRaBusca] = useState('');
  const [novoTipo, setNovoTipo] = useState<'produto' | 'tipo_produto'>('produto');
  const [novoAlvoId, setNovoAlvoId] = useState('');
  const [novoPermitido, setNovoPermitido] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // não carregar automaticamente sem RA — a API exige query param ra

  async function carregar(ra?: number | string) {
    setLoading(true);
    setErro('');
    try {
      const raParam = ra ?? raBusca;
      if (!raParam) {
        setErro('Informe o RA para buscar as restrições');
        setRestricoes([]);
        setLoading(false);
        return;
      }
      const res = await fetch(`/api/restricoes?ra=${encodeURIComponent(String(raParam))}`);
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro(j.error || 'Falha ao carregar restrições');
        setRestricoes([]);
        return;
      }
      const j = await res.json();
      setRestricoes(j.data || []);
    } catch (e) {
      setErro('Erro de conexão');
      setRestricoes([]);
    } finally {
      setLoading(false);
    }
  }

  async function criarRestricao() {
    if (!raBusca) {
      setErro('Informe o RA antes de criar uma restrição');
      return;
    }
    if (!novoAlvoId) {
      setErro('Informe o ID do produto ou tipo de produto');
      return;
    }
    setSalvando(true);
    setErro('');
    try {
      const body: any = { ra: Number(raBusca), tipo: novoTipo, permitido: novoPermitido };
      if (novoTipo === 'produto') body.produtoId = Number(novoAlvoId);
      else body.tipoProdutoId = Number(novoAlvoId);

      const res = await fetch('/api/restricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const j = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErro(j.error || 'Erro ao criar restrição');
        return;
      }
      // recarregar lista
      await carregar(raBusca);
      setNovoAlvoId('');
      setNovoPermitido(false);
    } catch (e) {
      setErro('Erro de conexão');
    } finally {
      setSalvando(false);
    }
  }

  async function inativar(id: number) {
    if (!confirm('Inativar esta restrição?')) return;
    try {
      const res = await fetch(`/api/restricoes/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro(j.error || 'Erro ao inativar');
        return;
      }
      // remover da lista local
      setRestricoes((s) => s.map((r) => (r.id === id ? { ...r, ativo: false } : r)));
    } catch (e) {
      setErro('Erro de conexão');
    }
  }

  if (loading) return <LoadingSpinner text='Carregando restrições...' />;

  return (
    <div className='container py-4'>
      <div className='row mb-3'>
        <div className='col-lg-4'>
          <div className='input-group'>
            <input
              type='text'
              placeholder='RA do aluno'
              className='form-control'
              value={raBusca}
              onChange={(e) => setRaBusca(e.target.value)}
            />
            <button
              className='btn btn-primary'
              onClick={() => carregar(Number(raBusca))}
              disabled={!raBusca}
            >
              Buscar
            </button>
            <button
              className='btn btn-outline-secondary'
              onClick={() => {
                setRaBusca('');
                setRestricoes([]);
                setErro('');
              }}
            >
              Limpar
            </button>
          </div>
        </div>
      </div>
      <div className='row mb-4'>
        <div className='col-12'>
          <div className='card dashboard-card'>
            <div className='card-body'>
              <div className='d-flex justify-content-between align-items-center'>
                <div>
                  <h2 className='h4 mb-1 text-primary'>🔒 Restrições</h2>
                  <p className='text-muted mb-0'>Lista de restrições configuradas para alunos</p>
                </div>
                <div className='text-end small text-muted'>Total: {restricoes.length}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Formulário de criação */}
      <div className='row mb-4'>
        <div className='col-lg-8'>
          <div className='card'>
            <div className='card-body'>
              <h6 className='mb-3'>Adicionar restrição</h6>
              <div className='row g-2 align-items-center'>
                <div className='col-md-3'>
                  <select
                    className='form-select'
                    value={novoTipo}
                    onChange={(e) => setNovoTipo(e.target.value as any)}
                  >
                    <option value='produto'>Produto</option>
                    <option value='tipo_produto'>Tipo de produto</option>
                  </select>
                </div>
                <div className='col-md-3'>
                  <input
                    className='form-control'
                    placeholder={novoTipo === 'produto' ? 'ID do produto' : 'ID do tipo'}
                    value={novoAlvoId}
                    onChange={(e) => setNovoAlvoId(e.target.value)}
                  />
                </div>
                <div className='col-md-2 form-check'>
                  <input
                    className='form-check-input'
                    type='checkbox'
                    id='permitido'
                    checked={novoPermitido}
                    onChange={(e) => setNovoPermitido(e.target.checked)}
                  />
                  <label className='form-check-label ms-2' htmlFor='permitido'>
                    Permitido
                  </label>
                </div>
                <div className='col-md-4 text-end'>
                  <button
                    className='btn btn-primary me-2'
                    onClick={criarRestricao}
                    disabled={salvando}
                  >
                    {salvando ? 'Salvando...' : 'Adicionar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {erro && (
        <div className='row mb-3'>
          <div className='col-12'>
            <div className='alert alert-danger d-flex align-items-center'>
              <span className='me-2'>⚠️</span>
              {erro}
            </div>
          </div>
        </div>
      )}

      <div className='row g-4'>
        <div className='col-12'>
          <div className='card'>
            <div className='card-body'>
              {restricoes.length === 0 ? (
                <div className='text-center text-muted py-3'>Nenhuma restrição encontrada</div>
              ) : (
                <div className='list-group'>
                  {restricoes.map((r) => (
                    <div
                      key={r.id}
                      className='list-group-item d-flex justify-content-between align-items-center'
                    >
                      <div>
                        <div className='fw-medium'>
                          {r.tipo === 'produto' ? 'Produto' : 'Tipo de produto'}{' '}
                          {r.alvoId ? `• ID ${r.alvoId}` : ''}{' '}
                          {r.permitido ? '(Permitido)' : '(Bloqueado)'}
                        </div>
                        {r.descricao && <small className='text-muted'>{r.descricao}</small>}
                      </div>
                      <div className='d-flex align-items-center'>
                        {!r.ativo && <span className='badge bg-secondary me-2'>Inativo</span>}
                        {r.ativo && (
                          <button
                            className='btn btn-sm btn-outline-danger'
                            onClick={() => inativar(r.id)}
                          >
                            Inativar
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
