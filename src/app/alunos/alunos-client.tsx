"use client";

import { useState, useEffect, useCallback } from "react";
import {
  FaUser,
  FaExclamationTriangle,
  FaSearch,
  FaDollarSign,
  FaPlus,
  FaEye,
  FaEdit,
  FaUsers,
} from "react-icons/fa";
import Breadcrumb from "@/components/ui/breadcrumb";
import Alert from "@/components/ui/alert";
import Loading from "@/components/ui/loading";
import Modal from "@/components/ui/modal";

interface Aluno {
  ra: number;
  nome: string;
  nome_social?: string;
  curso_nome?: string;
  serie?: number;
  turma?: string;
  periodo?: string;
  status?: string;
  nome_resp?: string;
  cpf_resp?: string;
  tel_cel_resp?: string;
  email_resp?: string;
}

interface ContaAluno {
  id: number;
  ra_aluno: number;
  saldo: number;
  limite_diario?: number;
  ativo: boolean;
  data_criacao: string;
  data_atualizacao: string;
}

interface AlunoCompleto extends Aluno {
  conta?: ContaAluno;
}

interface MovimentacaoFinanceira {
  id: number;
  tipo_conta: "aluno" | "funcionario";
  ra_aluno?: number;
  tipo_movimentacao: "credito" | "debito";
  valor: number;
  descricao: string;
  data_movimentacao: string;
}

interface AlertType {
  type: "success" | "danger" | "warning" | "info";
  message: string;
}

