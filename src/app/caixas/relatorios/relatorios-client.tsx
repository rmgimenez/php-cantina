"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../../components/ui/toast";

interface RelatorioCaixa {
  abertura_id: number;
  caixa_nome: string;
  funcionario_nome: string;
  saldo_inicial: number;
  saldo_final?: number;
  total_vendas?: number;
  total_dinheiro?: number;
  total_cartao?: number;
  total_pix?: number;
  troco?: number;
  diferenca?: number;
  data_abertura: string;
  data_fechamento?: string;
  observacoes_abertura?: string;
  observacoes_fechamento?: string;
}

interface Caixa {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

export default function RelatoriosCaixaClient() {
  const { addToast } = useToast();
  const [relatorios, setRelatorios] = useState<RelatorioCaixa[]>([]);
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [loading, setLoading] = useState(false);

  // Filtros
  const [dataInicio, setDataInicio] = useState("");
  const [dataFim, setDataFim] = useState("");
  const [caixaId, setCaixaId] = useState<number | "">("");

  useEffect(() => {
    carregarCaixas();
    carregarRelatorios();
  }, []);

  const carregarCaixas = async () => {
    try {
      const response = await fetch("/api/caixas");
      const data = await response.json();

      if (data.success) {
        setCaixas(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar caixas:", error);
    }
  };

  const carregarRelatorios = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({ action: "relatorios" });
      if (dataInicio) params.append("dataInicio", dataInicio);
      if (dataFim) params.append("dataFim", dataFim);
      if (caixaId) params.append("caixaId", caixaId.toString());

      const response = await fetch(`/api/caixas?${params}`);
      const data = await response.json();

      if (data.success) {
        setRelatorios(data.data);
      } else {
        addToast({ type: "error", message: "Erro ao carregar relatórios" });
      }
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
      addToast({ type: "error", message: "Erro ao carregar relatórios" });
    } finally {
      setLoading(false);
    }
  };

  const formatarMoeda = (valor?: number) => {
    if (valor === undefined || valor === null) return "-";
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarDataHora = (dataString?: string) => {
    if (!dataString) return "-";
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dataString));
  };

