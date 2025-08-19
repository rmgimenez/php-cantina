import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  FaBoxes,
  FaCashRegister,
  FaChartBar,
  FaCog,
  FaCoins,
  FaShoppingCart,
  FaUsers,
  FaUtensils,
  FaWarehouse,
} from "react-icons/fa";
import Navbar from "../../components/layout/navbar";
import DashboardCard from "../../components/ui/dashboard-card";
import { verifyToken } from "../../lib/auth/tokens";

type TokenPayload = {
  username: string;
  role: "administrador" | "atendente" | "estoquista";
  iat?: number;
  exp?: number;
};

async function getUser(): Promise<TokenPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("cant_token")?.value;
  if (!token) return null;
  try {
    const payload = verifyToken(token) as TokenPayload;
    return payload;
  } catch (err) {
    return null;
  }
}

export default async function DashboardPage() {
  const user = await getUser();
  if (!user) {
    redirect("/login");
  }

  const canSell = ["administrador", "atendente"].includes(user.role);
  const canManageStock = ["administrador", "estoquista"].includes(user.role);
  const isAdmin = user.role === "administrador";

  return (
    <>
      <Navbar user={user} />
      <div className="container py-4">
        {/* Header */}
        <div className="row mb-4">
          <div className="col-12">
            <div className="card dashboard-card">
              <div className="card-body text-center py-4">
                <h1 className="h3 mb-2 text-primary">
                  🍽️ Dashboard da Cantina
                </h1>
                <p className="text-muted mb-0">
                  Bem-vindo, <strong>{user.username}</strong>! Você está logado
                  como <span className="badge bg-primary">{user.role}</span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mb-4">
          <div className="col-md-3 mb-3">
            <div className="card stats-card h-100">
              <div className="card-body text-center">
                <FaCoins className="text-primary mb-2" size={24} />
                <h6 className="card-title text-muted">Vendas Hoje</h6>
                <h4 className="text-primary mb-0">R$ --</h4>
                <small className="text-muted">-- transações</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stats-card h-100">
              <div className="card-body text-center">
                <FaCashRegister className="text-success mb-2" size={24} />
                <h6 className="card-title text-muted">Caixas Abertos</h6>
                <h4 className="text-success mb-0">--</h4>
                <small className="text-muted">operando</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stats-card h-100">
              <div className="card-body text-center">
                <FaWarehouse className="text-warning mb-2" size={24} />
                <h6 className="card-title text-muted">Estoque Baixo</h6>
                <h4 className="text-warning mb-0">--</h4>
                <small className="text-muted">itens</small>
              </div>
            </div>
          </div>
          <div className="col-md-3 mb-3">
            <div className="card stats-card h-100">
              <div className="card-body text-center">
                <FaUsers className="text-info mb-2" size={24} />
                <h6 className="card-title text-muted">Contas Ativas</h6>
                <h4 className="text-info mb-0">--</h4>
                <small className="text-muted">alunos</small>
              </div>
            </div>
          </div>
        </div>

        {/* Main Actions */}
        <div className="row">
          <div className="col-12 mb-3">
            <h5 className="text-primary">Ações Principais</h5>
            <hr />
          </div>

          <DashboardCard
            title="Registrar Venda"
            description="Iniciar processo de venda para aluno, funcionário ou cliente avulso."
            icon={<FaShoppingCart size={20} />}
            iconClass="icon-vendas"
            href={canSell ? "/vendas" : undefined}
            disabled={!canSell}
            buttonText={canSell ? "Nova Venda" : "Sem Permissão"}
            buttonVariant="primary"
          />

          <DashboardCard
            title="Gerenciar Produtos"
            description="Cadastrar produtos, tipos e gerenciar informações do catálogo."
            icon={<FaBoxes size={20} />}
            iconClass="icon-produtos"
            href="/produtos"
            buttonText="Gerenciar"
            buttonVariant="success"
          />

          <DashboardCard
            title="Controle de Estoque"
            description="Movimentações, ajustes de estoque e alertas de produtos em falta."
            icon={<FaWarehouse size={20} />}
            iconClass="icon-estoque"
            href={canManageStock ? "/estoque" : undefined}
            disabled={!canManageStock}
            buttonText={canManageStock ? "Ver Estoque" : "Sem Permissão"}
            buttonVariant="warning"
          />

          <DashboardCard
            title="Gerenciamento de Caixas"
            description="Abrir e fechar caixas, controlar fluxo de vendas e relatórios financeiros."
            icon={<FaCashRegister size={20} />}
            iconClass="icon-caixas"
            href={canSell ? "/caixas" : undefined}
            disabled={!canSell}
            buttonText={canSell ? "Gerenciar Caixas" : "Sem Permissão"}
            buttonVariant="primary"
          />

          <DashboardCard
            title="Contas de Alunos"
            description="Gerenciar contas, adicionar crédito e consultar saldos dos alunos."
            icon={<FaUsers size={20} />}
            iconClass="icon-alunos"
            href={canSell ? "/alunos" : undefined}
            disabled={!canSell}
            buttonText={canSell ? "Gerenciar" : "Sem Permissão"}
            buttonVariant="info"
          />

          <DashboardCard
            title="Pacotes de Refeição"
            description="Consultar e registrar consumo de pacotes de alimentação dos alunos."
            icon={<FaUtensils size={20} />}
            iconClass="icon-pacotes"
            href="/pacotes"
            disabled={true}
            buttonText="Em Breve"
            buttonVariant="info"
          />

          <DashboardCard
            title="Relatórios"
            description="Vendas diárias, consumo por aluno e relatórios financeiros."
            icon={<FaChartBar size={20} />}
            iconClass="icon-relatorios"
            href={isAdmin ? "/relatorios" : undefined}
            disabled={!isAdmin}
            buttonText={isAdmin ? "Ver Relatórios" : "Apenas Admin"}
            buttonVariant="secondary"
          />

          <DashboardCard
            title="Administração"
            description="Gerenciar usuários, contas de alunos, limites e configurações do sistema."
            icon={<FaCog size={20} />}
            iconClass="icon-admin"
            href={isAdmin ? "/admin" : undefined}
            disabled={!isAdmin}
            buttonText={isAdmin ? "Configurar" : "Apenas Admin"}
            buttonVariant="dark"
          />
        </div>
      </div>
    </>
  );
}
