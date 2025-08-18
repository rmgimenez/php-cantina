'use client';
import React, { useEffect, useState } from 'react';

type User = { username: string; role: string };
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
      setErro('Falha ao carregar');
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
        setErro('Erro ao criar tipo');
        return;
      }
      setFormTipo({ nome: '', descricao: '' });
      carregar();
    } catch {
      setErro('Erro de rede');
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
      setErro('Erro de rede');
    }
  }

  return (
    <div className='container py-4'>
      <div className='d-flex justify-content-between align-items-center mb-3'>
        <h2 className='mb-0'>Produtos</h2>
        <a href='/dashboard' className='btn btn-outline-secondary btn-sm'>
          Voltar
        </a>
      </div>
      {erro && <div className='alert alert-danger py-2'>{erro}</div>}
      {loading && <div>Carregando...</div>}
      <div className='row g-4'>
        <div className='col-md-4'>
          <div className='card h-100'>
            <div className='card-body'>
              <h5 className='card-title'>Tipos de Produtos</h5>
              <ul className='list-group small mb-3'>
                {tipos.map((t) => (
                  <li
                    key={t.id}
                    className='list-group-item d-flex justify-content-between align-items-center'
                  >
                    <span>{t.nome}</span>
                    {!t.ativo && <span className='badge text-bg-secondary'>Inativo</span>}
                  </li>
                ))}
                {!tipos.length && <li className='list-group-item'>Nenhum tipo</li>}
              </ul>
              {podeEditar && (
                <form onSubmit={criarTipo} className='small'>
                  <div className='mb-2'>
                    <input
                      placeholder='Nome'
                      className='form-control form-control-sm'
                      value={formTipo.nome}
                      onChange={(e) => setFormTipo({ ...formTipo, nome: e.target.value })}
                    />
                  </div>
                  <div className='mb-2'>
                    <input
                      placeholder='Descrição'
                      className='form-control form-control-sm'
                      value={formTipo.descricao}
                      onChange={(e) => setFormTipo({ ...formTipo, descricao: e.target.value })}
                    />
                  </div>
                  <button className='btn btn-primary btn-sm w-100' disabled={!formTipo.nome}>
                    Adicionar Tipo
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
        <div className='col-md-8'>
          <div className='card mb-3'>
            <div className='card-body'>
              <h5 className='card-title'>Novo Produto</h5>
              {podeEditar ? (
                <form onSubmit={criarProduto} className='row g-2 small'>
                  <div className='col-md-4'>
                    <input
                      placeholder='Nome'
                      className='form-control form-control-sm'
                      value={formProduto.nome}
                      onChange={(e) => setFormProduto({ ...formProduto, nome: e.target.value })}
                    />
                  </div>
                  <div className='col-md-4'>
                    <input
                      placeholder='Código Barras'
                      className='form-control form-control-sm'
                      value={formProduto.codigoBarras}
                      onChange={(e) =>
                        setFormProduto({ ...formProduto, codigoBarras: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-4'>
                    <select
                      className='form-select form-select-sm'
                      value={formProduto.tipoProdutoId}
                      onChange={(e) =>
                        setFormProduto({ ...formProduto, tipoProdutoId: e.target.value })
                      }
                    >
                      <option value=''>Tipo...</option>
                      {tipos.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='col-md-3'>
                    <input
                      placeholder='Preço'
                      className='form-control form-control-sm'
                      value={formProduto.preco}
                      onChange={(e) => setFormProduto({ ...formProduto, preco: e.target.value })}
                    />
                  </div>
                  <div className='col-md-3'>
                    <input
                      placeholder='Estoque'
                      className='form-control form-control-sm'
                      value={formProduto.estoqueAtual}
                      onChange={(e) =>
                        setFormProduto({ ...formProduto, estoqueAtual: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-3'>
                    <input
                      placeholder='Estoque Mínimo'
                      className='form-control form-control-sm'
                      value={formProduto.estoqueMinimo}
                      onChange={(e) =>
                        setFormProduto({ ...formProduto, estoqueMinimo: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-md-3'>
                    <input
                      placeholder='Descrição'
                      className='form-control form-control-sm'
                      value={formProduto.descricao}
                      onChange={(e) =>
                        setFormProduto({ ...formProduto, descricao: e.target.value })
                      }
                    />
                  </div>
                  <div className='col-12'>
                    <button
                      className='btn btn-success btn-sm'
                      disabled={
                        !formProduto.nome || !formProduto.tipoProdutoId || !formProduto.preco
                      }
                    >
                      Salvar Produto
                    </button>
                  </div>
                </form>
              ) : (
                <div className='alert alert-secondary py-2 small mb-0'>
                  Sem permissão para cadastrar (necessário estoquista ou administrador).
                </div>
              )}
            </div>
          </div>
          <div className='card'>
            <div className='card-body'>
              <h5 className='card-title'>Lista de Produtos</h5>
              <div className='table-responsive small'>
                <table className='table table-sm table-striped mb-0'>
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>Tipo</th>
                      <th>Preço</th>
                      <th>Estoque</th>
                      <th>Min</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nome}</td>
                        <td>{p.tipoProdutoNome}</td>
                        <td>{p.preco}</td>
                        <td>{p.estoqueAtual}</td>
                        <td>{p.estoqueMinimo}</td>
                        <td>{p.ativo ? 'Ativo' : 'Inativo'}</td>
                      </tr>
                    ))}
                    {!produtos.length && (
                      <tr>
                        <td colSpan={6}>Nenhum produto</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
