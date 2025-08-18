import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useRelatorioEstoque,
  useRegistrarAjuste,
  type AjusteEstoqueInput,
} from '../../hooks/use-estoque';
import { useProdutosEstoqueBaixo } from '../../hooks/use-products';
import EntradaForm from '../../components/estoque/entrada-form';

const EstoqueControl: React.FC = () => {
  const [showEntradaForm, setShowEntradaForm] = useState(false);
  const [showAjusteForm, setShowAjusteForm] = useState(false);
  const [selectedProdutoId, setSelectedProdutoId] = useState<number | undefined>();

  const [ajusteData, setAjusteData] = useState<AjusteEstoqueInput>({
    produto_id: 0,
    quantidade: 0,
    motivo: '',
    funcionario_cantina_id: 1, // TODO: Pegar do contexto de autenticação
  });

  const { data: relatorioData, isLoading } = useRelatorioEstoque();
  const { data: estoqueBaixoData } = useProdutosEstoqueBaixo();
  const ajusteMutation = useRegistrarAjuste();

  const handleEntradaSuccess = () => {
    setShowEntradaForm(false);
    setSelectedProdutoId(undefined);
  };

  const handleEntradaRapida = (produtoId: number) => {
    setSelectedProdutoId(produtoId);
    setShowEntradaForm(true);
  };

  const handleAjusteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await ajusteMutation.mutateAsync(ajusteData);
      alert('Ajuste de estoque registrado com sucesso!');
      setShowAjusteForm(false);
      setAjusteData({
        produto_id: 0,
        quantidade: 0,
        motivo: '',
        funcionario_cantina_id: 1,
      });
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao registrar ajuste';
      alert(message);
    }
  };

  if (isLoading) {
    return (
      <div className="container mt-4">
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  const relatorio = relatorioData?.data;
  const produtosEstoqueBaixo = estoqueBaixoData?.data?.produtos || [];

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(valor);
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Controle de Estoque</h1>
            <div>
              <Link to="/estoque/historico" className="btn btn-outline-primary me-2">
                <i className="bi bi-clock-history me-2"></i>
                Histórico
              </Link>
              <button
                className="btn btn-success me-2"
                onClick={() => setShowEntradaForm(true)}
              >
                <i className="bi bi-box-arrow-in-down me-2"></i>
                Entrada
              </button>
              <button
                className="btn btn-warning"
                onClick={() => setShowAjusteForm(true)}
              >
                <i className="bi bi-gear me-2"></i>
                Ajuste
              </button>
            </div>
          </div>

          {/* Resumo do Estoque */}
          {relatorio && (
            <div className="row mb-4">
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-box2 text-primary" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title mt-2">{relatorio.resumo.total_produtos}</h5>
                    <p className="card-text text-muted">Total de Produtos</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title mt-2">{relatorio.resumo.produtos_estoque_baixo}</h5>
                    <p className="card-text text-muted">Estoque Baixo</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-x-circle text-danger" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title mt-2">{relatorio.resumo.produtos_zerados}</h5>
                    <p className="card-text text-muted">Sem Estoque</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="card text-center">
                  <div className="card-body">
                    <i className="bi bi-cash text-success" style={{ fontSize: '2rem' }}></i>
                    <h5 className="card-title mt-2">
                      {formatarMoeda(relatorio.resumo.valor_total_estoque)}
                    </h5>
                    <p className="card-text text-muted">Valor Total</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Produtos com Estoque Baixo */}
          {produtosEstoqueBaixo.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                  Produtos com Estoque Baixo
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Categoria</th>
                        <th>Estoque Atual</th>
                        <th>Estoque Mínimo</th>
                        <th>Repor</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {produtosEstoqueBaixo.map(produto => (
                        <tr key={produto.id}>
                          <td>
                            <strong>{produto.nome}</strong>
                          </td>
                          <td>{produto.tipo_produto_nome}</td>
                          <td>
                            <span className="badge bg-warning">
                              {produto.estoque_atual}
                            </span>
                          </td>
                          <td>{produto.estoque_minimo}</td>
                          <td>
                            <span className="badge bg-danger">
                              {produto.quantidade_repor}
                            </span>
                          </td>
                          <td>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => handleEntradaRapida(produto.id)}
                            >
                              <i className="bi bi-plus-lg"></i>
                              Entrada
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Últimas Movimentações */}
          {relatorio && relatorio.ultimas_movimentacoes.length > 0 && (
            <div className="card mb-4">
              <div className="card-header">
                <h5 className="mb-0">
                  <i className="bi bi-clock-history me-2"></i>
                  Últimas Movimentações
                </h5>
              </div>
              <div className="card-body">
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Data</th>
                        <th>Produto</th>
                        <th>Tipo</th>
                        <th>Quantidade</th>
                        <th>Funcionário</th>
                      </tr>
                    </thead>
                    <tbody>
                      {relatorio.ultimas_movimentacoes.map(mov => (
                        <tr key={mov.id}>
                          <td>
                            {new Date(mov.data_movimentacao).toLocaleString('pt-BR')}
                          </td>
                          <td>{mov.produto_nome}</td>
                          <td>
                            <span className={`badge ${
                              mov.tipo_movimentacao === 'entrada' ? 'bg-success' :
                              mov.tipo_movimentacao === 'saida' ? 'bg-danger' : 'bg-warning'
                            }`}>
                              {mov.tipo_movimentacao}
                            </span>
                          </td>
                          <td>
                            {mov.tipo_movimentacao === 'entrada' ? '+' : ''}
                            {mov.quantidade}
                          </td>
                          <td>{mov.funcionario_nome}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="text-center mt-3">
                  <Link to="/estoque/historico" className="btn btn-outline-primary">
                    Ver Histórico Completo
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Formulário de Entrada */}
          {showEntradaForm && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog modal-lg">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Entrada de Estoque</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => {
                        setShowEntradaForm(false);
                        setSelectedProdutoId(undefined);
                      }}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <EntradaForm
                      produtoId={selectedProdutoId}
                      onSuccess={handleEntradaSuccess}
                      onCancel={() => {
                        setShowEntradaForm(false);
                        setSelectedProdutoId(undefined);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Formulário de Ajuste */}
          {showAjusteForm && (
            <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
              <div className="modal-dialog">
                <div className="modal-content">
                  <div className="modal-header">
                    <h5 className="modal-title">Ajuste de Estoque</h5>
                    <button
                      type="button"
                      className="btn-close"
                      onClick={() => setShowAjusteForm(false)}
                    ></button>
                  </div>
                  <div className="modal-body">
                    <form onSubmit={handleAjusteSubmit}>
                      <div className="mb-3">
                        <label className="form-label">Produto</label>
                        <select
                          className="form-select"
                          value={ajusteData.produto_id}
                          onChange={(e) => setAjusteData(prev => ({
                            ...prev,
                            produto_id: Number(e.target.value)
                          }))}
                          required
                        >
                          <option value="">Selecione um produto</option>
                          {relatorio?.produtos_estoque_baixo.map(produto => (
                            <option key={produto.id} value={produto.id}>
                              {produto.nome} - Estoque: {produto.estoque_atual}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="mb-3">
                        <label className="form-label">
                          Quantidade (use + para aumentar, - para diminuir)
                        </label>
                        <input
                          type="number"
                          className="form-control"
                          value={ajusteData.quantidade}
                          onChange={(e) => setAjusteData(prev => ({
                            ...prev,
                            quantidade: Number(e.target.value)
                          }))}
                          required
                        />
                      </div>
                      <div className="mb-3">
                        <label className="form-label">Motivo</label>
                        <textarea
                          className="form-control"
                          rows={3}
                          value={ajusteData.motivo}
                          onChange={(e) => setAjusteData(prev => ({
                            ...prev,
                            motivo: e.target.value
                          }))}
                          required
                        />
                      </div>
                      <div className="d-flex justify-content-end gap-2">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setShowAjusteForm(false)}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-warning">
                          Registrar Ajuste
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstoqueControl;