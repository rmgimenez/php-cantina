"use client";

import { useState, useEffect } from "react";
import {
  FaShoppingCart,
  FaPlus,
  FaMinus,
  FaTrash,
  FaSearch,
  FaUser,
  FaUserTie,
  FaMoneyBillWave,
} from "react-icons/fa";

interface Produto {
  id: number;
  nome: string;
  preco: string;
  estoqueAtual: number;
  codigoBarras?: string;
}

interface Cliente {
  tipo: "aluno" | "funcionario" | "dinheiro";
  id?: number;
  nome?: string;
  ra?: number;
  codigo?: number;
  saldo?: number;
  limiteDiario?: number;
  gastoHoje?: number;
}

interface ItemCarrinho {
  produto: Produto;
  quantidade: number;
  subtotal: number;
}

export default function VendasClient() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [produtosFiltrados, setProdutosFiltrados] = useState<Produto[]>([]);
  const [carrinho, setCarrinho] = useState<ItemCarrinho[]>([]);
  const [cliente, setCliente] = useState<Cliente>({ tipo: "dinheiro" });
  const [buscarProduto, setBuscarProduto] = useState("");
  const [buscarCliente, setBuscarCliente] = useState("");
  const [clientesEncontrados, setClientesEncontrados] = useState<any[]>([]);
  const [formaPagamento, setFormaPagamento] = useState<
    "conta" | "dinheiro" | "cartao" | "pix"
  >("conta");
  const [valorRecebido, setValorRecebido] = useState<string>("");
  const [observacoes, setObservacoes] = useState("");
  const [loading, setLoading] = useState(false);
  const [codigoBarras, setCodigoBarras] = useState("");

  const valorTotal = carrinho.reduce((total, item) => total + item.subtotal, 0);
  const valorTroco =
    formaPagamento === "dinheiro" && valorRecebido
      ? Math.max(0, parseFloat(valorRecebido) - valorTotal)
      : 0;

  useEffect(() => {
    carregarProdutos();
  }, []);

  useEffect(() => {
    if (buscarProduto) {
      const filtrados = produtos.filter(
        (p) =>
          p.nome.toLowerCase().includes(buscarProduto.toLowerCase()) ||
          (p.codigoBarras && p.codigoBarras.includes(buscarProduto))
      );
      setProdutosFiltrados(filtrados);
    } else {
      setProdutosFiltrados(produtos);
    }
  }, [buscarProduto, produtos]);

  useEffect(() => {
    if (codigoBarras) {
      const produto = produtos.find((p) => p.codigoBarras === codigoBarras);
      if (produto) {
        adicionarAoCarrinho(produto);
        setCodigoBarras("");
      }
    }
  }, [codigoBarras, produtos]);

  const carregarProdutos = async () => {
    try {
      const response = await fetch("/api/vendas?action=produtos");
      const data = await response.json();
      if (data.success) {
        setProdutos(data.data);
        setProdutosFiltrados(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar produtos:", error);
    }
  };

  const buscarClientes = async (
    tipo: "aluno" | "funcionario",
    nome: string
  ) => {
    if (!nome || nome.length < 2) {
      setClientesEncontrados([]);
      return;
    }

    try {
      const response = await fetch(
        `/api/vendas?action=${
          tipo === "aluno" ? "alunos" : "funcionarios"
        }&nome=${encodeURIComponent(nome)}`
      );
      const data = await response.json();
      if (data.success) {
        setClientesEncontrados(data.data);
      }
    } catch (error) {
      console.error("Erro ao buscar clientes:", error);
    }
  };

  const selecionarCliente = async (clienteData: any) => {
    if (cliente.tipo === "aluno") {
      setCliente({
        tipo: "aluno",
        id: clienteData.ra,
        ra: clienteData.ra,
        nome: clienteData.nome,
      });

      // Buscar dados da conta do aluno
      try {
        const response = await fetch(
          `/api/vendas?action=aluno&ra=${clienteData.ra}`
        );
        const data = await response.json();
        if (data.success && data.data) {
          // Pode incluir saldo e limite se disponível
        }
      } catch (error) {
        console.error("Erro ao buscar dados do aluno:", error);
      }
    } else {
      setCliente({
        tipo: "funcionario",
        id: clienteData.codigo,
        codigo: clienteData.codigo,
        nome: clienteData.nome,
      });
    }

    setClientesEncontrados([]);
    setBuscarCliente("");
  };

  const adicionarAoCarrinho = (produto: Produto) => {
    if (produto.estoqueAtual <= 0) {
      alert("Produto sem estoque!");
      return;
    }

    const itemExistente = carrinho.find(
      (item) => item.produto.id === produto.id
    );

    if (itemExistente) {
      if (itemExistente.quantidade >= produto.estoqueAtual) {
        alert("Quantidade máxima atingida para este produto!");
        return;
      }

      setCarrinho(
        carrinho.map((item) =>
          item.produto.id === produto.id
            ? {
                ...item,
                quantidade: item.quantidade + 1,
                subtotal: (item.quantidade + 1) * parseFloat(produto.preco),
              }
            : item
        )
      );
    } else {
      setCarrinho([
        ...carrinho,
        {
          produto,
          quantidade: 1,
          subtotal: parseFloat(produto.preco),
        },
      ]);
    }
  };

  const alterarQuantidade = (produtoId: number, novaQuantidade: number) => {
    if (novaQuantidade <= 0) {
      removerDoCarrinho(produtoId);
      return;
    }

    const produto = produtos.find((p) => p.id === produtoId);
    if (!produto) return;

    if (novaQuantidade > produto.estoqueAtual) {
      alert("Quantidade não pode ser maior que o estoque disponível!");
      return;
    }

    setCarrinho(
      carrinho.map((item) =>
        item.produto.id === produtoId
          ? {
              ...item,
              quantidade: novaQuantidade,
              subtotal: novaQuantidade * parseFloat(item.produto.preco),
            }
          : item
      )
    );
  };

  const removerDoCarrinho = (produtoId: number) => {
    setCarrinho(carrinho.filter((item) => item.produto.id !== produtoId));
  };

  const verificarVenda = async () => {
    if (!cliente.id && cliente.tipo !== "dinheiro") {
      alert("Selecione um cliente!");
      return false;
    }

    if (carrinho.length === 0) {
      alert("Adicione produtos ao carrinho!");
      return false;
    }

    if (
      formaPagamento === "dinheiro" &&
      (!valorRecebido || parseFloat(valorRecebido) < valorTotal)
    ) {
      alert("Valor recebido deve ser informado e suficiente!");
      return false;
    }

    // Verificar condições de venda
    if (cliente.tipo !== "dinheiro" && cliente.id) {
      try {
        const response = await fetch(
          `/api/vendas?action=verificar&tipoCliente=${cliente.tipo}&valorTotal=${valorTotal}&clienteId=${cliente.id}`
        );
        const data = await response.json();

        if (!data.success || !data.data.podeVender) {
          alert(data.data.motivo || "Venda não permitida");
          return false;
        }
      } catch (error) {
        console.error("Erro ao verificar condições:", error);
        alert("Erro ao verificar condições da venda");
        return false;
      }
    }

    return true;
  };

  const finalizarVenda = async () => {
    if (!(await verificarVenda())) return;

    setLoading(true);

    try {
      const itensVenda = carrinho.map((item) => ({
        produtoId: item.produto.id,
        nomeProduto: item.produto.nome,
        quantidade: item.quantidade,
        precoUnitario: parseFloat(item.produto.preco),
        subtotal: item.subtotal,
      }));

      const vendaData: any = {
        tipoCliente: cliente.tipo,
        valorTotal,
        formaPagamento,
        observacoes,
        itens: itensVenda,
      };

      if (cliente.tipo === "aluno") {
        vendaData.raAluno = cliente.ra;
      } else if (cliente.tipo === "funcionario") {
        vendaData.codigoFuncionario = cliente.codigo;
      }

      if (formaPagamento === "dinheiro") {
        vendaData.valorRecebido = parseFloat(valorRecebido);
      }

      const response = await fetch("/api/vendas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(vendaData),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          `Venda realizada com sucesso! ${
            valorTroco > 0 ? `Troco: R$ ${valorTroco.toFixed(2)}` : ""
          }`
        );

        // Limpar formulário
        setCarrinho([]);
        setCliente({ tipo: "dinheiro" });
        setFormaPagamento("conta");
        setValorRecebido("");
        setObservacoes("");
        setBuscarCliente("");

        // Recarregar produtos para atualizar estoque
        carregarProdutos();
      } else {
        alert(data.error || "Erro ao realizar venda");
      }
    } catch (error) {
      console.error("Erro ao finalizar venda:", error);
      alert("Erro ao finalizar venda");
    } finally {
      setLoading(false);
    }
  };

  const limparVenda = () => {
    setCarrinho([]);
    setCliente({ tipo: "dinheiro" });
    setFormaPagamento("conta");
    setValorRecebido("");
    setObservacoes("");
    setBuscarCliente("");
    setClientesEncontrados([]);
  };

  return (
    <div className="container-fluid">
      <div className="row">
        {/* Coluna de Produtos */}
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>
                <FaShoppingCart className="me-2" />
                Produtos
              </h5>
            </div>
            <div className="card-body">
              {/* Busca por código de barras */}
              <div className="mb-3">
                <label className="form-label">Código de Barras</label>
                <input
                  type="text"
                  className="form-control"
                  value={codigoBarras}
                  onChange={(e) => setCodigoBarras(e.target.value)}
                  placeholder="Digite ou escaneie o código de barras"
                />
              </div>

              {/* Busca por nome */}
              <div className="mb-3">
                <label className="form-label">Buscar Produto</label>
                <input
                  type="text"
                  className="form-control"
                  value={buscarProduto}
                  onChange={(e) => setBuscarProduto(e.target.value)}
                  placeholder="Digite o nome do produto"
                />
              </div>

              {/* Lista de produtos */}
              <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                {produtosFiltrados.map((produto) => (
                  <div
                    key={produto.id}
                    className="card mb-2 cursor-pointer"
                    onClick={() => adicionarAoCarrinho(produto)}
                    style={{ cursor: "pointer" }}
                  >
                    <div className="card-body p-2">
                      <div className="d-flex justify-content-between align-items-center">
                        <div>
                          <strong>{produto.nome}</strong>
                          <br />
                          <small className="text-muted">
                            R$ {parseFloat(produto.preco).toFixed(2)} | Estoque:{" "}
                            {produto.estoqueAtual}
                            {produto.codigoBarras &&
                              ` | ${produto.codigoBarras}`}
                          </small>
                        </div>
                        <button
                          className="btn btn-primary btn-sm"
                          disabled={produto.estoqueAtual <= 0}
                        >
                          <FaPlus />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Coluna de Carrinho e Venda */}
        <div className="col-md-6">
          {/* Seleção de Cliente */}
          <div className="card mb-3">
            <div className="card-header">
              <h6>Cliente</h6>
            </div>
            <div className="card-body">
              {/* Tipo de Cliente */}
              <div className="mb-3">
                <div className="btn-group w-100" role="group">
                  <input
                    type="radio"
                    className="btn-check"
                    name="tipoCliente"
                    id="cliente-aluno"
                    checked={cliente.tipo === "aluno"}
                    onChange={() => {
                      setCliente({ tipo: "aluno" });
                      setBuscarCliente("");
                      setClientesEncontrados([]);
                    }}
                  />
                  <label
                    className="btn btn-outline-primary"
                    htmlFor="cliente-aluno"
                  >
                    <FaUser className="me-1" />
                    Aluno
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="tipoCliente"
                    id="cliente-funcionario"
                    checked={cliente.tipo === "funcionario"}
                    onChange={() => {
                      setCliente({ tipo: "funcionario" });
                      setBuscarCliente("");
                      setClientesEncontrados([]);
                    }}
                  />
                  <label
                    className="btn btn-outline-primary"
                    htmlFor="cliente-funcionario"
                  >
                    <FaUserTie className="me-1" />
                    Funcionário
                  </label>

                  <input
                    type="radio"
                    className="btn-check"
                    name="tipoCliente"
                    id="cliente-dinheiro"
                    checked={cliente.tipo === "dinheiro"}
                    onChange={() => {
                      setCliente({ tipo: "dinheiro" });
                      setBuscarCliente("");
                      setClientesEncontrados([]);
                    }}
                  />
                  <label
                    className="btn btn-outline-success"
                    htmlFor="cliente-dinheiro"
                  >
                    <FaMoneyBillWave className="me-1" />À Vista
                  </label>
                </div>
              </div>

              {/* Busca de Cliente */}
              {cliente.tipo !== "dinheiro" && (
                <div className="mb-3 position-relative">
                  <input
                    type="text"
                    className="form-control"
                    value={cliente.nome || buscarCliente}
                    onChange={(e) => {
                      setBuscarCliente(e.target.value);
                      if (cliente.tipo !== "dinheiro") {
                        buscarClientes(cliente.tipo, e.target.value);
                      }
                    }}
                    placeholder={`Buscar ${
                      cliente.tipo === "aluno" ? "aluno" : "funcionário"
                    }`}
                    disabled={!!cliente.nome}
                  />

                  {cliente.nome && (
                    <button
                      className="btn btn-sm btn-outline-secondary position-absolute top-0 end-0"
                      style={{ marginTop: "2px", marginRight: "2px" }}
                      onClick={() => {
                        setCliente({ tipo: cliente.tipo });
                        setBuscarCliente("");
                      }}
                    >
                      <FaTrash />
                    </button>
                  )}

                  {/* Lista de clientes encontrados */}
                  {clientesEncontrados.length > 0 && (
                    <div
                      className="position-absolute w-100 bg-white border border-top-0 rounded-bottom shadow-sm"
                      style={{ zIndex: 1000 }}
                    >
                      {clientesEncontrados.map((clienteItem, index) => (
                        <div
                          key={index}
                          className="p-2 border-bottom cursor-pointer hover-bg-light"
                          onClick={() => selecionarCliente(clienteItem)}
                          style={{ cursor: "pointer" }}
                        >
                          <strong>{clienteItem.nome}</strong>
                          <br />
                          <small className="text-muted">
                            {cliente.tipo === "aluno"
                              ? `RA: ${clienteItem.ra}`
                              : `Código: ${clienteItem.codigo}`}
                          </small>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Carrinho */}
          <div className="card mb-3">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6>Carrinho ({carrinho.length} itens)</h6>
              {carrinho.length > 0 && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={limparVenda}
                >
                  <FaTrash />
                </button>
              )}
            </div>
            <div className="card-body">
              {carrinho.length === 0 ? (
                <p className="text-muted text-center">
                  Nenhum produto adicionado
                </p>
              ) : (
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  {carrinho.map((item) => (
                    <div
                      key={item.produto.id}
                      className="d-flex justify-content-between align-items-center mb-2 p-2 border rounded"
                    >
                      <div className="flex-grow-1">
                        <strong>{item.produto.nome}</strong>
                        <br />
                        <small>
                          R$ {parseFloat(item.produto.preco).toFixed(2)} cada
                        </small>
                      </div>
                      <div className="d-flex align-items-center">
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            alterarQuantidade(
                              item.produto.id,
                              item.quantidade - 1
                            )
                          }
                        >
                          <FaMinus />
                        </button>
                        <span className="mx-2">{item.quantidade}</span>
                        <button
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() =>
                            alterarQuantidade(
                              item.produto.id,
                              item.quantidade + 1
                            )
                          }
                        >
                          <FaPlus />
                        </button>
                        <span className="ms-2 fw-bold">
                          R$ {item.subtotal.toFixed(2)}
                        </span>
                        <button
                          className="btn btn-sm btn-outline-danger ms-2"
                          onClick={() => removerDoCarrinho(item.produto.id)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Finalização */}
          {carrinho.length > 0 && (
            <div className="card">
              <div className="card-header">
                <h6>Finalizar Venda</h6>
              </div>
              <div className="card-body">
                {/* Forma de Pagamento */}
                <div className="mb-3">
                  <label className="form-label">Forma de Pagamento</label>
                  <select
                    className="form-select"
                    value={formaPagamento}
                    onChange={(e) => setFormaPagamento(e.target.value as any)}
                  >
                    <option value="conta">Conta</option>
                    <option value="dinheiro">Dinheiro</option>
                    <option value="cartao">Cartão</option>
                    <option value="pix">PIX</option>
                  </select>
                </div>

                {/* Valor Recebido (apenas para dinheiro) */}
                {formaPagamento === "dinheiro" && (
                  <div className="mb-3">
                    <label className="form-label">Valor Recebido</label>
                    <input
                      type="number"
                      className="form-control"
                      value={valorRecebido}
                      onChange={(e) => setValorRecebido(e.target.value)}
                      min={valorTotal}
                      step="0.01"
                    />
                    {valorTroco > 0 && (
                      <small className="text-success">
                        Troco: R$ {valorTroco.toFixed(2)}
                      </small>
                    )}
                  </div>
                )}

                {/* Observações */}
                <div className="mb-3">
                  <label className="form-label">Observações</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={observacoes}
                    onChange={(e) => setObservacoes(e.target.value)}
                    placeholder="Observações opcionais"
                  />
                </div>

                {/* Total */}
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5>Total: R$ {valorTotal.toFixed(2)}</h5>
                </div>

                {/* Botões */}
                <div className="d-grid gap-2">
                  <button
                    className="btn btn-success btn-lg"
                    onClick={finalizarVenda}
                    disabled={loading}
                  >
                    {loading ? "Processando..." : "Finalizar Venda"}
                  </button>
                  <button
                    className="btn btn-outline-secondary"
                    onClick={limparVenda}
                    disabled={loading}
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