  const exportarExcel = () => {
    // Implementação básica para exportar CSV
    const headers = [
      "Caixa",
      "Funcionário",
      "Data Abertura",
      "Data Fechamento",
      "Saldo Inicial",
      "Saldo Final",
      "Total Vendas",
      "Dinheiro",
      "Cartão",
      "PIX",
      "Troco",
      "Diferença",
      "Status",
    ];

    const csvContent = [
      headers.join(","),
      ...relatorios.map((rel) =>
        [
          rel.caixa_nome,
          rel.funcionario_nome,
          formatarDataHora(rel.data_abertura),
          formatarDataHora(rel.data_fechamento),
          rel.saldo_inicial,
          rel.saldo_final || 0,
          rel.total_vendas || 0,
          rel.total_dinheiro || 0,
          rel.total_cartao || 0,
          rel.total_pix || 0,
          rel.troco || 0,
          rel.diferenca || 0,
          rel.data_fechamento ? "Fechado" : "Aberto",
        ].join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `relatorio-caixas-${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-0">Relatórios de Caixa</h2>
          <p className="text-muted">
            Histórico de aberturas e fechamentos de caixa
          </p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-success"
            onClick={exportarExcel}
            disabled={relatorios.length === 0}
          >
            <i className="bi bi-file-earmark-excel me-2"></i>
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-funnel me-2"></i>
            Filtros
          </h5>
        </div>
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-3">
              <label htmlFor="dataInicio" className="form-label">
                Data Início
              </label>
              <input
                type="date"
                className="form-control"
                id="dataInicio"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="dataFim" className="form-label">
                Data Fim
              </label>
              <input
                type="date"
                className="form-control"
                id="dataFim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <label htmlFor="caixaSelect" className="form-label">
                Caixa
              </label>
              <select
                className="form-select"
                id="caixaSelect"
                value={caixaId}
                onChange={(e) =>
                  setCaixaId(e.target.value ? parseInt(e.target.value) : "")
                }
              >
                <option value="">Todos os caixas</option>
                {caixas.map((caixa) => (
                  <option key={caixa.id} value={caixa.id}>
                    {caixa.nome}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={carregarRelatorios}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span
                      className="spinner-border spinner-border-sm me-2"
                      role="status"
                    ></span>
                    Buscando...
                  </>
                ) : (
                  <>
                    <i className="bi bi-search me-2"></i>
                    Buscar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabela de Relatórios */}
      <div className="card">
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : relatorios.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-muted">Nenhum relatório encontrado</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover">
                <thead className="table-dark">
                  <tr>
                    <th>Caixa</th>
                    <th>Funcionário</th>
                    <th>Abertura</th>
                    <th>Fechamento</th>
                    <th>Saldo Inicial</th>
                    <th>Saldo Final</th>
                    <th>Total Vendas</th>
                    <th>Diferença</th>
                    <th>Status</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {relatorios.map((rel) => (
                    <tr key={rel.abertura_id}>
                      <td>{rel.caixa_nome}</td>
                      <td>{rel.funcionario_nome}</td>
                      <td>{formatarDataHora(rel.data_abertura)}</td>
                      <td>{formatarDataHora(rel.data_fechamento)}</td>
                      <td>{formatarMoeda(rel.saldo_inicial)}</td>
                      <td>{formatarMoeda(rel.saldo_final)}</td>
                      <td>{formatarMoeda(rel.total_vendas)}</td>
                      <td>
                        {rel.diferenca !== undefined &&
                          rel.diferenca !== null && (
                            <span
                              className={`badge ${
                                rel.diferenca === 0
                                  ? "bg-success"
                                  : rel.diferenca > 0
                                  ? "bg-warning"
                                  : "bg-danger"
                              }`}
                            >
                              {formatarMoeda(rel.diferenca)}
                            </span>
                          )}
                      </td>
                      <td>
                        <span
                          className={`badge ${
                            rel.data_fechamento ? "bg-secondary" : "bg-success"
                          }`}
                        >
                          {rel.data_fechamento ? "Fechado" : "Aberto"}
                        </span>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => {
                            // Modal com detalhes seria implementado aqui
                            addToast({
                              type: "info",
                              message:
                                "Detalhes do relatório não implementados ainda",
                            });
                          }}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Resumo */}
      {relatorios.length > 0 && (
        <div className="row mt-4">
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Resumo do Período</h6>
                <div className="row text-center">
                  <div className="col-4">
                    <div className="h5 text-primary">{relatorios.length}</div>
                    <small className="text-muted">Total de Operações</small>
                  </div>
                  <div className="col-4">
                    <div className="h5 text-success">
                      {relatorios.filter((r) => r.data_fechamento).length}
                    </div>
                    <small className="text-muted">Caixas Fechados</small>
                  </div>
                  <div className="col-4">
                    <div className="h5 text-warning">
                      {relatorios.filter((r) => !r.data_fechamento).length}
                    </div>
                    <small className="text-muted">Caixas Abertos</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card bg-light">
              <div className="card-body">
                <h6 className="card-title">Totais Financeiros</h6>
                <div className="row text-center">
                  <div className="col-6">
                    <div className="h5 text-success">
                      {formatarMoeda(
                        relatorios
                          .filter((r) => r.total_vendas)
                          .reduce((acc, r) => acc + (r.total_vendas || 0), 0)
                      )}
                    </div>
                    <small className="text-muted">Total em Vendas</small>
                  </div>
                  <div className="col-6">
                    <div className="h5 text-info">
                      {formatarMoeda(
                        relatorios
                          .filter((r) => r.diferenca)
                          .reduce((acc, r) => acc + (r.diferenca || 0), 0)
                      )}
                    </div>
                    <small className="text-muted">Diferenças Totais</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
