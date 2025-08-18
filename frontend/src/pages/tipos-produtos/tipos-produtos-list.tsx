import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTiposProdutos, useDeleteTipoProduto, useAtivarTipoProduto, useDesativarTipoProduto } from '../../hooks/use-tipos-produtos';
import type { TipoProduto } from '../../hooks/use-tipos-produtos';

const TiposProdutosList: React.FC = () => {
  const [filtros, setFiltros] = useState({
    nome: '',
    descricao: '',
    ativo: undefined as number | undefined,
  });

  const { data, isLoading, error } = useTiposProdutos(filtros);
  const deleteMutation = useDeleteTipoProduto();
  const ativarMutation = useAtivarTipoProduto();
  const desativarMutation = useDesativarTipoProduto();

  const handleDelete = async (id: number, nome: string) => {
    if (window.confirm(`Tem certeza que deseja excluir o tipo "${nome}"?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('Tipo de produto excluído com sucesso!');
      } catch (error: any) {
        const message = error.response?.data?.message || 'Erro ao excluir tipo de produto';
        alert(message);
      }
    }
  };

  const handleToggleStatus = async (id: number, ativo: boolean) => {
    try {
      if (ativo) {
        await desativarMutation.mutateAsync(id);
        alert('Tipo de produto desativado com sucesso!');
      } else {
        await ativarMutation.mutateAsync(id);
        alert('Tipo de produto ativado com sucesso!');
      }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Erro ao alterar status';
      alert(message);
    }
  };

  const handleFiltroChange = (field: string, value: string | number | undefined) => {
    setFiltros(prev => ({
      ...prev,
      [field]: value === '' ? undefined : value,
    }));
  };

  const limparFiltros = () => {
    setFiltros({
      nome: '',
      descricao: '',
      ativo: undefined,
    });
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
          Erro ao carregar tipos de produtos. Tente novamente.
        </div>
      </div>
    );
  }

  const tiposProdutos = data?.data?.tipos_produtos || [];
  const total = data?.data?.total || 0;

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h1>Categorias de Produtos</h1>
            <Link to="/tipos-produtos/novo" className="btn btn-primary">
              Novo Tipo
            </Link>
          </div>

          {/* Filtros */}
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Filtros</h5>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-4">
                  <label htmlFor="filtroNome" className="form-label">Nome</label>
                  <input
                    type="text"
                    className="form-control"
                    id="filtroNome"
                    value={filtros.nome}
                    onChange={(e) => handleFiltroChange('nome', e.target.value)}
                    placeholder="Digite o nome..."
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="filtroDescricao" className="form-label">Descrição</label>
                  <input
                    type="text"
                    className="form-control"
                    id="filtroDescricao"
                    value={filtros.descricao}
                    onChange={(e) => handleFiltroChange('descricao', e.target.value)}
                    placeholder="Digite a descrição..."
                  />
                </div>
                <div className="col-md-4">
                  <label htmlFor="filtroAtivo" className="form-label">Status</label>
                  <select
                    className="form-select"
                    id="filtroAtivo"
                    value={filtros.ativo || ''}
                    onChange={(e) => handleFiltroChange('ativo', e.target.value ? Number(e.target.value) : undefined)}
                  >
                    <option value="">Todos</option>
                    <option value="1">Ativo</option>
                    <option value="0">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="row mt-3">
                <div className="col-12">
                  <button
                    type="button"
                    className="btn btn-secondary me-2"
                    onClick={limparFiltros}
                  >
                    Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Resultado */}
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                Resultados ({total} {total === 1 ? 'tipo' : 'tipos'})
              </h5>
            </div>
            <div className="card-body">
              {tiposProdutos.length === 0 ? (
                <div className="text-center py-4">
                  <p className="mb-0">Nenhum tipo de produto encontrado.</p>
                  <Link to="/tipos-produtos/novo" className="btn btn-primary mt-3">
                    Criar primeiro tipo
                  </Link>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Nome</th>
                        <th>Descrição</th>
                        <th>Status</th>
                        <th>Data Criação</th>
                        <th>Ações</th>
                      </tr>
                    </thead>
                    <tbody>
                      {tiposProdutos.map((tipo: TipoProduto) => (
                        <tr key={tipo.id}>
                          <td>{tipo.id}</td>
                          <td>
                            <strong>{tipo.nome}</strong>
                          </td>
                          <td>
                            {tipo.descricao ? (
                              <span title={tipo.descricao}>
                                {tipo.descricao.length > 50
                                  ? `${tipo.descricao.substring(0, 50)}...`
                                  : tipo.descricao
                                }
                              </span>
                            ) : (
                              <span className="text-muted">Sem descrição</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${tipo.ativo ? 'bg-success' : 'bg-secondary'}`}>
                              {tipo.ativo ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td>
                            {new Date(tipo.data_criacao).toLocaleDateString('pt-BR')}
                          </td>
                          <td>
                            <div className="btn-group" role="group">
                              <Link
                                to={`/tipos-produtos/${tipo.id}/editar`}
                                className="btn btn-sm btn-outline-primary"
                                title="Editar"
                              >
                                Editar
                              </Link>
                              <button
                                type="button"
                                className={`btn btn-sm ${tipo.ativo ? 'btn-outline-warning' : 'btn-outline-success'}`}
                                onClick={() => handleToggleStatus(tipo.id, !!tipo.ativo)}
                                title={tipo.ativo ? 'Desativar' : 'Ativar'}
                                disabled={ativarMutation.isPending || desativarMutation.isPending}
                              >
                                {tipo.ativo ? 'Desativar' : 'Ativar'}
                              </button>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleDelete(tipo.id, tipo.nome)}
                                title="Excluir"
                                disabled={deleteMutation.isPending}
                              >
                                Excluir
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TiposProdutosList;