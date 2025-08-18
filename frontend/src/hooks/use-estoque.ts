import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../lib/axios';

// Types
export interface MovimentacaoEstoque {
  id: number;
  produto_id: number;
  produto_nome: string;
  tipo_movimentacao: 'entrada' | 'saida' | 'ajuste';
  quantidade: number;
  estoque_anterior: number;
  estoque_atual: number;
  motivo?: string;
  venda_id?: number;
  funcionario_cantina_id: number;
  funcionario_nome: string;
  data_movimentacao: string;
}

export interface EntradaEstoqueInput {
  produto_id: number;
  quantidade: number;
  motivo: string;
  funcionario_cantina_id: number;
}

export interface AjusteEstoqueInput {
  produto_id: number;
  quantidade: number; // Pode ser negativo
  motivo: string;
  funcionario_cantina_id: number;
}

export interface EstoqueFiltros {
  tipo_movimentacao?: 'entrada' | 'saida' | 'ajuste';
  data_inicio?: string;
  data_fim?: string;
  produto_id?: number;
  funcionario_cantina_id?: number;
}

export interface MovimentacoesResponse {
  success: boolean;
  message: string;
  data: {
    movimentacoes: MovimentacaoEstoque[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface HistoricoResponse {
  success: boolean;
  message: string;
  data: {
    produto: {
      id: number;
      nome: string;
      estoque_atual: number;
      estoque_minimo: number;
    };
    movimentacoes: MovimentacaoEstoque[];
    pagination: {
      page: number;
      perPage: number;
      total: number;
      totalPages: number;
    };
  };
}

export interface MovimentacaoResponse {
  success: boolean;
  message: string;
  data: MovimentacaoEstoque;
}

export interface RelatorioEstoqueResponse {
  success: boolean;
  message: string;
  data: {
    resumo: {
      total_produtos: number;
      produtos_estoque_baixo: number;
      produtos_zerados: number;
      valor_total_estoque: number;
    };
    produtos_estoque_baixo: Array<{
      id: number;
      nome: string;
      estoque_atual: number;
      estoque_minimo: number;
      tipo_produto_nome: string;
      quantidade_repor: number;
    }>;
    ultimas_movimentacoes: MovimentacaoEstoque[];
  };
}

// Hook para buscar movimentações com paginação e filtros
export const useMovimentacoesEstoque = (filtros?: EstoqueFiltros, page = 1, perPage = 20) => {
  return useQuery({
    queryKey: ['estoque-movimentacoes', filtros, page, perPage],
    queryFn: async (): Promise<MovimentacoesResponse> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('perPage', perPage.toString());
      
      if (filtros?.tipo_movimentacao) params.append('tipo_movimentacao', filtros.tipo_movimentacao);
      if (filtros?.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros?.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros?.produto_id) params.append('produto_id', filtros.produto_id.toString());
      if (filtros?.funcionario_cantina_id) params.append('funcionario_cantina_id', filtros.funcionario_cantina_id.toString());

      const { data } = await api.get(`/estoque/movimentacoes?${params.toString()}`);
      return data;
    },
  });
};

// Hook para buscar histórico por produto
export const useHistoricoEstoque = (produtoId: number, page = 1, perPage = 50) => {
  return useQuery({
    queryKey: ['estoque-historico', produtoId, page, perPage],
    queryFn: async (): Promise<HistoricoResponse> => {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('perPage', perPage.toString());

      const { data } = await api.get(`/estoque/historico/${produtoId}?${params.toString()}`);
      return data;
    },
    enabled: !!produtoId,
  });
};

// Hook para relatório de estoque
export const useRelatorioEstoque = () => {
  return useQuery({
    queryKey: ['estoque-relatorio'],
    queryFn: async (): Promise<RelatorioEstoqueResponse> => {
      const { data } = await api.get('/estoque/relatorio');
      return data;
    },
  });
};

// Hook para registrar entrada de estoque
export const useRegistrarEntrada = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entrada: EntradaEstoqueInput): Promise<MovimentacaoResponse> => {
      const { data } = await api.post('/estoque/entrada', entrada);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-movimentacoes'] });
      queryClient.invalidateQueries({ queryKey: ['estoque-historico'] });
      queryClient.invalidateQueries({ queryKey: ['estoque-relatorio'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos-estoque-baixo'] });
    },
  });
};

// Hook para registrar ajuste de estoque
export const useRegistrarAjuste = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (ajuste: AjusteEstoqueInput): Promise<MovimentacaoResponse> => {
      const { data } = await api.post('/estoque/ajuste', ajuste);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-movimentacoes'] });
      queryClient.invalidateQueries({ queryKey: ['estoque-historico'] });
      queryClient.invalidateQueries({ queryKey: ['estoque-relatorio'] });
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      queryClient.invalidateQueries({ queryKey: ['produtos-estoque-baixo'] });
    },
  });
};