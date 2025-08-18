import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useMovimentacoesEstoque,
  type EstoqueFiltros,
} from '../../hooks/use-estoque';
import { useProdutos } from '../../hooks/use-products';

const EstoqueHistorico: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<EstoqueFiltros>({
    tipo_movimentacao: undefined,
    data_inicio: '',
    data_fim: '',
    produto_id: undefined,
  });

  const perPage = 20;

  const { data, isLoading, error } = useMovimentacoesEstoque(filtros, page, perPage);
  const { data: produtosData } = useProdutos({}, 1, 100); // Para seleção no filtro

  const handleFiltroChange = (field: keyof EstoqueFiltros, value: string | number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
    setPage(1); // Reset para primeira página
  };

  const limparFiltros = () => {
    setFiltros({
      tipo_movimentacao: undefined,
      data_inicio: '',
      data_fim: '',
      produto_id: undefined,
    });
    setPage(1);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString('pt-BR');
  };

  const getTipoColor = (tipo: string) => {
    switch (tipo) {
      case 'entrada':
        return 'success';
      case 'saida':
        return 'danger';
      case 'ajuste':
        return 'warning';
      default:
        return 'secondary';
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

  if (error) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Erro ao carregar histórico de movimentações. Tente novamente.
        </div>
      </div>
    );
  }

  const movimentacoes = data?.data?.movimentacoes || [];
  const pagination = data?.data?.pagination;
  const produtos = produtosData?.data?.produtos || [];

  const renderPaginacao = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, page - Math.floor(maxPages / 2));
    let endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav aria-label="Paginação do histórico">
        <ul className="pagination justify-content-center">
          <li className={`page-item ${page === 1 ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              Anterior
            </button>
          </li>
          
          {pages.map(pageNum => (
            <li key={pageNum} className={`page-item ${page === pageNum ? 'active' : ''}`}>
              <button
                className="page-link"
                onClick={() => setPage(pageNum)}
              >
                {pageNum}
              </button>
            </li>
          ))}
          
          <li className={`page-item ${page === pagination.totalPages ? 'disabled' : ''}`}>
            <button
              className="page-link"
              onClick={() => setPage(page + 1)}
              disabled={page === pagination.totalPages}
            >
              Próximo
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Histórico de Movimentações</h1>
            <Link to="/estoque" className="btn btn-outline-primary">
              <i className="bi bi-arrow-left me-2"></i>
              Voltar ao Controle
            </Link>
          </div>

          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Filtros</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-3">
                  <label htmlFor="filtroTipo" className="form-label">Tipo de Movimentação</label>
                  <select
                    className="form-select"
                    id="filtroTipo"
                    value={filtros.tipo_movimentacao || ''}
                    onChange={(e) => handleFiltroChange('tipo_movimentacao', e.target.value as any)}
                  >
                    <option value="">Todos os tipos</option>
                    <option value="entrada">Entrada</option>
                    <option value="saida">Saída</option>
                    <option value="ajuste">Ajuste</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="filtroProduto" className="form-label">Produto</label>
                  <select
                    className="form-select"
                    id="filtroProduto"
                    value={filtros.produto_id || ''}
                    onChange={(e) => handleFiltroChange('produto_id', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Todos os produtos</option>
                    {produtos.map(produto => (
                      <option key={produto.id} value={produto.id}>
                        {produto.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-2">
                  <label htmlFor="filtroDataInicio" className="form-label">Data Início</label>
                  <input
                    type="date"
                    className="form-control"
                    id="filtroDataInicio"
                    value={filtros.data_inicio || ''}
                    onChange={(e) => handleFiltroChange('data_inicio', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
                  <label htmlFor="filtroDataFim" className="form-label">Data Fim</label>
                  <input
                    type="date"
                    className="form-control"
                    id="filtroDataFim"
                    value={filtros.data_fim || ''}
                    onChange={(e) => handleFiltroChange('data_fim', e.target.value)}
                  />
                </div>
                <div className="col-md-2 d-flex align-items-end">
                  <button
                    type="button"
                    className="btn btn-outline-secondary w-100"
                    onClick={limparFiltros}
                  >
                    Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Resultados */}
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <strong>{pagination?.total || 0}</strong> movimentação(ões) encontrada(s)
            </div>
          </div>

          {movimentacoes.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-clock-history text-muted" style={{ fontSize: '3rem' }}></i>
              <h4 className="text-muted mt-3">Nenhuma movimentação encontrada</h4>
              <p className="text-muted">Ajuste os filtros ou registre novas movimentações</p>
            </div>
          ) : (
            <>
              <div className="card">
                <div className="card-body p-0">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th>Data/Hora</th>
                          <th>Produto</th>
                          <th>Tipo</th>
                          <th>Quantidade</th>
                          <th>Estoque Anterior</th>
                          <th>Estoque Atual</th>
                          <th>Motivo</th>
                          <th>Funcionário</th>
                        </tr>
                      </thead>
                      <tbody>
                        {movimentacoes.map(movimentacao => (
                          <tr key={movimentacao.id}>
                            <td>
                              <small>{formatarData(movimentacao.data_movimentacao)}</small>
                            </td>
                            <td>
                              <strong>{movimentacao.produto_nome}</strong>
                            </td>
                            <td>
                              <span className={`badge bg-${getTipoColor(movimentacao.tipo_movimentacao)}`}>
                                {movimentacao.tipo_movimentacao}
                              </span>
                            </td>
                            <td>
                              <span className={`fw-bold ${
                                movimentacao.tipo_movimentacao === 'entrada' || 
                                (movimentacao.tipo_movimentacao === 'ajuste' && movimentacao.quantidade > 0) 
                                  ? 'text-success' : 'text-danger'
                              }`}>
                                {movimentacao.tipo_movimentacao === 'entrada' || 
                                 (movimentacao.tipo_movimentacao === 'ajuste' && movimentacao.quantidade > 0) 
                                   ? '+' : ''}
                                {movimentacao.quantidade}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-light text-dark">
                                {movimentacao.estoque_anterior}
                              </span>
                            </td>
                            <td>
                              <span className="badge bg-primary">
                                {movimentacao.estoque_atual}
                              </span>
                            </td>
                            <td>
                              <small className="text-muted">
                                {movimentacao.motivo || '-'}
                              </small>
                            </td>
                            <td>
                              <small>{movimentacao.funcionario_nome}</small>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="mt-4">
                {renderPaginacao()}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default EstoqueHistorico;