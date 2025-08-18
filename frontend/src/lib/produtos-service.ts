import api from '../lib/axios';

export interface Produto {
  id: number;
  codigo_barras?: string;
  nome: string;
  descricao?: string;
  tipo_produto_id: number;
  tipo_nome: string;
  preco: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: number;
  data_criacao: string;
  data_atualizacao: string;
}

export interface CreateProdutoRequest {
  codigo_barras?: string;
  nome: string;
  descricao?: string;
  tipo_produto_id: number;
  preco: number;
  estoque_atual?: number;
  estoque_minimo?: number;
  ativo?: number;
}

export interface UpdateProdutoRequest {
  codigo_barras?: string;
  nome?: string;
  descricao?: string;
  tipo_produto_id?: number;
  preco?: number;
  estoque_atual?: number;
  estoque_minimo?: number;
  ativo?: number;
}

export interface ListProdutosParams {
  nome?: string;
  tipo_produto_id?: number;
  codigo_barras?: string;
  ativo?: number;
}

export const produtosService = {
  async list(params?: ListProdutosParams) {
    const response = await api.get('/produtos', { params });
    return response.data;
  },

  async getById(id: number) {
    const response = await api.get(`/produtos/${id}`);
    return response.data;
  },

  async create(data: CreateProdutoRequest) {
    const response = await api.post('/produtos', data);
    return response.data;
  },

  async update(id: number, data: UpdateProdutoRequest) {
    const response = await api.put(`/produtos/${id}`, data);
    return response.data;
  },

  async delete(id: number) {
    const response = await api.delete(`/produtos/${id}`);
    return response.data;
  },

  async ativar(id: number) {
    const response = await api.put(`/produtos/${id}/ativar`);
    return response.data;
  },

  async getEstoqueBaixo() {
    const response = await api.get('/produtos/estoque-baixo');
    return response.data;
  },

  async getByCodigoBarras(codigoBarras: string) {
    const response = await api.get(`/produtos/codigo-barras/${codigoBarras}`);
    return response.data;
  },
};