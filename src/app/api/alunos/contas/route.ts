import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import {
  obterContaAluno,
  criarContaAluno,
  adicionarCreditoAluno,
  obterMovimentacoesAluno,
  obterSaldoAluno,
  atualizarLimiteDiario,
  verificarLimiteGasto,
} from "@/lib/alunos";
import { verifyToken } from "@/lib/auth/tokens";

function autenticar(request: Request) {
  const cookie = request.headers.get("cookie") || "";
  const cookies = parse(cookie);
  const token = cookies["cant_token"];
  if (!token) return null;
  try {
    return verifyToken(token) as any;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    const usuario = autenticar(request);
    if (!usuario) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ra = searchParams.get("ra");
    const acao = searchParams.get("acao");

    if (!ra) {
      return NextResponse.json({ error: "ra_required" }, { status: 400 });
    }

    const raNumber = parseInt(ra);

    switch (acao) {
      case "saldo":
        const saldo = await obterSaldoAluno(raNumber);
        return NextResponse.json({ saldo });

      case "movimentacoes":
        const limite = parseInt(searchParams.get("limite") || "50");
        const offset = parseInt(searchParams.get("offset") || "0");
        const movimentacoes = await obterMovimentacoesAluno(
          raNumber,
          limite,
          offset
        );
        return NextResponse.json({ movimentacoes });

      case "verificar_limite":
        const valor = parseFloat(searchParams.get("valor") || "0");
        if (valor <= 0) {
          return NextResponse.json({ error: "valor_invalid" }, { status: 400 });
        }
        const resultado = await verificarLimiteGasto(raNumber, valor);
        return NextResponse.json(resultado);

      default:
        // Obter conta completa
        const conta = await obterContaAluno(raNumber);
        if (!conta) {
          return NextResponse.json(
            { error: "conta_not_found" },
            { status: 404 }
          );
        }
        return NextResponse.json(conta);
    }
  } catch (error) {
    console.error("Erro na API de contas:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const usuario = autenticar(request);
    if (!usuario) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    // Apenas administradores e atendentes podem gerenciar contas
    if (!["administrador", "atendente"].includes(usuario.role)) {
      return NextResponse.json({ error: "forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { ra, acao, valor, descricao, limite_diario } = body;

    if (!ra) {
      return NextResponse.json({ error: "ra_required" }, { status: 400 });
    }

    const raNumber = parseInt(ra);

    switch (acao) {
      case "criar_conta":
        const novaConta = await criarContaAluno(raNumber, limite_diario);
        return NextResponse.json(novaConta, { status: 201 });

      case "adicionar_credito":
        if (!valor || valor <= 0) {
          return NextResponse.json({ error: "valor_invalid" }, { status: 400 });
        }

        const sucesso = await adicionarCreditoAluno(
          raNumber,
          parseFloat(valor),
          usuario.id,
          descricao || "Adição de crédito"
        );

        if (!sucesso) {
          return NextResponse.json(
            { error: "failed_to_add_credit" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Crédito adicionado com sucesso",
        });

      case "atualizar_limite":
        const sucessoLimite = await atualizarLimiteDiario(
          raNumber,
          limite_diario
        );
        if (!sucessoLimite) {
          return NextResponse.json(
            { error: "failed_to_update_limit" },
            { status: 500 }
          );
        }

        return NextResponse.json({
          success: true,
          message: "Limite diário atualizado com sucesso",
        });

      default:
        return NextResponse.json({ error: "acao_invalid" }, { status: 400 });
    }
  } catch (error) {
    console.error("Erro ao processar requisição:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
