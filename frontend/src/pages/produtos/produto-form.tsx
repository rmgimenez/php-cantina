import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  useCreateProduto,
  useUpdateProduto,
  useProduto,
  type ProdutoInput,
} from '../../hooks/use-products';
import { useTiposProdutosAtivos } from '../../hooks/use-tipos-produtos';

const ProdutoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState<ProdutoInput>({
    nome: '',
    descricao: '',
    tipo_produto_id: 0,
    preco: 0,
    estoque_atual: 0,
    estoque_minimo: 0,
    codigo_barras: '',
    ativo: 1,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: tiposData } = useTiposProdutosAtivos();
  const { data: produtoData, isLoading: isLoadingProduto } = useProduto(
    isEditing ? Number(id) : 0
  );
  const createMutation = useCreateProduto();
  const updateMutation = useUpdateProduto();

  useEffect(() => {
    if (isEditing && produtoData?.data) {
      const produto = produtoData.data;
      setFormData({
        nome: produto.nome,
        descricao: produto.descricao || '',
        tipo_produto_id: produto.tipo_produto_id,
        preco: produto.preco,
        estoque_atual: produto.estoque_atual,
        estoque_minimo: produto.estoque_minimo,
        codigo_barras: produto.codigo_barras || '',
        ativo: produto.ativo,
      });
    }
  }, [isEditing, produtoData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    let processedValue: string | number = value;
    
    if (type === 'number') {
      processedValue = value === '' ? 0 : Number(value);
    }

    setFormData(prev => ({
      ...prev,
      [name]: processedValue,
    }));

    // Limpar erro do campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome é obrigatório';
    } else if (formData.nome.length < 2) {
      newErrors.nome = 'Nome deve ter pelo menos 2 caracteres';
    }

    if (!formData.tipo_produto_id) {
      newErrors.tipo_produto_id = 'Categoria é obrigatória';
    }

    if (formData.preco < 0) {
      newErrors.preco = 'Preço deve ser maior ou igual a zero';
    }

    if (formData.estoque_atual < 0) {
      newErrors.estoque_atual = 'Estoque atual deve ser maior ou igual a zero';
    }

    if (formData.estoque_minimo < 0) {
      newErrors.estoque_minimo = 'Estoque mínimo deve ser maior ou igual a zero';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      if (isEditing) {
        await updateMutation.mutateAsync({
          id: Number(id),
          produto: formData,
        });
        alert('Produto atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync(formData);
        alert('Produto criado com sucesso!');
      }
      navigate('/produtos');
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string; errors?: Record<string, string> } } }).response?.data?.message || 'Erro ao salvar produto';
      alert(message);
      
      // Se houver erros de validação do backend
      const errors = (error as { response?: { data?: { errors?: Record<string, string> } } }).response?.data?.errors;
      if (errors) {
        setErrors(errors);
      }
    }
  };

  const handleCancel = () => {
    navigate('/produtos');
  };

  if (isEditing && isLoadingProduto) {
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

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="container mt-4">
      <div className="row justify-content-center">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h4 className="mb-0">
                {isEditing ? 'Editar Produto' : 'Novo Produto'}
              </h4>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-8">
                    <div className="mb-3">
                      <label htmlFor="nome" className="form-label">
                        Nome <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                        id="nome"
                        name="nome"
                        value={formData.nome}
                        onChange={handleChange}
                        required
                      />
                      {errors.nome && (
                        <div className="invalid-feedback">{errors.nome}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="mb-3">
                      <label htmlFor="codigo_barras" className="form-label">
                        Código de Barras
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.codigo_barras ? 'is-invalid' : ''}`}
                        id="codigo_barras"
                        name="codigo_barras"
                        value={formData.codigo_barras}
                        onChange={handleChange}
                      />
                      {errors.codigo_barras && (
                        <div className="invalid-feedback">{errors.codigo_barras}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="tipo_produto_id" className="form-label">
                        Categoria <span className="text-danger">*</span>
                      </label>
                      <select
                        className={`form-select ${errors.tipo_produto_id ? 'is-invalid' : ''}`}
                        id="tipo_produto_id"
                        name="tipo_produto_id"
                        value={formData.tipo_produto_id}
                        onChange={handleChange}
                        required
                      >
                        <option value="">Selecione uma categoria</option>
                        {tiposData?.data?.tipos_produtos?.map(tipo => (
                          <option key={tipo.id} value={tipo.id}>
                            {tipo.nome}
                          </option>
                        ))}
                      </select>
                      {errors.tipo_produto_id && (
                        <div className="invalid-feedback">{errors.tipo_produto_id}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="preco" className="form-label">
                        Preço (R$) <span className="text-danger">*</span>
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        className={`form-control ${errors.preco ? 'is-invalid' : ''}`}
                        id="preco"
                        name="preco"
                        value={formData.preco}
                        onChange={handleChange}
                        required
                      />
                      {errors.preco && (
                        <div className="invalid-feedback">{errors.preco}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="estoque_atual" className="form-label">
                        Estoque Atual
                      </label>
                      <input
                        type="number"
                        min="0"
                        className={`form-control ${errors.estoque_atual ? 'is-invalid' : ''}`}
                        id="estoque_atual"
                        name="estoque_atual"
                        value={formData.estoque_atual}
                        onChange={handleChange}
                      />
                      {errors.estoque_atual && (
                        <div className="invalid-feedback">{errors.estoque_atual}</div>
                      )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="mb-3">
                      <label htmlFor="estoque_minimo" className="form-label">
                        Estoque Mínimo
                      </label>
                      <input
                        type="number"
                        min="0"
                        className={`form-control ${errors.estoque_minimo ? 'is-invalid' : ''}`}
                        id="estoque_minimo"
                        name="estoque_minimo"
                        value={formData.estoque_minimo}
                        onChange={handleChange}
                      />
                      {errors.estoque_minimo && (
                        <div className="invalid-feedback">{errors.estoque_minimo}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="descricao" className="form-label">
                    Descrição
                  </label>
                  <textarea
                    className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                    id="descricao"
                    name="descricao"
                    rows={3}
                    value={formData.descricao}
                    onChange={handleChange}
                  />
                  {errors.descricao && (
                    <div className="invalid-feedback">{errors.descricao}</div>
                  )}
                </div>

                {isEditing && (
                  <div className="mb-3">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="ativo"
                        name="ativo"
                        checked={formData.ativo === 1}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          ativo: e.target.checked ? 1 : 0,
                        }))}
                      />
                      <label className="form-check-label" htmlFor="ativo">
                        Produto ativo
                      </label>
                    </div>
                  </div>
                )}

                <div className="d-flex justify-content-end gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCancel}
                    disabled={isSubmitting}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Salvando...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-2"></i>
                        {isEditing ? 'Atualizar' : 'Criar'} Produto
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProdutoForm;