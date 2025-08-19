"use client";

import { useState, useEffect } from "react";
import { useToast } from "../../components/ui/toast";

interface Caixa {
  id: number;
  nome: string;
  descricao?: string;
  ativo: boolean;
}

interface CaixaAberta {
  abertura_id: number;
  caixa_id: number;
  caixa_nome: string;
  funcionario_cantina_id: number;
  funcionario_nome: string;
  saldo_inicial: number;
  data_abertura: string;
}

interface TotaisCaixa {
  total_vendas: number;
  total_dinheiro: number;
  total_cartao: number;
  total_pix: number;
  troco: number;
}

export default function CaixasClient() {
  const { addToast } = useToast();
  const [caixas, setCaixas] = useState<Caixa[]>([]);
  const [caixasAbertas, setCaixasAbertas] = useState<CaixaAberta[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAction, setLoadingAction] = useState(false);

  // Estados para modal de abertura
  const [showModalAbrir, setShowModalAbrir] = useState(false);
  const [caixaParaAbrir, setCaixaParaAbrir] = useState<number | null>(null);
  const [saldoInicial, setSaldoInicial] = useState("");
  const [observacoesAbertura, setObservacoesAbertura] = useState("");

  // Estados para modal de fechamento
  const [showModalFechar, setShowModalFechar] = useState(false);
  const [caixaParaFechar, setCaixaParaFechar] = useState<CaixaAberta | null>(
    null
  );
  const [saldoFinal, setSaldoFinal] = useState("");
  const [observacoesFechamento, setObservacoesFechamento] = useState("");
  const [totaisCaixa, setTotaisCaixa] = useState<TotaisCaixa | null>(null);

  // Estados para modal de criação
  const [showModalCriar, setShowModalCriar] = useState(false);
  const [nomeCaixa, setNomeCaixa] = useState("");
  const [descricaoCaixa, setDescricaoCaixa] = useState("");

  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);

      // Carregar caixas disponíveis
      const resCaixas = await fetch("/api/caixas");
      const dataCaixas = await resCaixas.json();

      if (dataCaixas.success) {
        setCaixas(dataCaixas.data);
      }

      // Carregar caixas abertas
      const resAbertas = await fetch("/api/caixas?action=abertas");
      const dataAbertas = await resAbertas.json();

      if (dataAbertas.success) {
        setCaixasAbertas(dataAbertas.data);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      addToast({ type: "error", message: "Erro ao carregar dados" });
    } finally {
      setLoading(false);
    }
  };

  const abrirCaixa = async () => {
    if (!caixaParaAbrir || !saldoInicial) {
      addToast({
        type: "error",
        message: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    try {
      setLoadingAction(true);

      const response = await fetch("/api/caixas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "abrir",
          caixa_id: caixaParaAbrir,
          saldo_inicial: parseFloat(saldoInicial),
          observacoes: observacoesAbertura,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast({ type: "success", message: "Caixa aberto com sucesso!" });
        setShowModalAbrir(false);
        resetarFormularioAbertura();
        carregarDados();
      } else {
        addToast({
          type: "error",
          message: data.error || "Erro ao abrir caixa",
        });
      }
    } catch (error) {
      console.error("Erro ao abrir caixa:", error);
      addToast({ type: "error", message: "Erro ao abrir caixa" });
    } finally {
      setLoadingAction(false);
    }
  };

  const carregarTotaisCaixa = async (aberturaId: number) => {
    try {
      const response = await fetch(
        `/api/caixas?action=totais&aberturaId=${aberturaId}`
      );
      const data = await response.json();

      if (data.success) {
        setTotaisCaixa(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar totais:", error);
    }
  };

  const prepararFecharCaixa = async (caixa: CaixaAberta) => {
    setCaixaParaFechar(caixa);
    setShowModalFechar(true);
    await carregarTotaisCaixa(caixa.abertura_id);
  };

  const fecharCaixa = async () => {
    if (!caixaParaFechar || !saldoFinal) {
      addToast({
        type: "error",
        message: "Preencha todos os campos obrigatórios",
      });
      return;
    }

    try {
      setLoadingAction(true);

      const response = await fetch("/api/caixas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "fechar",
          abertura_id: caixaParaFechar.abertura_id,
          saldo_final: parseFloat(saldoFinal),
          observacoes: observacoesFechamento,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast({ type: "success", message: "Caixa fechado com sucesso!" });
        setShowModalFechar(false);
        resetarFormularioFechamento();
        carregarDados();
      } else {
        addToast({
          type: "error",
          message: data.error || "Erro ao fechar caixa",
        });
      }
    } catch (error) {
      console.error("Erro ao fechar caixa:", error);
      addToast({ type: "error", message: "Erro ao fechar caixa" });
    } finally {
      setLoadingAction(false);
    }
  };

  const criarCaixa = async () => {
    if (!nomeCaixa.trim()) {
      addToast({ type: "error", message: "Nome do caixa é obrigatório" });
      return;
    }

    try {
      setLoadingAction(true);

      const response = await fetch("/api/caixas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "criar",
          nome: nomeCaixa.trim(),
          descricao: descricaoCaixa.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        addToast({ type: "success", message: "Caixa criado com sucesso!" });
        setShowModalCriar(false);
        resetarFormularioCriacao();
        carregarDados();
      } else {
        addToast({
          type: "error",
          message: data.error || "Erro ao criar caixa",
        });
      }
    } catch (error) {
      console.error("Erro ao criar caixa:", error);
      addToast({ type: "error", message: "Erro ao criar caixa" });
    } finally {
      setLoadingAction(false);
    }
  };

  const resetarFormularioAbertura = () => {
    setCaixaParaAbrir(null);
    setSaldoInicial("");
    setObservacoesAbertura("");
  };

  const resetarFormularioFechamento = () => {
    setCaixaParaFechar(null);
    setSaldoFinal("");
    setObservacoesFechamento("");
    setTotaisCaixa(null);
  };

  const resetarFormularioCriacao = () => {
    setNomeCaixa("");
    setDescricaoCaixa("");
  };

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarDataHora = (dataString: string) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dataString));
  };

  if (loading) {
    return (
      <div className="container-fluid py-4">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Carregando...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col">
          <h2 className="mb-0">Gerenciamento de Caixas</h2>
          <p className="text-muted">
            Abra e feche caixas para controlar o fluxo de vendas
          </p>
        </div>
        <div className="col-auto">
          <button
            className="btn btn-primary"
            onClick={() => setShowModalCriar(true)}
          >
            <i className="bi bi-plus-lg me-2"></i>
            Novo Caixa
          </button>
        </div>
      </div>

      {/* Caixas Abertos */}
      {caixasAbertas.length > 0 && (
        <div className="row mb-4">
          <div className="col-12">
            <div className="card">
              <div className="card-header bg-success text-white">
                <h5 className="mb-0">
                  <i className="bi bi-cash-coin me-2"></i>
                  Caixas Abertos
                </h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {caixasAbertas.map((caixa) => (
                    <div
                      key={caixa.abertura_id}
                      className="col-md-6 col-lg-4 mb-3"
                    >
                      <div className="card border-success">
                        <div className="card-body">
                          <h6 className="card-title">{caixa.caixa_nome}</h6>
                          <p className="card-text">
                            <small className="text-muted">
                              Funcionário: {caixa.funcionario_nome}
                              <br />
                              Abertura: {formatarDataHora(caixa.data_abertura)}
                              <br />
                              Saldo inicial:{" "}
                              {formatarMoeda(caixa.saldo_inicial)}
                            </small>
                          </p>
                          <button
                            className="btn btn-warning btn-sm"
                            onClick={() => prepararFecharCaixa(caixa)}
                          >
                            <i className="bi bi-lock me-1"></i>
                            Fechar Caixa
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Caixas Disponíveis */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">
                <i className="bi bi-shop me-2"></i>
                Caixas Disponíveis
              </h5>
            </div>
            <div className="card-body">
              {caixas.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-muted">Nenhum caixa cadastrado</p>
                </div>
              ) : (
                <div className="row">
                  {caixas.map((caixa) => {
                    const estaAberto = caixasAbertas.some(
                      (aberta) => aberta.caixa_id === caixa.id
                    );

                    return (
                      <div key={caixa.id} className="col-md-6 col-lg-4 mb-3">
                        <div
                          className={`card ${
                            estaAberto ? "border-success" : "border-secondary"
                          }`}
                        >
                          <div className="card-body">
                            <h6 className="card-title">{caixa.nome}</h6>
                            {caixa.descricao && (
                              <p className="card-text text-muted small">
                                {caixa.descricao}
                              </p>
                            )}
                            <div className="d-flex justify-content-between align-items-center">
                              <span
                                className={`badge ${
                                  estaAberto ? "bg-success" : "bg-secondary"
                                }`}
                              >
                                {estaAberto ? "Aberto" : "Fechado"}
                              </span>
                              {!estaAberto && (
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => {
                                    setCaixaParaAbrir(caixa.id);
                                    setShowModalAbrir(true);
                                  }}
                                >
                                  <i className="bi bi-unlock me-1"></i>
                                  Abrir
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Abrir Caixa */}
      {showModalAbrir && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Abrir Caixa</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModalAbrir(false);
                    resetarFormularioAbertura();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="saldoInicial" className="form-label">
                      Saldo Inicial *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      id="saldoInicial"
                      value={saldoInicial}
                      onChange={(e) => setSaldoInicial(e.target.value)}
                      placeholder="0,00"
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="observacoesAbertura" className="form-label">
                      Observações
                    </label>
                    <textarea
                      className="form-control"
                      id="observacoesAbertura"
                      rows={3}
                      value={observacoesAbertura}
                      onChange={(e) => setObservacoesAbertura(e.target.value)}
                      placeholder="Observações sobre a abertura..."
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModalAbrir(false);
                    resetarFormularioAbertura();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={abrirCaixa}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Abrindo...
                    </>
                  ) : (
                    "Abrir Caixa"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Fechar Caixa */}
      {showModalFechar && caixaParaFechar && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Fechar Caixa - {caixaParaFechar.caixa_nome}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModalFechar(false);
                    resetarFormularioFechamento();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                {/* Resumo do Caixa */}
                <div className="row mb-4">
                  <div className="col-md-6">
                    <div className="card bg-light">
                      <div className="card-body">
                        <h6 className="card-title">Informações da Abertura</h6>
                        <p className="card-text small">
                          <strong>Funcionário:</strong>{" "}
                          {caixaParaFechar.funcionario_nome}
                          <br />
                          <strong>Abertura:</strong>{" "}
                          {formatarDataHora(caixaParaFechar.data_abertura)}
                          <br />
                          <strong>Saldo Inicial:</strong>{" "}
                          {formatarMoeda(caixaParaFechar.saldo_inicial)}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    {totaisCaixa && (
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">Totais do Período</h6>
                          <p className="card-text small">
                            <strong>Total Vendas:</strong>{" "}
                            {formatarMoeda(totaisCaixa.total_vendas)}
                            <br />
                            <strong>Dinheiro:</strong>{" "}
                            {formatarMoeda(totaisCaixa.total_dinheiro)}
                            <br />
                            <strong>Cartão:</strong>{" "}
                            {formatarMoeda(totaisCaixa.total_cartao)}
                            <br />
                            <strong>PIX:</strong>{" "}
                            {formatarMoeda(totaisCaixa.total_pix)}
                            <br />
                            <strong>Troco:</strong>{" "}
                            {formatarMoeda(totaisCaixa.troco)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <form>
                  <div className="mb-3">
                    <label htmlFor="saldoFinal" className="form-label">
                      Saldo Final (Contado no Caixa) *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      className="form-control"
                      id="saldoFinal"
                      value={saldoFinal}
                      onChange={(e) => setSaldoFinal(e.target.value)}
                      placeholder="0,00"
                    />
                    {totaisCaixa && saldoFinal && (
                      <div className="form-text">
                        <strong>Saldo esperado:</strong>{" "}
                        {formatarMoeda(
                          caixaParaFechar.saldo_inicial +
                            totaisCaixa.total_dinheiro -
                            totaisCaixa.troco
                        )}
                        {parseFloat(saldoFinal) !==
                          caixaParaFechar.saldo_inicial +
                            totaisCaixa.total_dinheiro -
                            totaisCaixa.troco && (
                          <span className="text-warning ms-2">
                            (Diferença:{" "}
                            {formatarMoeda(
                              parseFloat(saldoFinal) -
                                (caixaParaFechar.saldo_inicial +
                                  totaisCaixa.total_dinheiro -
                                  totaisCaixa.troco)
                            )}
                            )
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label
                      htmlFor="observacoesFechamento"
                      className="form-label"
                    >
                      Observações
                    </label>
                    <textarea
                      className="form-control"
                      id="observacoesFechamento"
                      rows={3}
                      value={observacoesFechamento}
                      onChange={(e) => setObservacoesFechamento(e.target.value)}
                      placeholder="Observações sobre o fechamento..."
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModalFechar(false);
                    resetarFormularioFechamento();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-warning"
                  onClick={fecharCaixa}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Fechando...
                    </>
                  ) : (
                    "Fechar Caixa"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Criar Caixa */}
      {showModalCriar && (
        <div className="modal show d-block" tabIndex={-1}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Criar Novo Caixa</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => {
                    setShowModalCriar(false);
                    resetarFormularioCriacao();
                  }}
                ></button>
              </div>
              <div className="modal-body">
                <form>
                  <div className="mb-3">
                    <label htmlFor="nomeCaixa" className="form-label">
                      Nome do Caixa *
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="nomeCaixa"
                      value={nomeCaixa}
                      onChange={(e) => setNomeCaixa(e.target.value)}
                      placeholder="Ex: Caixa Principal, Caixa 2, etc."
                    />
                  </div>
                  <div className="mb-3">
                    <label htmlFor="descricaoCaixa" className="form-label">
                      Descrição
                    </label>
                    <textarea
                      className="form-control"
                      id="descricaoCaixa"
                      rows={3}
                      value={descricaoCaixa}
                      onChange={(e) => setDescricaoCaixa(e.target.value)}
                      placeholder="Descrição opcional do caixa..."
                    ></textarea>
                  </div>
                </form>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => {
                    setShowModalCriar(false);
                    resetarFormularioCriacao();
                  }}
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={criarCaixa}
                  disabled={loadingAction}
                >
                  {loadingAction ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Criando...
                    </>
                  ) : (
                    "Criar Caixa"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Backdrop para modais */}
      {(showModalAbrir || showModalFechar || showModalCriar) && (
        <div className="modal-backdrop show"></div>
      )}
    </div>
  );
}
