import React, { useState } from 'react';
import { useRegistrarEntrada, type EntradaEstoqueInput } from '../../hooks/use-estoque';
import { useProdutos } from '../../hooks/use-products';

interface EntradaFormProps {
  produtoId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EntradaForm: React.FC<EntradaFormProps> = ({
  produtoId,
  onSuccess,
  onCancel,
}) => {
  const [formData, setFormData] = useState<EntradaEstoqueInput>({
    produto_id: produtoId || 0,
    quantidade: 0,
    motivo: '',
    funcionario_cantina_id: 1, // TODO: Pegar do contexto de autenticação
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const { data: produtosData } = useProdutos({}, 1, 100); // Buscar produtos para seleção
  const registrarMutation = useRegistrarEntrada();

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

    if (!formData.produto_id) {
      newErrors.produto_id = 'Produto é obrigatório';
    }

    if (formData.quantidade <= 0) {
      newErrors.quantidade = 'Quantidade deve ser maior que zero';
    }

    if (!formData.motivo.trim()) {
      newErrors.motivo = 'Motivo é obrigatório';
    } else if (formData.motivo.length < 3) {
      newErrors.motivo = 'Motivo deve ter pelo menos 3 caracteres';
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
      await registrarMutation.mutateAsync(formData);
      alert('Entrada de estoque registrada com sucesso!');
      
      // Reset form
      setFormData({
        produto_id: produtoId || 0,
        quantidade: 0,
        motivo: '',
        funcionario_cantina_id: 1,
      });

      if (onSuccess) {
        onSuccess();
      }
    } catch (error: unknown) {
      const message = (error as { response?: { data?: { message?: string; errors?: Record<string, string> } } }).response?.data?.message || 'Erro ao registrar entrada';
      alert(message);
      
      // Se houver erros de validação do backend
      const errors = (error as { response?: { data?: { errors?: Record<string, string> } } }).response?.data?.errors;
      if (errors) {
        setErrors(errors);
      }
    }
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
  };

  const isSubmitting = registrarMutation.isPending;
  const produtos = produtosData?.data?.produtos || [];

  return (
    <div className="card">
      <div className="card-header">
        <h5 className="mb-0">
          <i className="bi bi-box-arrow-in-down me-2"></i>
          Entrada de Estoque
        </h5>
      </div>
      <div className="card-body">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label htmlFor="produto_id" className="form-label">
              Produto <span className="text-danger">*</span>
            </label>
            {produtoId ? (
              <input
                type="text"
                className="form-control"
                value={produtos.find(p => p.id === produtoId)?.nome || 'Carregando...'}
                readOnly
              />
            ) : (
              <select
                className={`form-select ${errors.produto_id ? 'is-invalid' : ''}`}
                id="produto_id"
                name="produto_id"
                value={formData.produto_id}
                onChange={handleChange}
                required
              >
                <option value="">Selecione um produto</option>
                {produtos.map(produto => (
                  <option key={produto.id} value={produto.id}>
                    {produto.nome} - Estoque atual: {produto.estoque_atual}
                  </option>
                ))}
              </select>
            )}
            {errors.produto_id && (
              <div className="invalid-feedback">{errors.produto_id}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="quantidade" className="form-label">
              Quantidade <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="1"
              className={`form-control ${errors.quantidade ? 'is-invalid' : ''}`}
              id="quantidade"
              name="quantidade"
              value={formData.quantidade}
              onChange={handleChange}
              required
            />
            {errors.quantidade && (
              <div className="invalid-feedback">{errors.quantidade}</div>
            )}
          </div>

          <div className="mb-3">
            <label htmlFor="motivo" className="form-label">
              Motivo <span className="text-danger">*</span>
            </label>
            <textarea
              className={`form-control ${errors.motivo ? 'is-invalid' : ''}`}
              id="motivo"
              name="motivo"
              rows={3}
              value={formData.motivo}
              onChange={handleChange}
              placeholder="Descreva o motivo da entrada (ex: Compra, Doação, etc.)"
              required
            />
            {errors.motivo && (
              <div className="invalid-feedback">{errors.motivo}</div>
            )}
          </div>

          <div className="d-flex justify-content-end gap-2">
            {onCancel && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              className="btn btn-success"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Registrando...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>
                  Registrar Entrada
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EntradaForm;