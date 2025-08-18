'use client';

import { useEffect, useState } from 'react';
import { FaEdit, FaHistory, FaPlus, FaSearch } from 'react-icons/fa';
import Alert from '../../components/ui/alert';
import Loading from '../../components/ui/loading';
import Modal from '../../components/ui/modal';

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
  dataCriacao: string;
  dataAtualizacao: string;
};

type EstoqueHistorico = {
  id: number;
  produtoId: number;
  tipoMovimentacao: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  estoqueAnterior: number;
  estoqueAtual: number;
  motivo?: string | null;
  vendaId?: number | null;
  funcionarioCantinaId: number;
  dataMovimentacao: string;
};

type MovimentacaoForm = {
  tipo: 'entrada' | 'saida' | 'ajuste';
  produtoId: number;
  quantidade: number;
  motivo: string;
};

export default function EstoqueClient() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [historico, setHistorico] = useState<EstoqueHistorico[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<{ type: 'success' | 'danger'; message: string } | null>(null);
  const [modalMovimentacao, setModalMovimentacao] = useState(false);
  const [modalHistorico, setModalHistorico] = useState(false);
  const [produtoSelecionado, setProdutoSelecionado] = useState<Produto | null>(null);
  const [filtroNome, setFiltroNome] = useState('');
  const [filtroEstoqueBaixo, setFiltroEstoqueBaixo] = useState(false);
  const [movimentacaoForm, setMovimentacaoForm] = useState<MovimentacaoForm>({
    tipo: 'entrada',
    produtoId: 0,
    quantidade: 0,
    motivo: '',
  });

  const carregarProdutos = async () => {
    try {
      const response = await fetch('/api/produtos');
      if (response.ok) {
        const data = await response.json();
        setProdutos(data.data || []);
      } else {
        setAlert({ type: 'danger', message: 'Erro ao carregar produtos' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erro ao carregar produtos' });
    }
  };

  const carregarHistorico = async (produtoId?: number) => {
    try {
      const url = produtoId ? `/api/estoque?produtoId=${produtoId}` : '/api/estoque';
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setHistorico(data.data || []);
      } else {
        setAlert({ type: 'danger', message: 'Erro ao carregar histórico' });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erro ao carregar histórico' });
    }
  };

  useEffect(() => {
    const inicializar = async () => {
      setLoading(true);
      await Promise.all([carregarProdutos(), carregarHistorico()]);
      setLoading(false);
    };
    inicializar();
  }, []);

  const handleMovimentacao = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/estoque', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(movimentacaoForm),
      });

      if (response.ok) {
        setAlert({ type: 'success', message: 'Movimentação registrada com sucesso!' });
        setModalMovimentacao(false);
        setMovimentacaoForm({
          tipo: 'entrada',
          produtoId: 0,
          quantidade: 0,
          motivo: '',
        });
        await carregarProdutos();
        await carregarHistorico();
      } else {
        const data = await response.json();
        let errorMessage = 'Erro ao registrar movimentação';

        if (data.error === 'insufficient_stock') {
          errorMessage = 'Estoque insuficiente para esta operação';
        } else if (data.error === 'not_found') {
          errorMessage = 'Produto não encontrado';
        } else if (data.error === 'quantidade_invalid') {
          errorMessage = 'Quantidade inválida';
        } else if (data.error === 'estoque_negative') {
          errorMessage = 'O estoque não pode ser negativo';
        }

        setAlert({ type: 'danger', message: errorMessage });
      }
    } catch (error) {
      setAlert({ type: 'danger', message: 'Erro ao registrar movimentação' });
    }
  };

  const abrirModalMovimentacao = (produto?: Produto) => {
    if (produto) {
      setMovimentacaoForm((prev) => ({ ...prev, produtoId: produto.id }));
    }
    setModalMovimentacao(true);
  };

  const abrirModalHistorico = async (produto?: Produto) => {
    setProdutoSelecionado(produto || null);
    await carregarHistorico(produto?.id);
    setModalHistorico(true);
  };

  const produtosFiltrados = produtos.filter((produto) => {
    const nomeMatch = produto.nome.toLowerCase().includes(filtroNome.toLowerCase());
    const estoqueBaixoMatch = !filtroEstoqueBaixo || produto.estoqueAtual <= produto.estoqueMinimo;
    return nomeMatch && estoqueBaixoMatch;
  });

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const formatarPreco = (preco: string) => {
    return parseFloat(preco).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const getStatusEstoque = (atual: number, minimo: number) => {
    if (atual === 0) return { class: 'bg-danger', text: 'Sem estoque' };
    if (atual <= minimo) return { class: 'bg-warning', text: 'Estoque baixo' };
    return { class: 'bg-success', text: 'Normal' };
  };

  const getTipoMovimentacaoClass = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'text-success';
      case 'saida':
        return 'text-danger';
      case 'ajuste':
        return 'text-warning';
      default:
        return '';
    }
  };

  const getTipoMovimentacaoIcon = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return '↗️';
      case 'saida':
        return '↘️';
      case 'ajuste':
        return '🔧';
      default:
        return '';
    }
  };

  if (loading) return <Loading />;

  return (
    <div className='container-fluid py-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h1 className='h3 mb-0' style={{ color: '#253287' }}>
          <FaEdit className='me-2' />
          Controle de Estoque
        </h1>
        <div className='d-flex gap-2'>
          <button className='btn btn-outline-primary' onClick={() => abrirModalHistorico()}>
            <FaHistory className='me-1' />
            Histórico Geral
          </button>
          <button
            className='btn btn-primary'
            onClick={() => abrirModalMovimentacao()}
            style={{ backgroundColor: '#253287', borderColor: '#253287' }}
          >
            <FaPlus className='me-1' />
            Nova Movimentação
          </button>
        </div>
      </div>

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Filtros */}
      <div className='card mb-4'>
        <div className='card-body'>
          <div className='row g-3'>
            <div className='col-md-6'>
              <label className='form-label'>Buscar produto</label>
              <div className='input-group'>
                <span className='input-group-text'>
                  <FaSearch />
                </span>
                <input
                  type='text'
                  className='form-control'
                  placeholder='Digite o nome do produto...'
                  value={filtroNome}
                  onChange={(e) => setFiltroNome(e.target.value)}
                />
              </div>
            </div>
            <div className='col-md-6 d-flex align-items-end'>
              <div className='form-check'>
                <input
                  className='form-check-input'
                  type='checkbox'
                  id='filtroEstoqueBaixo'
                  checked={filtroEstoqueBaixo}
                  onChange={(e) => setFiltroEstoqueBaixo(e.target.checked)}
                />
                <label className='form-check-label' htmlFor='filtroEstoqueBaixo'>
                  Mostrar apenas produtos com estoque baixo
                </label>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Produtos */}
      <div className='card'>
        <div className='card-header'>
          <h5 className='mb-0'>Produtos em Estoque ({produtosFiltrados.length})</h5>
        </div>
        <div className='card-body p-0'>
          <div className='table-responsive'>
            <table className='table table-hover mb-0'>
              <thead className='table-light'>
                <tr>
                  <th>Produto</th>
                  <th>Tipo</th>
                  <th>Preço</th>
                  <th>Estoque Atual</th>
                  <th>Estoque Mínimo</th>
                  <th>Status</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {produtosFiltrados.length === 0 ? (
                  <tr>
                    <td colSpan={7} className='text-center py-4'>
                      Nenhum produto encontrado
                    </td>
                  </tr>
                ) : (
                  produtosFiltrados.map((produto) => {
                    const status = getStatusEstoque(produto.estoqueAtual, produto.estoqueMinimo);
                    return (
                      <tr key={produto.id}>
                        <td>
                          <div>
                            <strong>{produto.nome}</strong>
                            {produto.codigoBarras && (
                              <small className='d-block text-muted'>
                                Código: {produto.codigoBarras}
                              </small>
                            )}
                          </div>
                        </td>
                        <td>{produto.tipoProdutoNome}</td>
                        <td>{formatarPreco(produto.preco)}</td>
                        <td>
                          <span className={`badge ${status.class} text-white`}>
                            {produto.estoqueAtual}
                          </span>
                        </td>
                        <td>{produto.estoqueMinimo}</td>
                        <td>
                          <span className={`badge ${status.class} text-white`}>{status.text}</span>
                        </td>
                        <td>
                          <div className='btn-group btn-group-sm'>
                            <button
                              className='btn btn-outline-primary'
                              onClick={() => abrirModalMovimentacao(produto)}
                              title='Nova Movimentação'
                            >
                              <FaPlus />
                            </button>
                            <button
                              className='btn btn-outline-secondary'
                              onClick={() => abrirModalHistorico(produto)}
                              title='Ver Histórico'
                            >
                              <FaHistory />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Nova Movimentação */}
      <Modal
        isOpen={modalMovimentacao}
        onClose={() => setModalMovimentacao(false)}
        title='Nova Movimentação de Estoque'
        size='lg'
      >
        <form onSubmit={handleMovimentacao}>
          <div className='row g-3'>
            <div className='col-md-6'>
              <label className='form-label'>Tipo de Movimentação</label>
              <select
                className='form-select'
                value={movimentacaoForm.tipo}
                onChange={(e) =>
                  setMovimentacaoForm((prev) => ({
                    ...prev,
                    tipo: e.target.value as 'entrada' | 'saida' | 'ajuste',
                  }))
                }
                required
              >
                <option value='entrada'>Entrada</option>
                <option value='saida'>Saída</option>
                <option value='ajuste'>Ajuste</option>
              </select>
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Produto</label>
              <select
                className='form-select'
                value={movimentacaoForm.produtoId}
                onChange={(e) =>
                  setMovimentacaoForm((prev) => ({
                    ...prev,
                    produtoId: Number(e.target.value),
                  }))
                }
                required
              >
                <option value={0}>Selecione um produto</option>
                {produtos.map((produto) => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} (Estoque: {produto.estoqueAtual})
                  </option>
                ))}
              </select>
            </div>
            <div className='col-md-6'>
              <label className='form-label'>
                {movimentacaoForm.tipo === 'ajuste' ? 'Novo Estoque' : 'Quantidade'}
              </label>
              <input
                type='number'
                className='form-control'
                min='0'
                step='1'
                value={movimentacaoForm.quantidade}
                onChange={(e) =>
                  setMovimentacaoForm((prev) => ({
                    ...prev,
                    quantidade: Number(e.target.value),
                  }))
                }
                required
              />
            </div>
            <div className='col-md-6'>
              <label className='form-label'>Motivo</label>
              <input
                type='text'
                className='form-control'
                placeholder='Descreva o motivo da movimentação'
                value={movimentacaoForm.motivo}
                onChange={(e) =>
                  setMovimentacaoForm((prev) => ({
                    ...prev,
                    motivo: e.target.value,
                  }))
                }
              />
            </div>
          </div>
          <div className='d-flex justify-content-end gap-2 mt-4'>
            <button
              type='button'
              className='btn btn-secondary'
              onClick={() => setModalMovimentacao(false)}
            >
              Cancelar
            </button>
            <button
              type='submit'
              className='btn btn-primary'
              style={{ backgroundColor: '#253287', borderColor: '#253287' }}
            >
              Registrar Movimentação
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal Histórico */}
      <Modal
        isOpen={modalHistorico}
        onClose={() => setModalHistorico(false)}
        title={
          produtoSelecionado
            ? `Histórico - ${produtoSelecionado.nome}`
            : 'Histórico de Movimentações'
        }
        size='xl'
      >
        <div className='table-responsive'>
          <table className='table table-sm'>
            <thead className='table-light'>
              <tr>
                <th>Data</th>
                <th>Tipo</th>
                <th>Produto</th>
                <th>Quantidade</th>
                <th>Estoque Anterior</th>
                <th>Estoque Atual</th>
                <th>Motivo</th>
              </tr>
            </thead>
            <tbody>
              {historico.length === 0 ? (
                <tr>
                  <td colSpan={7} className='text-center py-3'>
                    Nenhuma movimentação encontrada
                  </td>
                </tr>
              ) : (
                historico.map((item) => {
                  const produto = produtos.find((p) => p.id === item.produtoId);
                  return (
                    <tr key={item.id}>
                      <td>{formatarData(item.dataMovimentacao)}</td>
                      <td>
                        <span className={getTipoMovimentacaoClass(item.tipoMovimentacao)}>
                          {getTipoMovimentacaoIcon(item.tipoMovimentacao)} {item.tipoMovimentacao}
                        </span>
                      </td>
                      <td>{produto?.nome || `ID: ${item.produtoId}`}</td>
                      <td>{item.quantidade}</td>
                      <td>{item.estoqueAnterior}</td>
                      <td>{item.estoqueAtual}</td>
                      <td>{item.motivo || '-'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Modal>
    </div>
  );
}
