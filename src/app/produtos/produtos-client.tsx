'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../../components/layout/navbar';
import LoadingSpinner from '../../components/ui/loading';
import Modal, { ConfirmModal } from '../../components/ui/modal';

type User = { username: string; role: 'administrador' | 'atendente' | 'estoquista' };
type TipoProduto = { id: number; nome: string; descricao: string | null; ativo: number };
type Produto = {
  id: number;
  codigoBarras: string | null;
  nome: string;
  descricao: string | null;
  tipoProdutoId: number;
  tipoProdutoNome?: string;
  preco: string;
  estoqueAtual: number;
  estoqueMinimo: number;
  ativo: number;
};

export default function ProdutosClient({ user }: { user: User }) {
  const [tipos, setTipos] = useState<TipoProduto[]>([]);
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState('');
  const [formTipo, setFormTipo] = useState({ nome: '', descricao: '' });
  const [formProduto, setFormProduto] = useState({
    nome: '',
    descricao: '',
    preco: '',
    tipoProdutoId: '',
    codigoBarras: '',
    estoqueAtual: '0',
    estoqueMinimo: '0',
  });

  // edição de tipos
  const [editTipoOpen, setEditTipoOpen] = useState(false);
  const [editTipo, setEditTipo] = useState<TipoProduto | null>(null);
  const [editTipoForm, setEditTipoForm] = useState({ nome: '', descricao: '' });
  const [confirmDeleteTipoId, setConfirmDeleteTipoId] = useState<number | null>(null);

  // edição de produto
  const [editProdutoOpen, setEditProdutoOpen] = useState(false);
  const [editProduto, setEditProduto] = useState<Produto | null>(null);
  const [editProdutoForm, setEditProdutoForm] = useState({
    nome: '',
    descricao: '',
    preco: '',
    tipoProdutoId: '',
    codigoBarras: '',
    estoqueAtual: '0',
    estoqueMinimo: '0',
    ativo: 1,
  });
  const [confirmDeleteProdutoId, setConfirmDeleteProdutoId] = useState<number | null>(null);

  const podeEditar = ['administrador', 'estoquista'].includes(user.role);

  async function carregar() {
    setLoading(true);
    try {
      const [rTipos, rProdutos] = await Promise.all([
        fetch('/api/tipos-produtos').then((r) => r.json()),
        fetch('/api/produtos').then((r) => r.json()),
      ]);
      setTipos(rTipos.data || []);
      setProdutos(rProdutos.data || []);
    } catch (e: any) {
      setErro('Falha ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    carregar();
  }, []);

  async function criarTipo(e: React.FormEvent) {
    e.preventDefault();
    if (!podeEditar) return;
    setErro('');
    try {
      const res = await fetch('/api/tipos-produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: formTipo.nome, descricao: formTipo.descricao }),
      });
      if (!res.ok) {
        setErro('Erro ao criar tipo de produto');
        return;
      }
      setFormTipo({ nome: '', descricao: '' });
      carregar();
    } catch {
      setErro('Erro de conexão');
    }
  }

  async function criarProduto(e: React.FormEvent) {
    e.preventDefault();
    if (!podeEditar) return;
    setErro('');
    try {
      const body = {
        nome: formProduto.nome,
        descricao: formProduto.descricao,
        tipoProdutoId: Number(formProduto.tipoProdutoId),
        preco: Number(formProduto.preco),
        codigoBarras: formProduto.codigoBarras || undefined,
        estoqueAtual: Number(formProduto.estoqueAtual),
        estoqueMinimo: Number(formProduto.estoqueMinimo),
      };
      const res = await fetch('/api/produtos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json();
        setErro('Erro ao criar produto: ' + (j.error || ''));
        return;
      }
      setFormProduto({
        nome: '',
        descricao: '',
        preco: '',
        tipoProdutoId: '',
        codigoBarras: '',
        estoqueAtual: '0',
        estoqueMinimo: '0',
      });
      carregar();
    } catch {
      setErro('Erro de conexão');
    }
  }

  // TIPOS: abrir modal de edição
  function abrirEditarTipo(t: TipoProduto) {
    setEditTipo(t);
    setEditTipoForm({ nome: t.nome, descricao: t.descricao || '' });
    setEditTipoOpen(true);
  }

  async function salvarTipoEditado(e: React.FormEvent) {
    e.preventDefault();
    if (!editTipo) return;
    try {
      const res = await fetch(`/api/tipos-produtos/${editTipo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: editTipoForm.nome, descricao: editTipoForm.descricao }),
      });
      if (!res.ok) {
        setErro('Erro ao editar tipo');
        return;
      }
      setEditTipoOpen(false);
      carregar();
    } catch {
      setErro('Erro de conexão');
    }
  }

  async function inativarTipo(id: number) {
    try {
      const res = await fetch(`/api/tipos-produtos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setErro('Erro ao inativar tipo');
        return;
      }
      setConfirmDeleteTipoId(null);
      carregar();
    } catch {
      setErro('Erro de conexão');
    }
  }

  // PRODUTOS: abrir modal de edição
  function abrirEditarProduto(p: Produto) {
    setEditProduto(p);
    setEditProdutoForm({
      nome: p.nome,
      descricao: p.descricao || '',
      preco: String(p.preco),
      tipoProdutoId: String(p.tipoProdutoId),
      codigoBarras: p.codigoBarras || '',
      estoqueAtual: String(p.estoqueAtual),
      estoqueMinimo: String(p.estoqueMinimo),
      ativo: p.ativo,
    });
    setEditProdutoOpen(true);
  }

  async function salvarProdutoEditado(e: React.FormEvent) {
    e.preventDefault();
    if (!editProduto) return;
    try {
      const body: any = {
        nome: editProdutoForm.nome,
        descricao: editProdutoForm.descricao,
        preco: Number(editProdutoForm.preco),
        tipoProdutoId: Number(editProdutoForm.tipoProdutoId),
        codigoBarras: editProdutoForm.codigoBarras || undefined,
        estoqueAtual: Number(editProdutoForm.estoqueAtual),
        estoqueMinimo: Number(editProdutoForm.estoqueMinimo),
      };
      const res = await fetch(`/api/produtos/${editProduto.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErro('Erro ao editar produto: ' + (j.error || ''));
        return;
      }
      setEditProdutoOpen(false);
      carregar();
    } catch {
      setErro('Erro de conexão');
    }
  }

  async function inativarProduto(id: number) {
    try {
      const res = await fetch(`/api/produtos/${id}`, { method: 'DELETE' });
      if (!res.ok) {
        setErro('Erro ao inativar produto');
        return;
      }
      setConfirmDeleteProdutoId(null);
      carregar();
    } catch {
      setErro('Erro de conexão');
    }
  }

  if (loading) {
    return (
      <>
        <Navbar user={user} />
        <LoadingSpinner text='Carregando produtos...' />
      </>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <div className='container py-4'>
        <div className='row mb-4'>
          <div className='col-12'>
            <div className='card dashboard-card'>
              <div className='card-body'>
                <div className='d-flex justify-content-between align-items-center'>
                  <div>
                    <h2 className='h4 mb-1 text-primary'>📦 Gestão de Produtos</h2>
                    <p className='text-muted mb-0'>
                      Gerencie produtos e tipos de produtos da cantina
                    </p>
                  </div>
                  <div className='text-end'>
                    <div className='small text-muted'>Total: {produtos.length} produtos</div>
                    <div className='small text-muted'>{tipos.length} tipos</div>
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
          {/* Tipos de Produtos */}
          <div className='col-lg-4'>
            <div className='card h-100'>
              <div className='card-header'>
                <h5 className='mb-0 d-flex align-items-center'>🏷️ Tipos de Produtos</h5>
              </div>
              <div className='card-body'>
                <div className='mb-3'>
                  {tipos.length > 0 ? (
                    <div className='list-group'>
                      {tipos.map((t) => (
                        <div
                          key={t.id}
                          className='list-group-item d-flex justify-content-between align-items-center'
                        >
                          <div>
                            <div className='fw-medium'>{t.nome}</div>
                            {t.descricao && <small className='text-muted'>{t.descricao}</small>}
                          </div>
                          <div className='d-flex align-items-center'>
                            {!t.ativo && <span className='badge bg-secondary me-2'>Inativo</span>}
                            {podeEditar && (
                              <div className='btn-group' role='group'>
                                <button
                                  type='button'
                                  className='btn btn-sm btn-outline-primary'
                                  onClick={() => abrirEditarTipo(t)}
                                >
                                  Editar
                                </button>
                                <button
                                  type='button'
                                  className='btn btn-sm btn-outline-danger'
                                  onClick={() => setConfirmDeleteTipoId(t.id)}
                                >
                                  Inativar
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className='text-center text-muted py-3'>
                      <div className='mb-2'>📭</div>
                      <div>Nenhum tipo cadastrado</div>
                    </div>
                  )}
                </div>

                {podeEditar && (
                  <div className='border-top pt-3'>
                    <h6 className='text-primary mb-3'>Novo Tipo</h6>
                    <form onSubmit={criarTipo}>
                      <div className='mb-2'>
                        <input
                          placeholder='Nome do tipo'
                          className='form-control form-control-sm'
                          value={formTipo.nome}
                          onChange={(e) => setFormTipo({ ...formTipo, nome: e.target.value })}
                          required
                        />
                      </div>
                      <div className='mb-3'>
                        <textarea
                          placeholder='Descrição (opcional)'
                          className='form-control form-control-sm'
                          rows={2}
                          value={formTipo.descricao}
                          onChange={(e) => setFormTipo({ ...formTipo, descricao: e.target.value })}
                        />
                      </div>
                      <button type='submit' className='btn btn-primary btn-sm w-100'>
                        Criar Tipo
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Produtos */}
          <div className='col-lg-8'>
            <div className='card h-100'>
              <div className='card-header'>
                <h5 className='mb-0 d-flex align-items-center'>📦 Lista de Produtos</h5>
              </div>
              <div className='card-body'>
                {produtos.length > 0 ? (
                  <div className='table-responsive'>
                    <table className='table table-striped table-hover'>
                      <thead>
                        <tr>
                          <th>Nome</th>
                          <th>Tipo</th>
                          <th>Preço</th>
                          <th>Estoque</th>
                          <th>Status</th>
                          <th>Ações</th>
                        </tr>
                      </thead>
                      <tbody>
                        {produtos.map((p) => (
                          <tr key={p.id}>
                            <td>
                              <div className='fw-medium'>{p.nome}</div>
                              {p.codigoBarras && (
                                <small className='text-muted'>Cód: {p.codigoBarras}</small>
                              )}
                            </td>
                            <td>
                              <span className='badge bg-primary'>{p.tipoProdutoNome}</span>
                            </td>
                            <td>R$ {Number(p.preco).toFixed(2)}</td>
                            <td>
                              <span
                                className={`badge ${
                                  p.estoqueAtual <= p.estoqueMinimo ? 'bg-danger' : 'bg-success'
                                }`}
                              >
                                {p.estoqueAtual}
                              </span>
                              <small className='text-muted d-block'>Mín: {p.estoqueMinimo}</small>
                            </td>
                            <td>
                              <span className={`badge ${p.ativo ? 'bg-success' : 'bg-secondary'}`}>
                                {p.ativo ? 'Ativo' : 'Inativo'}
                              </span>
                            </td>
                            <td>
                              {podeEditar && (
                                <div className='btn-group' role='group'>
                                  <button
                                    type='button'
                                    className='btn btn-sm btn-outline-primary'
                                    onClick={() => abrirEditarProduto(p)}
                                  >
                                    Editar
                                  </button>
                                  <button
                                    type='button'
                                    className='btn btn-sm btn-outline-danger'
                                    onClick={() => setConfirmDeleteProdutoId(p.id)}
                                  >
                                    Inativar
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className='text-center text-muted py-4'>
                    <div className='mb-3'>📦</div>
                    <div>Nenhum produto cadastrado</div>
                  </div>
                )}

                {podeEditar && (
                  <div className='border-top pt-4 mt-4'>
                    <h6 className='text-primary mb-3'>Novo Produto</h6>
                    <form onSubmit={criarProduto}>
                      <div className='row g-3'>
                        <div className='col-md-6'>
                          <label className='form-label'>Nome</label>
                          <input
                            type='text'
                            className='form-control'
                            placeholder='Nome do produto'
                            value={formProduto.nome}
                            onChange={(e) =>
                              setFormProduto({ ...formProduto, nome: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className='col-md-6'>
                          <label className='form-label'>Tipo</label>
                          <select
                            className='form-select'
                            value={formProduto.tipoProdutoId}
                            onChange={(e) =>
                              setFormProduto({ ...formProduto, tipoProdutoId: e.target.value })
                            }
                            required
                          >
                            <option value=''>Selecione o tipo</option>
                            {tipos
                              .filter((t) => t.ativo)
                              .map((t) => (
                                <option key={t.id} value={t.id}>
                                  {t.nome}
                                </option>
                              ))}
                          </select>
                        </div>
                        <div className='col-md-4'>
                          <label className='form-label'>Preço</label>
                          <input
                            type='number'
                            step='0.01'
                            min='0'
                            className='form-control'
                            placeholder='0.00'
                            value={formProduto.preco}
                            onChange={(e) =>
                              setFormProduto({ ...formProduto, preco: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className='col-md-4'>
                          <label className='form-label'>Estoque Atual</label>
                          <input
                            type='number'
                            min='0'
                            className='form-control'
                            value={formProduto.estoqueAtual}
                            onChange={(e) =>
                              setFormProduto({ ...formProduto, estoqueAtual: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className='col-md-4'>
                          <label className='form-label'>Estoque Mínimo</label>
                          <input
                            type='number'
                            min='0'
                            className='form-control'
                            value={formProduto.estoqueMinimo}
                            onChange={(e) =>
                              setFormProduto({ ...formProduto, estoqueMinimo: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className='col-md-6'>
                          <label className='form-label'>Código de Barras (opcional)</label>
                          <input
                            type='text'
                            className='form-control'
                            placeholder='Código de barras'
                            value={formProduto.codigoBarras}
                            onChange={(e) =>
                              setFormProduto({ ...formProduto, codigoBarras: e.target.value })
                            }
                          />
                        </div>
                        <div className='col-md-6'>
                          <label className='form-label'>Descrição (opcional)</label>
                          <input
                            type='text'
                            className='form-control'
                            placeholder='Descrição do produto'
                            value={formProduto.descricao}
                            onChange={(e) =>
                              setFormProduto({ ...formProduto, descricao: e.target.value })
                            }
                          />
                        </div>
                        <div className='col-12'>
                          <button
                            type='submit'
                            className='btn btn-primary'
                            disabled={
                              !formProduto.nome || !formProduto.tipoProdutoId || !formProduto.preco
                            }
                          >
                            Criar Produto
                          </button>
                        </div>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Modal editar tipo */}
      <Modal isOpen={editTipoOpen} onClose={() => setEditTipoOpen(false)} title='Editar Tipo'>
        <form onSubmit={salvarTipoEditado}>
          <div className='mb-2'>
            <input
              placeholder='Nome do tipo'
              className='form-control form-control-sm'
              value={editTipoForm.nome}
              onChange={(e) => setEditTipoForm({ ...editTipoForm, nome: e.target.value })}
              required
            />
          </div>
          <div className='mb-3'>
            <textarea
              placeholder='Descrição (opcional)'
              className='form-control form-control-sm'
              rows={3}
              value={editTipoForm.descricao}
              onChange={(e) => setEditTipoForm({ ...editTipoForm, descricao: e.target.value })}
            />
          </div>
          <div className='text-end'>
            <button
              type='button'
              className='btn btn-secondary me-2'
              onClick={() => setEditTipoOpen(false)}
            >
              Cancelar
            </button>
            <button type='submit' className='btn btn-primary'>
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal editar produto */}
      <Modal
        isOpen={editProdutoOpen}
        onClose={() => setEditProdutoOpen(false)}
        title='Editar Produto'
        size='lg'
      >
        <form onSubmit={salvarProdutoEditado}>
          <div className='row g-3'>
            <div className='col-md-6'>
              <label className='form-label'>Nome</label>
              <input
                type='text'
                className='form-control'
                value={editProdutoForm.nome}
                onChange={(e) => setEditProdutoForm({ ...editProdutoForm, nome: e.target.value })}
                required
              />
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Tipo</label>
              <select
                className='form-select'
                value={editProdutoForm.tipoProdutoId}
                onChange={(e) =>
                  setEditProdutoForm({ ...editProdutoForm, tipoProdutoId: e.target.value })
                }
                required
              >
                <option value=''>Selecione o tipo</option>
                {tipos
                  .filter((t) => t.ativo)
                  .map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nome}
                    </option>
                  ))}
              </select>
            </div>
            <div className='col-md-4'>
              <label className='form-label'>Preço</label>
              <input
                type='number'
                step='0.01'
                min='0'
                className='form-control'
                value={editProdutoForm.preco}
                onChange={(e) => setEditProdutoForm({ ...editProdutoForm, preco: e.target.value })}
                required
              />
            </div>
            <div className='col-md-4'>
              <label className='form-label'>Estoque Atual</label>
              <input
                type='number'
                min='0'
                className='form-control'
                value={editProdutoForm.estoqueAtual}
                onChange={(e) =>
                  setEditProdutoForm({ ...editProdutoForm, estoqueAtual: e.target.value })
                }
                required
              />
            </div>
            <div className='col-md-4'>
              <label className='form-label'>Estoque Mínimo</label>
              <input
                type='number'
                min='0'
                className='form-control'
                value={editProdutoForm.estoqueMinimo}
                onChange={(e) =>
                  setEditProdutoForm({ ...editProdutoForm, estoqueMinimo: e.target.value })
                }
                required
              />
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Código de Barras (opcional)</label>
              <input
                type='text'
                className='form-control'
                value={editProdutoForm.codigoBarras}
                onChange={(e) =>
                  setEditProdutoForm({ ...editProdutoForm, codigoBarras: e.target.value })
                }
              />
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Descrição (opcional)</label>
              <input
                type='text'
                className='form-control'
                value={editProdutoForm.descricao}
                onChange={(e) =>
                  setEditProdutoForm({ ...editProdutoForm, descricao: e.target.value })
                }
              />
            </div>
          </div>
          <div className='text-end mt-3'>
            <button
              type='button'
              className='btn btn-secondary me-2'
              onClick={() => setEditProdutoOpen(false)}
            >
              Cancelar
            </button>
            <button type='submit' className='btn btn-primary'>
              Salvar
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm modals */}
      <ConfirmModal
        isOpen={!!confirmDeleteTipoId}
        onClose={() => setConfirmDeleteTipoId(null)}
        onConfirm={() => confirmDeleteTipoId && inativarTipo(confirmDeleteTipoId)}
        title='Inativar Tipo'
        message='Tem certeza que deseja inativar este tipo de produto?'
        confirmText='Inativar'
        variant='danger'
      />

      <ConfirmModal
        isOpen={!!confirmDeleteProdutoId}
        onClose={() => setConfirmDeleteProdutoId(null)}
        onConfirm={() => confirmDeleteProdutoId && inativarProduto(confirmDeleteProdutoId)}
        title='Inativar Produto'
        message='Tem certeza que deseja inativar este produto?'
        confirmText='Inativar'
        variant='danger'
      />
    </>
  );
}
