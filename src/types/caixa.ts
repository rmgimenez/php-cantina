export interface Caixa {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
  data_criacao: Date;
  data_atualizacao: Date;
}

export interface AberturasCaixa {
  id: number;
  caixa_id: number;
  funcionario_cantina_id: number;
  saldo_inicial: number;
  data_abertura: Date;
  aberto: boolean;
  observacoes?: string;
  data_atualizacao: Date;
}

export interface FechamentosCaixa {
  id: number;
  abertura_id: number;
  funcionario_cantina_id: number;
  saldo_final: number;
  total_vendas: number;
  total_movimentacoes: number;
  total_dinheiro?: number;
  total_cartao?: number;
  total_pix?: number;
  troco?: number;
  diferenca?: number;
  observacoes?: string;
  data_fechamento: Date;
}

export interface CaixaAberta {
  abertura_id: number;
  caixa_id: number;
  caixa_nome: string;
  funcionario_cantina_id: number;
  funcionario_nome: string;
  saldo_inicial: number;
  data_abertura: Date;
}

export interface RelatorioCaixa {
  abertura_id: number;
  caixa_nome: string;
  funcionario_nome: string;
  saldo_inicial: number;
  saldo_final: number;
  total_vendas: number;
  total_dinheiro: number;
  total_cartao: number;
  total_pix: number;
  troco: number;
  diferenca: number;
  data_abertura: Date;
  data_fechamento: Date;
  observacoes_abertura?: string;
  observacoes_fechamento?: string;
}

export interface AbrirCaixaRequest {
  caixa_id: number;
  saldo_inicial: number;
  observacoes?: string;
}

export interface FecharCaixaRequest {
  abertura_id: number;
  saldo_final: number;
  total_dinheiro?: number;
  total_cartao?: number;
  total_pix?: number;
  troco?: number;
  observacoes?: string;
}