export default function AlunosClient() {
  const [alunos, setAlunos] = useState<AlunoCompleto[]>([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState<AlertType | null>(null);
  const [busca, setBusca] = useState("");
  const [modalCredito, setModalCredito] = useState(false);
  const [modalMovimentacoes, setModalMovimentacoes] = useState(false);
  const [modalCriarConta, setModalCriarConta] = useState(false);
  const [alunoSelecionado, setAlunoSelecionado] =
    useState<AlunoCompleto | null>(null);
  const [movimentacoes, setMovimentacoes] = useState<MovimentacaoFinanceira[]>(
    []
  );
  const [loadingMovimentacoes, setLoadingMovimentacoes] = useState(false);

  // Formulários
  const [formCredito, setFormCredito] = useState({
    valor: "",
    descricao: "",
  });

  const [formConta, setFormConta] = useState({
    limite_diario: "",
  });

  const carregarAlunos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/alunos?com_contas=true");
      if (response.ok) {
        const data = await response.json();
        setAlunos(data);
      } else {
        setAlert({
          type: "danger",
          message: "Erro ao carregar alunos",
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Erro de conexão ao carregar alunos",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const buscarAlunos = useCallback(
    async (termo: string) => {
      if (!termo.trim()) {
        carregarAlunos();
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(
          `/api/alunos?nome=${encodeURIComponent(termo)}&com_contas=true`
        );
        if (response.ok) {
          const data = await response.json();
          setAlunos(data);
        }
      } catch (error) {
        setAlert({
          type: "danger",
          message: "Erro ao buscar alunos",
        });
      } finally {
        setLoading(false);
      }
    },
    [carregarAlunos]
  );

  const criarConta = async () => {
    if (!alunoSelecionado) return;

    try {
      const response = await fetch("/api/alunos/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ra: alunoSelecionado.ra,
          acao: "criar_conta",
          limite_diario: formConta.limite_diario
            ? parseFloat(formConta.limite_diario)
            : null,
        }),
      });

      if (response.ok) {
        setAlert({
          type: "success",
          message: "Conta criada com sucesso!",
        });
        setModalCriarConta(false);
        setFormConta({ limite_diario: "" });
        carregarAlunos();
      } else {
        const data = await response.json();
        setAlert({
          type: "danger",
          message: data.message || "Erro ao criar conta",
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Erro de conexão ao criar conta",
      });
    }
  };

  const adicionarCredito = async () => {
    if (!alunoSelecionado || !formCredito.valor) return;

    try {
      const response = await fetch("/api/alunos/contas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ra: alunoSelecionado.ra,
          acao: "adicionar_credito",
          valor: parseFloat(formCredito.valor),
          descricao: formCredito.descricao || "Adição de crédito",
        }),
      });

      if (response.ok) {
        setAlert({
          type: "success",
          message: "Crédito adicionado com sucesso!",
        });
        setModalCredito(false);
        setFormCredito({ valor: "", descricao: "" });
        carregarAlunos();
      } else {
        const data = await response.json();
        setAlert({
          type: "danger",
          message: data.message || "Erro ao adicionar crédito",
        });
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Erro de conexão ao adicionar crédito",
      });
    }
  };

  const carregarMovimentacoes = async (aluno: AlunoCompleto) => {
    try {
      setLoadingMovimentacoes(true);
      const response = await fetch(
        `/api/alunos/contas?ra=${aluno.ra}&acao=movimentacoes`
      );
      if (response.ok) {
        const data = await response.json();
        setMovimentacoes(data.movimentacoes);
        setAlunoSelecionado(aluno);
        setModalMovimentacoes(true);
      }
    } catch (error) {
      setAlert({
        type: "danger",
        message: "Erro ao carregar movimentações",
      });
    } finally {
      setLoadingMovimentacoes(false);
    }
  };

  useEffect(() => {
    carregarAlunos();
  }, [carregarAlunos]);

  const alunosFiltrados = alunos.filter(
    (aluno) =>
      aluno.nome.toLowerCase().includes(busca.toLowerCase()) ||
      aluno.ra.toString().includes(busca)
  );

  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor);
  };

  const formatarData = (data: string) => {
    return new Date(data).toLocaleString("pt-BR");
  };

  if (loading) return <Loading />;

  return (
    <div className="container-fluid py-4">
      <Breadcrumb
        items={[
          { label: "Dashboard", href: "/dashboard" },
          { label: "Gerenciar Contas de Alunos", href: "/alunos" },
        ]}
      />

      <div className="row mb-4">
        <div className="col">
          <h1 className="h3 mb-0 d-flex align-items-center">
            <FaUsers className="me-2" />
            Gerenciar Contas de Alunos
          </h1>
          <p className="text-muted">
            RF-006, RF-007, RF-008: Gerencie contas, adicione crédito e consulte
            saldos dos alunos
          </p>
        </div>
      </div>

      {alert && (
        <Alert type={alert.type} onClose={() => setAlert(null)}>
          {alert.message}
        </Alert>
      )}

      {/* Barra de busca */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="input-group">
            <span className="input-group-text">
              <FaSearch size={18} />
            </span>
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nome ou RA..."
              value={busca}
              onChange={(e) => {
                setBusca(e.target.value);
                if (e.target.value.length >= 3 || e.target.value === "") {
                  buscarAlunos(e.target.value);
                }
              }}
            />
          </div>
        </div>
        <div className="col-md-6 text-end">
          <span className="text-muted">
            {alunosFiltrados.length} aluno(s) encontrado(s)
          </span>
        </div>
      </div>

      {/* Lista de alunos */}
      <div className="card">
        <div className="card-header">
          <h5 className="card-title mb-0">Lista de Alunos</h5>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>RA</th>
                  <th>Nome</th>
                  <th>Curso/Série</th>
                  <th>Saldo</th>
                  <th>Limite Diário</th>
                  <th>Status da Conta</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {alunosFiltrados.map((aluno) => (
                  <tr key={aluno.ra}>
                    <td>
                      <span className="badge bg-secondary">{aluno.ra}</span>
                    </td>
                    <td>
                      <div>
                        <strong>{aluno.nome}</strong>
                        {aluno.nome_social && (
                          <div className="small text-muted">
                            Nome social: {aluno.nome_social}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="small">
                        {aluno.curso_nome}
                        {aluno.serie && <div>{aluno.serie}ª série</div>}
                        {aluno.turma && <div>Turma: {aluno.turma}</div>}
                      </div>
                    </td>
                    <td>
                      {aluno.conta ? (
                        <span
                          className={`badge ${
                            aluno.conta.saldo > 0 ? "bg-success" : "bg-warning"
                          }`}
                        >
                          {formatarMoeda(aluno.conta.saldo)}
                        </span>
                      ) : (
                        <span className="text-muted">Sem conta</span>
                      )}
                    </td>
                    <td>
                      {aluno.conta?.limite_diario ? (
                        formatarMoeda(aluno.conta.limite_diario)
                      ) : (
                        <span className="text-muted">Sem limite</span>
                      )}
                    </td>
                    <td>
                      {aluno.conta ? (
                        <span className="badge bg-success">Conta Ativa</span>
                      ) : (
                        <span className="badge bg-warning">Sem Conta</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group" role="group">
                        {!aluno.conta ? (
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => {
                              setAlunoSelecionado(aluno);
                              setModalCriarConta(true);
                            }}
                            title="Criar conta"
                          >
                            <FaPlus size={16} />
                          </button>
                        ) : (
                          <>
                            <button
                              className="btn btn-sm btn-success"
                              onClick={() => {
                                setAlunoSelecionado(aluno);
                                setModalCredito(true);
                              }}
                              title="Adicionar crédito"
                            >
                              <FaDollarSign size={16} />
                            </button>
                            <button
                              className="btn btn-sm btn-info"
                              onClick={() => carregarMovimentacoes(aluno)}
                              title="Ver movimentações"
                            >
                              <FaEye size={16} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal Criar Conta */}
      <Modal
        isOpen={modalCriarConta}
        onClose={() => setModalCriarConta(false)}
        title="Criar Conta"
      >
        {alunoSelecionado && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              criarConta();
            }}
          >
            <div className="mb-3">
              <label className="form-label">Aluno</label>
              <div className="form-control-plaintext">
                <strong>{alunoSelecionado.nome}</strong> (RA:{" "}
                {alunoSelecionado.ra})
              </div>
            </div>

            <div className="mb-3">
              <label className="form-label">Limite Diário (opcional)</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                min="0"
                value={formConta.limite_diario}
                onChange={(e) =>
                  setFormConta({ ...formConta, limite_diario: e.target.value })
                }
                placeholder="Ex: 50.00"
              />
              <div className="form-text">
                Deixe em branco para não definir limite diário
              </div>
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalCriarConta(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Criar Conta
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Adicionar Crédito */}
      <Modal
        isOpen={modalCredito}
        onClose={() => setModalCredito(false)}
        title="Adicionar Crédito"
      >
        {alunoSelecionado && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              adicionarCredito();
            }}
          >
            <div className="mb-3">
              <label className="form-label">Aluno</label>
              <div className="form-control-plaintext">
                <strong>{alunoSelecionado.nome}</strong> (RA:{" "}
                {alunoSelecionado.ra})
              </div>
              {alunoSelecionado.conta && (
                <div className="small text-muted">
                  Saldo atual: {formatarMoeda(alunoSelecionado.conta.saldo)}
                </div>
              )}
            </div>

            <div className="mb-3">
              <label className="form-label">Valor *</label>
              <input
                type="number"
                className="form-control"
                step="0.01"
                min="0.01"
                value={formCredito.valor}
                onChange={(e) =>
                  setFormCredito({ ...formCredito, valor: e.target.value })
                }
                placeholder="Ex: 50.00"
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Descrição</label>
              <input
                type="text"
                className="form-control"
                value={formCredito.descricao}
                onChange={(e) =>
                  setFormCredito({ ...formCredito, descricao: e.target.value })
                }
                placeholder="Ex: Recarga mensal"
              />
            </div>

            <div className="d-flex justify-content-end gap-2">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => setModalCredito(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-success">
                Adicionar Crédito
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Modal Movimentações */}
      <Modal
        isOpen={modalMovimentacoes}
        onClose={() => setModalMovimentacoes(false)}
        title="Histórico de Movimentações"
        size="xl"
      >
        {alunoSelecionado && (
          <div>
            <div className="mb-3">
              <h6>
                {alunoSelecionado.nome} (RA: {alunoSelecionado.ra})
              </h6>
              {alunoSelecionado.conta && (
                <div className="text-muted">
                  Saldo atual: {formatarMoeda(alunoSelecionado.conta.saldo)}
                </div>
              )}
            </div>

            {loadingMovimentacoes ? (
              <div className="text-center py-4">
                <div className="spinner-border" role="status">
                  <span className="visually-hidden">Carregando...</span>
                </div>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-sm">
                  <thead className="table-light">
                    <tr>
                      <th>Data</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Descrição</th>
                    </tr>
                  </thead>
                  <tbody>
                    {movimentacoes.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center text-muted py-4">
                          Nenhuma movimentação encontrada
                        </td>
                      </tr>
                    ) : (
                      movimentacoes.map((mov) => (
                        <tr key={mov.id}>
                          <td>{formatarData(mov.data_movimentacao)}</td>
                          <td>
                            <span
                              className={`badge ${
                                mov.tipo_movimentacao === "credito"
                                  ? "bg-success"
                                  : "bg-danger"
                              }`}
                            >
                              {mov.tipo_movimentacao === "credito"
                                ? "Crédito"
                                : "Débito"}
                            </span>
                          </td>
                          <td>
                            <span
                              className={
                                mov.tipo_movimentacao === "credito"
                                  ? "text-success"
                                  : "text-danger"
                              }
                            >
                              {mov.tipo_movimentacao === "credito" ? "+" : "-"}
                              {formatarMoeda(mov.valor)}
                            </span>
                          </td>
                          <td>{mov.descricao}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
