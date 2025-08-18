import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

export interface TipoProduto {
  id: number;
  nome: string;
  descricao?: string;
  ativo: string | number; // Para aceitar tanto string quanto número
  data_criacao: string;
}

export interface TipoProdutoInput {
  nome: string;
  descricao?: string;
  ativo?: string | number; // Para aceitar tanto string quanto número
}

export interface TiposProdutosResponse {
  success: boolean;
  message: string;
  data: {
    tipos_produtos: TipoProduto[];
    total: number;
  };
}

export interface TipoProdutoResponse {
  success: boolean;
  message: string;
  data: TipoProduto;
}

// Hook para listar tipos de produtos
export const useTiposProdutos = (filtros?: {
  nome?: string;
  descricao?: string;
  ativo?: string | number;
}) => {
  return useQuery({
    queryKey: ['tipos-produtos', filtros],
    queryFn: async (): Promise<TiposProdutosResponse> => {
      const params = new URLSearchParams();
      if (filtros?.nome) params.append('nome', filtros.nome);
      if (filtros?.descricao) params.append('descricao', filtros.descricao);
      if (filtros?.ativo !== undefined) params.append('ativo', String(filtros.ativo));

      const { data } = await api.get(`/tipos-produtos?${params.toString()}`);
      return data;
    },
  });
};

// Hook para buscar tipos ativos
export const useTiposProdutosAtivos = () => {
  return useQuery({
    queryKey: ['tipos-produtos-ativos'],
    queryFn: async (): Promise<TiposProdutosResponse> => {
      const { data } = await api.get('/tipos-produtos/ativos');
      return data;
    },
  });
};

// Hook para buscar tipo específico
export const useTipoProduto = (id: number) => {
  return useQuery({
    queryKey: ['tipo-produto', id],
    queryFn: async (): Promise<TipoProdutoResponse> => {
      const { data } = await api.get(`/tipos-produtos/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Hook para criar tipo de produto
export const useCreateTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (tipoProduto: TipoProdutoInput): Promise<TipoProdutoResponse> => {
      console.log('Creating tipo produto:', tipoProduto);
      const { data } = await api.post('/tipos-produtos', tipoProduto);
      console.log('Created tipo produto:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos'] });
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos-ativos'] });
    },
  });
};

// Hook para atualizar tipo de produto
export const useUpdateTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      tipoProduto,
    }: {
      id: number;
      tipoProduto: TipoProdutoInput;
    }): Promise<TipoProdutoResponse> => {
      const { data } = await api.put(`/tipos-produtos/${id}`, tipoProduto);
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos'] });
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos-ativos'] });
      queryClient.invalidateQueries({ queryKey: ['tipo-produto', id] });
    },
  });
};

// Hook para deletar tipo de produto
export const useDeleteTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<{ success: boolean; message: string }> => {
      const { data } = await api.delete(`/tipos-produtos/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos'] });
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos-ativos'] });
    },
  });
};

// Hook para ativar tipo de produto
export const useAtivarTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<TipoProdutoResponse> => {
      const { data } = await api.put(`/tipos-produtos/${id}/ativar`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos'] });
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos-ativos'] });
      queryClient.invalidateQueries({ queryKey: ['tipo-produto', id] });
    },
  });
};

// Hook para desativar tipo de produto
export const useDesativarTipoProduto = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number): Promise<TipoProdutoResponse> => {
      const { data } = await api.put(`/tipos-produtos/${id}/desativar`);
      return data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos'] });
      queryClient.invalidateQueries({ queryKey: ['tipos-produtos-ativos'] });
      queryClient.invalidateQueries({ queryKey: ['tipo-produto', id] });
    },
  });
};
