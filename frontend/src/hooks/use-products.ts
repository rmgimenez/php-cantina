import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Types
export interface Produto {
  id: number;
  codigo_barras?: string;
  nome: string;
  descricao?: string;
  tipo_produto_id: number;
  tipo_produto_nome: string;
  preco: number;
  estoque_atual: number;
  estoque_minimo: number;
  ativo: number;
  data_criacao: string;
  data_atualizacao: string;
}

export interface ProdutoInput {
  codigo_barras?: string;
  nome: string;
  descricao?: string;
  tipo_produto_id: number;
  preco: number;
  estoque_atual?: number;
  estoque_minimo?: number;
  ativo?: number;
}

export interface ProdutosFiltros {
  q?: string;
  tipo_produto_id?: number;
  ativo?: number;
}

export interface ProdutosResponse {
  success: boolean;
  message: string;
  data: {
    produtos: Produto[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface ProdutoResponse {
  success: boolean;
  message: string;
  data: Produto;
}

export interface ProdutosEstoqueBaixoResponse {
  success: boolean;
  message: string;
  data: {
    produtos: (Produto & { quantidade_repor: number })[];
    total: number;
  };
}

// Hook para buscar produtos com paginação e filtros
export const useProdutos = (filtros?: ProdutosFiltros, page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['produtos', filtros, page, perPage],
    queryFn: async (): Promise<ProdutosResponse> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('perPage', perPage.toString());
      
      if (filtros?.q) params.append('q', filtros.q);
      if (filtros?.tipo_produto_id) params.append('tipo_produto_id', filtros.tipo_produto_id.toString());
      if (filtros?.ativo !== undefined) params.append('ativo', filtros.ativo.toString());

      const { data } = await api.get(`/produtos?${params.toString()}`);
      return data;
    },
  });
};

// Hook para buscar produto específico
export const useProduto = (id: number) => {
  return useQuery({
    queryKey: ['produto', id],
    queryFn: async (): Promise<ProdutoResponse> => {
      const { data } = await api.get(`/produtos/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Hook para buscar produtos com estoque baixo
export const useProdutosEstoqueBaixo = () => {
  return useQuery({
    queryKey: ['produtos-estoque-baixo'],
    queryFn: async (): Promise<ProdutosEstoqueBaixoResponse> => {
      const { data } = await api.get('/produtos/estoque-baixo');
      return data;
    },
  });
};

// Hook para criar produto
export const useCreateProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (produto: ProdutoInput): Promise<ProdutoResponse> => {
      const { data } = await api.post('/produtos', produto);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos-estoque-baixo'] });
    },
  });
};

// Hook para atualizar produto
export const useUpdateProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, produto }: { id: number; produto: ProdutoInput }): Promise<ProdutoResponse> => {
      const { data } = await api.put(`/produtos/${id}`, produto);
      return data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produto', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['produtos-estoque-baixo'] });
    },
  });
};

// Hook para deletar produto
export const useDeleteProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<ProdutoResponse> => {
      const { data } = await api.delete(`/produtos/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos-estoque-baixo'] });
    },
  });
};

// Hook para ativar produto
export const useAtivarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<ProdutoResponse> => {
      const { data } = await api.put(`/produtos/${id}/ativar`);
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produto', id] });
      queryClient.invalidateQueries({ queryKey: ['produtos-estoque-baixo'] });
    },
  });
};

// Hook para desativar produto
export const useDesativarProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<ProdutoResponse> => {
      const { data } = await api.put(`/produtos/${id}/desativar`);
      return data;
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produto', id] });
      queryClient.invalidateQueries({ queryKey: ['produtos-estoque-baixo'] });
    },
  });
};