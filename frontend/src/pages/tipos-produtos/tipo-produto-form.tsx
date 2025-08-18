import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTipoProduto, useCreateTipoProduto, useUpdateTipoProduto } from '../../hooks/use-tipos-produtos';
import type { TipoProdutoInput } from '../../hooks/use-tipos-produtos';

const TipoProdutoForm: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;

  const [formData, setFormData] = useState<TipoProdutoInput>({
    nome: '',
    descricao: '',
    ativo: 1,
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Hooks para operações
  const { data: tipoProdutoData, isLoading: isLoadingTipo } = useTipoProduto(Number(id));
  const createMutation = useCreateTipoProduto();
  const updateMutation = useUpdateTipoProduto();

  // Carrega dados do tipo para edição
  useEffect(() => {
    if (isEdit && tipoProdutoData?.data) {
      const tipo = tipoProdutoData.data;
      setFormData({
        nome: tipo.nome,
        descricao: tipo.descricao || '',
        ativo: tipo.ativo,
      });
    }
  }, [isEdit, tipoProdutoData]);

  const handleInputChange = (field: keyof TipoProdutoInput, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));

    // Remove erro do campo quando o usuário digita
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.nome.trim()) {
      newErrors.nome = 'O nome é obrigatório';
    } else if (formData.nome.length < 2) {
      newErrors.nome = 'O nome deve ter pelo menos 2 caracteres';
    } else if (formData.nome.length > 100) {
      newErrors.nome = 'O nome não pode ter mais de 100 caracteres';
    }

    if (formData.descricao && formData.descricao.length > 1000) {
      newErrors.descricao = 'A descrição não pode ter mais de 1000 caracteres';
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
      if (isEdit) {
        await updateMutation.mutateAsync({ id: Number(id), tipoProduto: formData });
        alert('Tipo de produto atualizado com sucesso!');
      } else {
        await createMutation.mutateAsync(formData);
        alert('Tipo de produto criado com sucesso!');
      }
      navigate('/tipos-produtos');
    } catch (error: any) {
      if (error.response?.data?.errors) {
        // Erros de validação do backend
        setErrors(error.response.data.errors);
      } else {
        const message = error.response?.data?.message || 'Erro ao salvar tipo de produto';
        alert(message);
      }
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  if (isEdit && isLoadingTipo) {
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

  if (isEdit && tipoProdutoData && !tipoProdutoData.success) {
    return (
      <div className="container mt-4">
        <div className="alert alert-danger" role="alert">
          Tipo de produto não encontrado.
          <Link to="/tipos-produtos" className="btn btn-primary ms-3">
            Voltar à lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4">
      <div className="row">
        <div className="col-12 col-md-8 col-lg-6 mx-auto">
          <div className="card">
            <div className="card-header">
              <h3 className="mb-0">
                {isEdit ? 'Editar Tipo de Produto' : 'Novo Tipo de Produto'}
              </h3>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label htmlFor="nome" className="form-label">
                    Nome <span className="text-danger">*</span>
                  </label>
                  <input
                    type="text"
                    className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                    id="nome"
                    value={formData.nome}
                    onChange={(e) => handleInputChange('nome', e.target.value)}
                    placeholder="Digite o nome do tipo"
                    maxLength={100}
                  />
                  {errors.nome && (
                    <div className="invalid-feedback">
                      {errors.nome}
                    </div>
                  )}
                  <div className="form-text">
                    {formData.nome.length}/100 caracteres
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="descricao" className="form-label">
                    Descrição
                  </label>
                  <textarea
                    className={`form-control ${errors.descricao ? 'is-invalid' : ''}`}
                    id="descricao"
                    rows={3}
                    value={formData.descricao}
                    onChange={(e) => handleInputChange('descricao', e.target.value)}
                    placeholder="Digite uma descrição (opcional)"
                    maxLength={1000}
                  />
                  {errors.descricao && (
                    <div className="invalid-feedback">
                      {errors.descricao}
                    </div>
                  )}
                  <div className="form-text">
                    {formData.descricao ? formData.descricao.length : 0}/1000 caracteres
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="ativo" className="form-label">
                    Status
                  </label>
                  <select
                    className="form-select"
                    id="ativo"
                    value={formData.ativo}
                    onChange={(e) => handleInputChange('ativo', Number(e.target.value))}
                  >
                    <option value={1}>Ativo</option>
                    <option value={0}>Inativo</option>
                  </select>
                </div>

                <div className="d-flex justify-content-between">
                  <Link
                    to="/tipos-produtos"
                    className="btn btn-secondary"
                  >
                    Cancelar
                  </Link>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        {isEdit ? 'Atualizando...' : 'Criando...'}
                      </>
                    ) : (
                      isEdit ? 'Atualizar' : 'Criar'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Preview */}
          {(formData.nome || formData.descricao) && (
            <div className="card mt-4">
              <div className="card-header">
                <h5 className="mb-0">Preview</h5>
              </div>
              <div className="card-body">
                <h6>{formData.nome || 'Nome do tipo'}</h6>
                <p className="text-muted mb-1">
                  {formData.descricao || 'Sem descrição'}
                </p>
                <span className={`badge ${formData.ativo ? 'bg-success' : 'bg-secondary'}`}>
                  {formData.ativo ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TipoProdutoForm;