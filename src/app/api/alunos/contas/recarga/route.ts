import { NextRequest, NextResponse } from "next/server";
import {
  adicionarCreditoAluno,
  obterContaAluno,
  criarContaAluno,
} from "@/lib/alunos";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ra, valor, descricao, forma_pagamento, referencia } = body;

    if (!ra || !valor || valor <= 0) {
      return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
    }

    const raNumber = parseInt(ra);
    const valorNumber = parseFloat(valor);

    // Garantir que exista conta (cria se não existir)
    const conta = await obterContaAluno(raNumber);
    if (!conta) {
      await criarContaAluno(raNumber);
    }

    // registrar crédito usando procedure; funcionário cantina id é null (responsável paga externamente)
    const sucesso = await adicionarCreditoAluno(
      raNumber,
      valorNumber,
      null,
      descricao ||
        `Recarga: ${forma_pagamento || "desconhecida"}${
          referencia ? " - " + referencia : ""
        }`
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
  } catch (error) {
    console.error("Erro na rota de recarga:", error);
    return NextResponse.json({ error: "internal_error" }, { status: 500 });
  }
}
