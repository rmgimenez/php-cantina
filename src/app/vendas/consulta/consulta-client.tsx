"use client";

import { useState, useEffect } from "react";
import {
  FaSearch,
  FaEye,
  FaFilter,
  FaUser,
  FaUserTie,
  FaMoneyBillWave,
  FaCreditCard,
} from "react-icons/fa";

interface Venda {
  id: number;
  numeroVenda: string;
  tipoCliente: "aluno" | "funcionario" | "dinheiro";
  nomeCliente: string;
  valorTotal: number;
  formaPagamento: "conta" | "dinheiro" | "cartao" | "pix";
  dataVenda: string;
  observacoes?: string;
}

interface Filtros {
  dataInicio: string;
  dataFim: string;
  tipoCliente: string;
  funcionarioCantina: string;
}

export default function ConsultaVendasClient() {
  const [vendas, setVendas] = useState<Venda[]>([]);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState<Filtros>({
    dataInicio: new Date().toISOString().split("T")[0], // Hoje
    dataFim: new Date().toISOString().split("T")[0], // Hoje
    tipoCliente: "",
    funcionarioCantina: "",
  });
  const [vendaSelecionada, setVendaSelecionada] = useState<any>(null);
  const [mostrarDetalhes, setMostrarDetalhes] = useState(false);
  const [estatisticas, setEstatisticas] = useState<any>(null);

  useEffect(() => {
    buscarVendas();
    buscarEstatisticas();
  }, []);

  const buscarVendas = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();

      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim);
      if (filtros.tipoCliente)
        params.append("tipoCliente", filtros.tipoCliente);
      if (filtros.funcionarioCantina)
        params.append("funcionarioCantina", filtros.funcionarioCantina);

      const response = await fetch(`/api/vendas?${params.toString()}`);
      const data = await response.json();

      if (data.success) {
        setVendas(data.data);
      } else {
        console.error("Erro ao buscar vendas:", data.error);
      }
    } catch (error) {
      console.error("Erro ao buscar vendas:", error);
    } finally {
      setLoading(false);
    }
  };

  const buscarEstatisticas = async () => {
    try {
      const params = new URLSearchParams();
      if (filtros.dataInicio) params.append("dataInicio", filtros.dataInicio);
      if (filtros.dataFim) params.append("dataFim", filtros.dataFim);

      const response = await fetch(
        `/api/vendas?action=estatisticas&${params.toString()}`
      );
      const data = await response.json();

      if (data.success) {
        setEstatisticas(data.data);
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
    }
  };

  const verDetalhesVenda = async (vendaId: number) => {
    try {
      const response = await fetch(`/api/vendas/${vendaId}`);
      const data = await response.json();

      if (data.success) {
        setVendaSelecionada(data.data);
        setMostrarDetalhes(true);
      } else {
        alert("Erro ao carregar detalhes da venda");
      }
    } catch (error) {
      console.error("Erro ao buscar detalhes:", error);
      alert("Erro ao carregar detalhes da venda");
    }
  };

  const aplicarFiltros = () => {
    buscarVendas();
    buscarEstatisticas();
  };

  const limparFiltros = () => {
    setFiltros({
      dataInicio: new Date().toISOString().split("T")[0],
      dataFim: new Date().toISOString().split("T")[0],
      tipoCliente: "",
      funcionarioCantina: "",
    });
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const getIconeTipoCliente = (tipo: string) => {
    switch (tipo) {
      case "aluno":
        return <FaUser className="text-primary" />;
      case "funcionario":
        return <FaUserTie className="text-info" />;
      case "dinheiro":
        return <FaMoneyBillWave className="text-success" />;
      default:
        return null;
    }
  };

  const getIconeFormaPagamento = (forma: string) => {
    switch (forma) {
      case "conta":
        return <FaCreditCard className="text-primary" />;
      case "dinheiro":
        return <FaMoneyBillWave className="text-success" />;
      case "cartao":
        return <FaCreditCard className="text-warning" />;
      case "pix":
        return <span className="text-info">PIX</span>;
      default:
        return null;
    }
  };

  return (
    <div className="container-fluid">
      {/* Filtros */}
      <div className="card mb-4">
        <div className="card-header">
          <h6>
            <FaFilter className="me-2" />
            Filtros
          </h6>
        </div>
        <div className="card-body">
          <div className="row">
            <div className="col-md-3">
              <label className="form-label">Data Início</label>
              <input
                type="date"
                className="form-control"
                value={filtros.dataInicio}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataInicio: e.target.value })
                }
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Data Fim</label>
              <input
                type="date"
                className="form-control"
                value={filtros.dataFim}
                onChange={(e) =>
                  setFiltros({ ...filtros, dataFim: e.target.value })
                }
              />
            </div>
            <div className="col-md-3">
              <label className="form-label">Tipo Cliente</label>
              <select
                className="form-select"
                value={filtros.tipoCliente}
                onChange={(e) =>
                  setFiltros({ ...filtros, tipoCliente: e.target.value })
                }
              >
                <option value="">Todos</option>
                <option value="aluno">Aluno</option>
                <option value="funcionario">Funcionário</option>
                <option value="dinheiro">À Vista</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-end">
              <div className="btn-group w-100">
                <button className="btn btn-primary" onClick={aplicarFiltros}>
                  <FaSearch className="me-1" />
                  Buscar
                </button>
                <button
                  className="btn btn-outline-secondary"
                  onClick={limparFiltros}
                >
                  Limpar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Estatísticas */}
      {estatisticas && (
        <div className="row mb-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-primary">
                  {estatisticas.totalVendas}
                </h5>
                <p className="card-text">Total de Vendas</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-success">
                  {formatarMoeda(estatisticas.faturamentoTotal)}
                </h5>
                <p className="card-text">Faturamento Total</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title text-info">
                  {formatarMoeda(estatisticas.ticketMedio)}
                </h5>
                <p className="card-text">Ticket Médio</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <div className="row">
                  <div className="col">
                    <small className="text-muted">Alunos</small>
                    <br />
                    <strong>{estatisticas.vendasAlunos}</strong>
                  </div>
                  <div className="col">
                    <small className="text-muted">Funcionários</small>
                    <br />
                    <strong>{estatisticas.vendasFuncionarios}</strong>
                  </div>
                  <div className="col">
                    <small className="text-muted">À Vista</small>
                    <br />
                    <strong>{estatisticas.vendasDinheiro}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Lista de Vendas */}
      <div className="card">
        <div className="card-header">
          <h6>Vendas Realizadas ({vendas.length})</h6>
        </div>
        <div className="card-body">
          {loading ? (
            <div className="text-center py-4">
              <div className="spinner-border" role="status">
                <span className="visually-hidden">Carregando...</span>
              </div>
            </div>
          ) : vendas.length === 0 ? (
            <div className="text-center py-4 text-muted">
              Nenhuma venda encontrada
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Número</th>
                    <th>Data/Hora</th>
                    <th>Cliente</th>
                    <th>Tipo</th>
                    <th>Pagamento</th>
                    <th>Valor</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {vendas.map((venda) => (
                    <tr key={venda.id}>
                      <td>
                        <strong>{venda.numeroVenda}</strong>
                      </td>
                      <td>{formatarData(venda.dataVenda)}</td>
                      <td>{venda.nomeCliente}</td>
                      <td>
                        {getIconeTipoCliente(venda.tipoCliente)}
                        <span className="ms-1">
                          {venda.tipoCliente === "aluno"
                            ? "Aluno"
                            : venda.tipoCliente === "funcionario"
                            ? "Funcionário"
                            : "À Vista"}
                        </span>
                      </td>
                      <td>
                        {getIconeFormaPagamento(venda.formaPagamento)}
                        <span className="ms-1">
                          {venda.formaPagamento === "conta"
                            ? "Conta"
                            : venda.formaPagamento === "dinheiro"
                            ? "Dinheiro"
                            : venda.formaPagamento === "cartao"
                            ? "Cartão"
                            : "PIX"}
                        </span>
                      </td>
                      <td>
                        <strong className="text-success">
                          {formatarMoeda(venda.valorTotal)}
                        </strong>
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => verDetalhesVenda(venda.id)}
                        >
                          <FaEye className="me-1" />
                          Ver
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

      {/* Modal de Detalhes */}
      {mostrarDetalhes && vendaSelecionada && (
        <div
          className="modal show d-block"
          tabIndex={-1}
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Detalhes da Venda #{vendaSelecionada.numeroVenda}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setMostrarDetalhes(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Data/Hora:</strong>{" "}
                    {formatarData(vendaSelecionada.dataVenda)}
                  </div>
                  <div className="col-md-6">
                    <strong>Cliente:</strong> {vendaSelecionada.nomeCliente}
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <strong>Tipo:</strong>{" "}
                    {vendaSelecionada.tipoCliente === "aluno"
                      ? "Aluno"
                      : vendaSelecionada.tipoCliente === "funcionario"
                      ? "Funcionário"
                      : "À Vista"}
                  </div>
                  <div className="col-md-6">
                    <strong>Pagamento:</strong>{" "}
                    {vendaSelecionada.formaPagamento === "conta"
                      ? "Conta"
                      : vendaSelecionada.formaPagamento === "dinheiro"
                      ? "Dinheiro"
                      : vendaSelecionada.formaPagamento === "cartao"
                      ? "Cartão"
                      : "PIX"}
                  </div>
                </div>

                {vendaSelecionada.valorRecebido && (
                  <div className="row mb-3">
                    <div className="col-md-6">
                      <strong>Valor Recebido:</strong>{" "}
                      {formatarMoeda(vendaSelecionada.valorRecebido)}
                    </div>
                    <div className="col-md-6">
                      <strong>Troco:</strong>{" "}
                      {formatarMoeda(vendaSelecionada.valorTroco || 0)}
                    </div>
                  </div>
                )}

                {vendaSelecionada.observacoes && (
                  <div className="mb-3">
                    <strong>Observações:</strong> {vendaSelecionada.observacoes}
                  </div>
                )}

                <h6>Itens da Venda</h6>
                <div className="table-responsive">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>Produto</th>
                        <th>Qtd</th>
                        <th>Preço Unit.</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {vendaSelecionada.itens?.map((item: any) => (
                        <tr key={item.id}>
                          <td>{item.nomeProduto}</td>
                          <td>{item.quantidade}</td>
                          <td>{formatarMoeda(item.precoUnitario)}</td>
                          <td>{formatarMoeda(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <th colSpan={3}>Total</th>
                        <th>{formatarMoeda(vendaSelecionada.valorTotal)}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setMostrarDetalhes(false)}
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
