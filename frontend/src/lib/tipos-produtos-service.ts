import api from '../lib/axios';

export interface TipoProduto {
  id: number;
  nome: string;
  descricao?: string;
  ativo: number;
  data_criacao: string;
}

export interface CreateTipoProdutoRequest {
  nome: string;
  descricao?: string;
  ativo?: number;
}

export interface UpdateTipoProdutoRequest {
  nome?: string;
  descricao?: string;
  ativo?: number;
}

export interface ListTiposProdutosParams {
  nome?: string;
  ativo?: number;
}

export const tiposProdutosService = {
  async list(params?: ListTiposProdutosParams) {
    const response = await api.get('/tipos-produtos', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/tipos-produtos/${id}`);
    return response.data;
  },

  async create(data: CreateTipoProdutoRequest) {
    const response = await api.post('/tipos-produtos', data);
    return response.data;
  },

  async update(id: number, data: UpdateTipoProdutoRequest) {
    const response = await api.put(`/tipos-produtos/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/tipos-produtos/${id}`);
    return response.data;
  },

  async ativar(id: number) {
    const response = await api.put(`/tipos-produtos/${id}/ativar`);
    return response.data;
  },
};