import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  useProdutos,
  useDeleteProduto,
  useAtivarProduto,
  useDesativarProduto,
  type ProdutosFiltros,
  type Produto,
} from '../../hooks/use-products';
import { useTiposProdutosAtivos } from '../../hooks/use-tipos-produtos';
import ProdutoCard from '../../components/produtos/produto-card';

const ProdutosList: React.FC = () => {
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState<ProdutosFiltros>({
    q: '',
    tipo_produto_id: undefined,
    ativo: undefined,
  });

  const perPage = 20;

  const { data, isLoading, error } = useProdutos(filtros, page, perPage);
  const { data: tiposData } = useTiposProdutosAtivos();
  const deleteMutation = useDeleteProduto();
  const ativarMutation = useAtivarProduto();
  const desativarMutation = useDesativarProduto();

  const handleEdit = (produto: Produto) => {
    // Navegar para formulário de edição
    window.location.href = `/produtos/editar/${produto.id}`;
  };

  const handleDelete = async (id: number) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('Produto excluído com sucesso!');
      } catch (error: unknown) {
        const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao excluir produto';
        alert(message);
      }
    }
  };

  const handleToggleStatus = async (id: number, ativo: boolean) => {
    try {
      if (ativo) {
        await desativarMutation.mutateAsync(id);
        alert('Produto desativado com sucesso!');
      } else {
        await ativarMutation.mutateAsync(id);
        alert('Produto ativado com sucesso!');
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string } } }).response?.data?.message || 'Erro ao alterar status';
      alert(message);
    }
  };

  const handleFiltroChange = (field: keyof ProdutosFiltros, value: string | number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
    setPage(1); // Reset para primeira página
  };

  const limparFiltros = () => {
    setFiltros({
      q: '',
      tipo_produto_id: undefined,
      ativo: undefined,
    });
    setPage(1);
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
          Erro ao carregar produtos. Tente novamente.
        </div>
      </div>
    );
  }

  const produtos = data?.data?.produtos || [];
  const pagination = data?.data?.pagination;

  const renderPaginacao = () => {
    if (!pagination || pagination.totalPages <= 1) return null;

    const pages = [];
    const maxPages = 5;
    let startPage = Math.max(1, page - Math.floor(maxPages / 2));
    const endPage = Math.min(pagination.totalPages, startPage + maxPages - 1);

    if (endPage - startPage + 1 < maxPages) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return (
      <nav aria-label="Paginação de produtos">
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
            <h1>Produtos</h1>
            <div>
              <Link to="/produtos/estoque-baixo" className="btn btn-warning me-2">
                <i className="bi bi-exclamation-triangle me-2"></i>
                Estoque Baixo
              </Link>
              <Link to="/produtos/novo" className="btn btn-primary">
                <i className="bi bi-plus-lg me-2"></i>
                Novo Produto
              </Link>
            </div>
          </div>

          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Filtros</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="filtroQ" className="form-label">Buscar</label>
                  <input
                    type="text"
                    className="form-control"
                    id="filtroQ"
                    value={filtros.q || ''}
                    onChange={(e) => handleFiltroChange('q', e.target.value)}
                    placeholder="Nome, código ou descrição..."
                  />
                </div>
                <div className="col-md-3">
                  <label htmlFor="filtroTipo" className="form-label">Categoria</label>
                  <select
                    className="form-select"
                    id="filtroTipo"
                    value={filtros.tipo_produto_id || ''}
                    onChange={(e) => handleFiltroChange('tipo_produto_id', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Todas as categorias</option>
                    {tiposData?.data?.tipos_produtos?.map(tipo => (
                      <option key={tipo.id} value={tipo.id}>
                        {tipo.nome}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <label htmlFor="filtroAtivo" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="filtroAtivo"
                    value={filtros.ativo !== undefined ? filtros.ativo.toString() : ''}
                    onChange={(e) => handleFiltroChange('ativo', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Todos</option>
                    <option value="1">Ativo</option>
                    <option value="0">Inativo</option>
                  </select>
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
              <strong>{pagination?.total || 0}</strong> produto(s) encontrado(s)
            </div>
          </div>

          {produtos.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-box2 text-muted" style={{ fontSize: '3rem' }}></i>
              <h4 className="text-muted mt-3">Nenhum produto encontrado</h4>
              <p className="text-muted">Ajuste os filtros ou adicione um novo produto</p>
            </div>
          ) : (
            <>
              <div className="row">
                {produtos.map(produto => (
                  <ProdutoCard
                    key={produto.id}
                    produto={produto}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>

              {renderPaginacao()}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProdutosList;