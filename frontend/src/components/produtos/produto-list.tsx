import React, { useState, useEffect } from 'react';
import { produtosService, Produto } from '../../lib/produtos-service';
import { tiposProdutosService, TipoProduto } from '../../lib/tipos-produtos-service';

interface ProdutoListProps {
  onEdit?: (produto: Produto) => void;
}

export function ProdutoList({ onEdit }: ProdutoListProps) {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [tiposProdutos, setTiposProdutos] = useState<TipoProduto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [filtros, setFiltros] = useState({
    nome: '',
    tipo_produto_id: '',
    ativo: '1',
  });

  useEffect(() => {
    carregarDados();
  }, []);

  useEffect(() => {
    carregarProdutos();
  }, [filtros]);

  async function carregarDados() {
    try {
      setLoading(true);
      
      // Carregar tipos de produtos
      const tiposResponse = await tiposProdutosService.list({ ativo: 1 });
      if (tiposResponse.status === 'success') {
        setTiposProdutos(tiposResponse.data || []);
      }

      // Carregar produtos
      await carregarProdutos();
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }

  async function carregarProdutos() {
    try {
      const params: any = {};
      
      if (filtros.nome.trim()) {
        params.nome = filtros.nome.trim();
      }
      
      if (filtros.tipo_produto_id) {
        params.tipo_produto_id = parseInt(filtros.tipo_produto_id);
      }
      
      if (filtros.ativo !== '') {
        params.ativo = parseInt(filtros.ativo);
      }

      const response = await produtosService.list(params);
      if (response.status === 'success') {
        setProdutos(response.data || []);
      }
    } catch (err: any) {
      console.error('Erro ao carregar produtos:', err);
      setError('Erro ao carregar produtos');
    }
  }

  function handleFiltroChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { name, value } = e.target;
    setFiltros(prev => ({ ...prev, [name]: value }));
  }

  async function handleDelete(id: number) {
    if (!confirm('Tem certeza que deseja remover este produto?')) {
      return;
    }

    try {
      const response = await produtosService.delete(id);
      if (response.status === 'success') {
        await carregarProdutos();
      } else {
        alert(response.message || 'Erro ao remover produto');
      }
    } catch (err: any) {
      console.error('Erro ao remover produto:', err);
      alert('Erro ao remover produto');
    }
  }

  async function handleAtivar(id: number) {
    try {
      const response = await produtosService.ativar(id);
      if (response.status === 'success') {
        await carregarProdutos();
      } else {
        alert(response.message || 'Erro ao ativar produto');
      }
    } catch (err: any) {
      console.error('Erro ao ativar produto:', err);
      alert('Erro ao ativar produto');
    }
  }

  function formatarPreco(preco: number): string {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(preco);
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem' }}>
        <p>Carregando produtos...</p>
      </div>
    );
  }

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Lista de Produtos</h2>

      {error && (
        <div style={{ 
          color: 'red', 
          backgroundColor: '#ffebee', 
          padding: '0.75rem', 
          marginBottom: '1rem',
          borderRadius: '4px',
          border: '1px solid #ffcdd2'
        }} role="alert">
          {error}
        </div>
      )}

      {/* Filtros */}
      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginBottom: '1rem', 
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        flexWrap: 'wrap'
      }}>
        <input
          name="nome"
          type="text"
          placeholder="Filtrar por nome..."
          value={filtros.nome}
          onChange={handleFiltroChange}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px', minWidth: '200px' }}
        />
        
        <select
          name="tipo_produto_id"
          value={filtros.tipo_produto_id}
          onChange={handleFiltroChange}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Todos os tipos</option>
          {tiposProdutos.map((tipo) => (
            <option key={tipo.id} value={tipo.id}>
              {tipo.nome}
            </option>
          ))}
        </select>

        <select
          name="ativo"
          value={filtros.ativo}
          onChange={handleFiltroChange}
          style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
        >
          <option value="">Todos</option>
          <option value="1">Ativos</option>
          <option value="0">Inativos</option>
        </select>
      </div>

      {/* Lista de produtos */}
      {produtos.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Nenhum produto encontrado</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8f9fa' }}>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>Nome</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>Tipo</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'left' }}>Código de Barras</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'right' }}>Preço</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>Estoque</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>Status</th>
                <th style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto) => (
                <tr key={produto.id}>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    <div>
                      <strong>{produto.nome}</strong>
                      {produto.descricao && (
                        <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
                          {produto.descricao}
                        </div>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {produto.tipo_nome}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd' }}>
                    {produto.codigo_barras || '-'}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'right' }}>
                    {formatarPreco(produto.preco)}
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    <div>
                      <span style={{ 
                        color: produto.estoque_atual <= produto.estoque_minimo ? 'red' : 'inherit' 
                      }}>
                        {produto.estoque_atual}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: '#666' }}>
                        Mín: {produto.estoque_minimo}
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '0.25rem 0.5rem',
                      borderRadius: '4px',
                      fontSize: '0.75rem',
                      backgroundColor: produto.ativo ? '#d4edda' : '#f8d7da',
                      color: produto.ativo ? '#155724' : '#721c24'
                    }}>
                      {produto.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem', border: '1px solid #ddd', textAlign: 'center' }}>
                    <div style={{ display: 'flex', gap: '0.25rem', justifyContent: 'center' }}>
                      {onEdit && (
                        <button
                          onClick={() => onEdit(produto)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            backgroundColor: '#007bff',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Editar
                        </button>
                      )}
                      
                      {produto.ativo ? (
                        <button
                          onClick={() => handleDelete(produto.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            backgroundColor: '#dc3545',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Remover
                        </button>
                      ) : (
                        <button
                          onClick={() => handleAtivar(produto.id)}
                          style={{
                            padding: '0.25rem 0.5rem',
                            fontSize: '0.75rem',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer'
                          }}
                        >
                          Ativar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}