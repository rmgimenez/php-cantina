'use client';

import React, { useState } from 'react';

export default function RestricoesClient() {
  const [ra, setRa] = useState('');
  const [restricoes, setRestricoes] = useState<any[]>([]);
  const [produtoId, setProdutoId] = useState('');
  const [tipoProdutoId, setTipoProdutoId] = useState('');
  const [permitido, setPermitido] = useState('0');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function buscar() {
    if (!ra) return setMessage('Informe o RA do aluno');
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/restricoes?ra=${encodeURIComponent(ra)}`);
      if (!res.ok) throw new Error('Erro ao buscar restrições');
      const data = await res.json();
      setRestricoes(data);
    } catch (err: any) {
      setMessage(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function criar(e: React.FormEvent) {
    e.preventDefault();
    if (!ra) return setMessage('Informe o RA');
    setLoading(true);
    setMessage('');
    try {
      const payload: any = { ra: ra, permitido: permitido === '1' };
      if (produtoId) {
        payload.tipo = 'produto';
        payload.produtoId = Number(produtoId);
      } else if (tipoProdutoId) {
        payload.tipo = 'tipo_produto';
        payload.tipoProdutoId = Number(tipoProdutoId);
      } else {
        payload.tipo = 'produto';
      }
      const res = await fetch('/api/restricoes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      setMessage('Restrição criada');
      setProdutoId('');
      setTipoProdutoId('');
      await buscar();
    } catch (err: any) {
      setMessage(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function remover(id: number) {
    if (!confirm('Deseja inativar essa restrição?')) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch(`/api/restricoes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error(await res.text());
      setMessage('Restrição inativada');
      await buscar();
    } catch (err: any) {
      setMessage(err.message || String(err));
    } finally {
      setLoading(false);
    }
  }

  async function abrirObservacoes(raAluno: string) {
    // abre nova janela com o caixa modal? por enquanto abre uma rota que retorna o histórico JSON
    const res = await fetch(`/api/vendas?action=observacoesFull&ra=${encodeURIComponent(raAluno)}`);
    if (!res.ok) {
      alert('Erro ao carregar observações');
      return;
    }
    const data = await res.json();
    alert(JSON.stringify(data, null, 2));
  }

  return (
    <div className='card p-3'>
      <form className='row g-2 align-items-end' onSubmit={(e) => e.preventDefault()}>
        <div className='col-auto'>
          <label className='form-label'>RA</label>
          <input className='form-control' value={ra} onChange={(e) => setRa(e.target.value)} />
        </div>
        <div className='col-auto'>
          <button type='button' className='btn btn-primary' onClick={buscar} disabled={loading}>
            Buscar
          </button>
        </div>
        <div className='col-12 mt-2'>
          <small className='text-muted'>Mensagem: {message}</small>
        </div>
      </form>

      <hr />

      <form onSubmit={criar} className='row g-2'>
        <div className='col-md-3'>
          <label className='form-label'>Produto (ID)</label>
          <input
            className='form-control'
            value={produtoId}
            onChange={(e) => setProdutoId(e.target.value)}
          />
        </div>
        <div className='col-md-3'>
          <label className='form-label'>Tipo Produto (ID)</label>
          <input
            className='form-control'
            value={tipoProdutoId}
            onChange={(e) => setTipoProdutoId(e.target.value)}
          />
        </div>
        <div className='col-md-2'>
          <label className='form-label'>Permitido?</label>
          <select
            className='form-select'
            value={permitido}
            onChange={(e) => setPermitido(e.target.value)}
          >
            <option value='0'>Não</option>
            <option value='1'>Sim</option>
          </select>
        </div>
        <div className='col-md-2 align-self-end'>
          <button className='btn btn-success' disabled={loading}>
            Criar
          </button>
        </div>
      </form>

      <hr />

      <h5>Restrições</h5>
      <div>
        {restricoes.length === 0 && <div className='text-muted'>Nenhuma restrição encontrada</div>}
        {restricoes.map((r) => (
          <div
            key={r.id}
            className='d-flex justify-content-between align-items-center border p-2 mb-2'
          >
            <div>
              <div>Id: {r.id}</div>
              <div>Produto: {r.produto_id}</div>
              <div>TipoProduto: {r.tipo_produto_id}</div>
              <div>Permitido: {r.permitido ? 'Sim' : 'Não'}</div>
            </div>
            <div>
              <button
                className='btn btn-sm btn-danger me-2'
                onClick={() => remover(r.id)}
                disabled={loading}
              >
                Inativar
              </button>
              <button
                className='btn btn-sm btn-secondary'
                onClick={() => abrirObservacoes(r.ra_aluno)}
              >
                Observações
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
