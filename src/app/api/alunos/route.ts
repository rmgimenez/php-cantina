import { NextRequest, NextResponse } from "next/server";
import { parse } from "cookie";
import {
  obterAlunosAtivos,
  obterAlunosComContas,
  buscarAlunosPorNome,
  obterAlunoPorRA,
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
    // Verificar autenticação
    const usuario = autenticar(request);
    if (!usuario) {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const ra = searchParams.get("ra");
    const nome = searchParams.get("nome");
    const comContas = searchParams.get("com_contas") === "true";

    // Buscar por RA específico
    if (ra) {
      const aluno = await obterAlunoPorRA(parseInt(ra));
      if (!aluno) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }
      return NextResponse.json(aluno);
    }

    // Buscar por nome
    if (nome) {
      const alunos = await buscarAlunosPorNome(nome);
      return NextResponse.json(alunos);
    }

    // Listar todos os alunos
    if (comContas) {
      const alunos = await obterAlunosComContas();
      return NextResponse.json(alunos);
    } else {
      const alunos = await obterAlunosAtivos();
      return NextResponse.json(alunos);
    }
  } catch (error) {
    console.error("Erro ao buscar alunos:", error);
    return NextResponse.json(
      { error: "internal_error", message: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
