import React, { useState } from 'react';

interface CreateProdutoRequest {
  codigo_barras?: string;
  nome: string;
  descricao?: string;
  tipo_produto_id: number;
  preco: number;
  estoque_atual?: number;
  estoque_minimo?: number;
  ativo?: number;
}

interface TipoProduto {
  id: number;
  nome: string;
  descricao?: string;
  ativo: number;
  data_criacao: string;
}

interface ProdutoFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProdutoForm({ onSuccess, onCancel }: ProdutoFormProps) {
  const [form, setForm] = useState<CreateProdutoRequest>({
    nome: '',
    descricao: '',
    tipo_produto_id: 0,
    preco: 0,
    estoque_atual: 0,
    estoque_minimo: 0,
    codigo_barras: '',
  });

  const [tiposProdutos] = useState<TipoProduto[]>([
    { id: 1, nome: 'Salgados', ativo: 1, data_criacao: '2024-01-01' },
    { id: 2, nome: 'Doces', ativo: 1, data_criacao: '2024-01-01' },
    { id: 3, nome: 'Bebidas', ativo: 1, data_criacao: '2024-01-01' },
  ]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { name, value, type } = e.target;
    
    let finalValue: any = value;
    
    if (type === 'number') {
      finalValue = value === '' ? 0 : Number(value);
    }
    
    setForm(prev => ({ ...prev, [name]: finalValue }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    // Validações básicas
    if (!form.nome.trim()) {
      setError('Nome do produto é obrigatório');
      return;
    }

    if (!form.tipo_produto_id) {
      setError('Tipo de produto é obrigatório');
      return;
    }

    if (form.preco <= 0) {
      setError('Preço deve ser maior que zero');
      return;
    }

    setLoading(true);

    try {
      // Simulação de criação de produto
      console.log('Criando produto:', form);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (onSuccess) {
        onSuccess();
      }
      
      // Reset form
      setForm({
        nome: '',
        descricao: '',
        tipo_produto_id: 0,
        preco: 0,
        estoque_atual: 0,
        estoque_minimo: 0,
        codigo_barras: '',
      });

      alert('Produto cadastrado com sucesso!');
    } catch (err: any) {
      console.error('Erro ao cadastrar produto:', err);
      setError('Erro ao cadastrar produto');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '1rem' }}>
      <h2>Cadastro de Produto</h2>
      
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

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          
          {/* Nome */}
          <label style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ marginBottom: '0.25rem' }}>Nome do Produto *</span>
            <input
              name="nome"
              type="text"
              value={form.nome}
              onChange={handleChange}
              placeholder="Digite o nome do produto"
              required
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </label>

          {/* Tipo de Produto */}
          <label style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ marginBottom: '0.25rem' }}>Tipo de Produto *</span>
            <select
              name="tipo_produto_id"
              value={form.tipo_produto_id}
              onChange={handleChange}
              required
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            >
              <option value={0}>Selecione um tipo</option>
              {tiposProdutos.map((tipo) => (
                <option key={tipo.id} value={tipo.id}>
                  {tipo.nome}
                </option>
              ))}
            </select>
          </label>

          {/* Código de Barras */}
          <label style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ marginBottom: '0.25rem' }}>Código de Barras</span>
            <input
              name="codigo_barras"
              type="text"
              value={form.codigo_barras}
              onChange={handleChange}
              placeholder="Digite o código de barras (opcional)"
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </label>

          {/* Preço */}
          <label style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ marginBottom: '0.25rem' }}>Preço (R$) *</span>
            <input
              name="preco"
              type="number"
              min="0"
              step="0.01"
              value={form.preco}
              onChange={handleChange}
              placeholder="0,00"
              required
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </label>

          {/* Estoque Atual */}
          <label style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ marginBottom: '0.25rem' }}>Estoque Atual</span>
            <input
              name="estoque_atual"
              type="number"
              min="0"
              value={form.estoque_atual}
              onChange={handleChange}
              placeholder="0"
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </label>

          {/* Estoque Mínimo */}
          <label style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ marginBottom: '0.25rem' }}>Estoque Mínimo</span>
            <input
              name="estoque_minimo"
              type="number"
              min="0"
              value={form.estoque_minimo}
              onChange={handleChange}
              placeholder="0"
              style={{ padding: '0.5rem', border: '1px solid #ccc', borderRadius: '4px' }}
            />
          </label>

          {/* Descrição */}
          <label style={{ display: 'flex', flexDirection: 'column', textAlign: 'left' }}>
            <span style={{ marginBottom: '0.25rem' }}>Descrição</span>
            <textarea
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Descrição do produto (opcional)"
              rows={3}
              style={{ 
                padding: '0.5rem', 
                border: '1px solid #ccc', 
                borderRadius: '4px',
                resize: 'vertical'
              }}
            />
          </label>

          {/* Botões */}
          <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                style={{
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#6c757d',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancelar
              </button>
            )}
            
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              {loading ? 'Cadastrando...' : 'Cadastrar Produto'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}