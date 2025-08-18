import React from 'react';
import { Produto } from '../../hooks/use-products';

interface ProdutoCardProps {
  produto: Produto;
  onEdit: (produto: Produto) => void;
  onDelete: (id: number) => void;
  onToggleStatus: (id: number, ativo: boolean) => void;
}

const ProdutoCard: React.FC<ProdutoCardProps> = ({
  produto,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  const formatarPreco = (preco: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(preco);
  };

  const getEstoqueStatus = () => {
    if (produto.estoque_atual === 0) {
      return { class: 'danger', text: 'Sem estoque' };
    } else if (produto.estoque_atual <= produto.estoque_minimo) {
      return { class: 'warning', text: 'Estoque baixo' };
    } else {
      return { class: 'success', text: 'Estoque ok' };
    }
  };

  const estoqueStatus = getEstoqueStatus();

  return (
    <div className="col-md-6 col-lg-4 mb-3">
      <div className={`card h-100 ${!produto.ativo ? 'border-secondary' : ''}`}>
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h5 className={`card-title ${!produto.ativo ? 'text-muted' : ''}`}>
              {produto.nome}
              {!produto.ativo && (
                <span className="badge bg-secondary ms-2">Inativo</span>
              )}
            </h5>
            <div className="dropdown">
              <button
                className="btn btn-sm btn-outline-secondary"
                type="button"
                data-bs-toggle="dropdown"
              >
                <i className="bi bi-three-dots-vertical"></i>
              </button>
              <ul className="dropdown-menu">
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => onEdit(produto)}
                  >
                    <i className="bi bi-pencil me-2"></i>
                    Editar
                  </button>
                </li>
                <li>
                  <button
                    className="dropdown-item"
                    onClick={() => onToggleStatus(produto.id, produto.ativo === 1)}
                  >
                    <i className={`bi ${produto.ativo ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
                    {produto.ativo ? 'Desativar' : 'Ativar'}
                  </button>
                </li>
                <li><hr className="dropdown-divider" /></li>
                <li>
                  <button
                    className="dropdown-item text-danger"
                    onClick={() => onDelete(produto.id)}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Excluir
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="mb-2">
            <small className="text-muted">Categoria:</small>
            <div>{produto.tipo_produto_nome}</div>
          </div>

          {produto.codigo_barras && (
            <div className="mb-2">
              <small className="text-muted">Código de barras:</small>
              <div className="font-monospace">{produto.codigo_barras}</div>
            </div>
          )}

          {produto.descricao && (
            <div className="mb-2">
              <small className="text-muted">Descrição:</small>
              <div className="text-truncate" title={produto.descricao}>
                {produto.descricao}
              </div>
            </div>
          )}

          <div className="mb-2">
            <small className="text-muted">Preço:</small>
            <div className="h5 text-primary mb-0">
              {formatarPreco(produto.preco)}
            </div>
          </div>

          <div className="row">
            <div className="col-6">
              <small className="text-muted">Estoque atual:</small>
              <div className={`fw-bold text-${estoqueStatus.class}`}>
                {produto.estoque_atual}
              </div>
            </div>
            <div className="col-6">
              <small className="text-muted">Estoque mínimo:</small>
              <div>{produto.estoque_minimo}</div>
            </div>
          </div>

          <div className="mt-2">
            <span className={`badge bg-${estoqueStatus.class}`}>
              {estoqueStatus.text}
            </span>
          </div>
        </div>

        <div className="card-footer text-muted">
          <small>
            Criado em: {new Date(produto.data_criacao).toLocaleDateString('pt-BR')}
          </small>
        </div>
      </div>
    </div>
  );
};

export default ProdutoCard;