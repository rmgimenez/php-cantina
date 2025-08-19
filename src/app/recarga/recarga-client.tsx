'use client';

import Alert from '@/components/ui/alert';
import Avatar from '@/components/ui/avatar';
import Breadcrumb from '@/components/ui/breadcrumb';
import { useState } from 'react';

export default function RecargaClient() {
  const [ra, setRa] = useState('');
  const [valor, setValor] = useState('');
  const [descricao, setDescricao] = useState('');
  const [formaPagamento, setFormaPagamento] = useState('pix');
  const [referencia, setReferencia] = useState('');
  const [alert, setAlert] = useState<{ type: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [fallbackSrc, setFallbackSrc] = useState<string | null>(null);

  const submit = async (e: any) => {
    e.preventDefault();
    if (!ra || !valor) {
      setAlert({ type: 'danger', message: 'RA e valor são obrigatórios' });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/alunos/contas/recarga', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ra,
          valor,
          descricao,
          forma_pagamento: formaPagamento,
          referencia,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setAlert({
          type: 'success',
          message: data.message || 'Recarga registrada com sucesso',
        });
        setRa('');
        setValor('');
        setDescricao('');
        setReferencia('');
      } else {
        setAlert({
          type: 'danger',
          message: data.error || 'Erro ao registrar recarga',
        });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erro de conexão' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container py-4'>
      <Breadcrumb
        items={[
          { label: 'Home', href: '/' },
          { label: 'Recarga', href: '/recarga' },
        ]}
      />

      <div className='card'>
        <div className='card-header'>
          <h5 className='card-title mb-0'>Recarga - Responsáveis</h5>
        </div>
        <div className='card-body'>
          <p className='text-muted'>
            Responsáveis podem registrar recargas de crédito aqui. As formas de pagamento (PIX,
            cartão, boleto ou dinheiro) devem ser processadas externamente; esse formulário apenas
            registra o crédito após confirmação do pagamento.
          </p>

          {alert && (
            <Alert type={alert.type as any} onClose={() => setAlert(null)}>
              {alert.message}
            </Alert>
          )}

          <form onSubmit={submit}>
            <div className='mb-3 d-flex align-items-center'>
              <div style={{ flex: 1 }}>
                <label className='form-label'>RA do Aluno *</label>
                <input
                  type='number'
                  className='form-control'
                  value={ra}
                  onChange={(e) => setRa(e.target.value)}
                  required
                />
              </div>
              <div className='ms-3'>
                {ra && (
                  <Avatar
                    src={fallbackSrc || `https://sistema.santanna.g12.br/carometr/${ra}.jpg`}
                    alt={`Foto aluno ${ra}`}
                    size={64}
                  />
                )}
              </div>
            </div>

            <div className='mb-3'>
              <label className='form-label'>Valor (R$) *</label>
              <input
                type='number'
                step='0.01'
                min='0.01'
                className='form-control'
                value={valor}
                onChange={(e) => setValor(e.target.value)}
                required
              />
            </div>

            <div className='mb-3'>
              <label className='form-label'>Forma de Pagamento</label>
              <select
                className='form-select'
                value={formaPagamento}
                onChange={(e) => setFormaPagamento(e.target.value)}
              >
                <option value='pix'>PIX</option>
                <option value='cartao'>Cartão</option>
                <option value='boleto'>Boleto</option>
                <option value='dinheiro'>Dinheiro</option>
              </select>
            </div>

            <div className='mb-3'>
              <label className='form-label'>Referência / ID do Pagamento (opcional)</label>
              <input
                type='text'
                className='form-control'
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder='Ex: TXN12345'
              />
            </div>

            <div className='mb-3'>
              <label className='form-label'>Descrição (opcional)</label>
              <input
                type='text'
                className='form-control'
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder='Ex: Recarga via PIX'
              />
            </div>

            <div className='d-flex justify-content-end gap-2'>
              <button type='submit' className='btn btn-primary' disabled={loading}>
                {loading ? 'Registrando...' : 'Registrar Recarga'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
