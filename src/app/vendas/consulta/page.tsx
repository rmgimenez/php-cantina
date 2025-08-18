import { Metadata } from "next";
import ConsultaVendasClient from "./consulta-client";

export const metadata: Metadata = {
  title: "Consulta de Vendas - Sistema Cantina",
  description: "Consulta e relatórios de vendas da cantina escolar",
};

export default function ConsultaVendasPage() {
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Consulta de Vendas</h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <a href="/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item">
              <a href="/vendas">Vendas</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Consulta
            </li>
          </ol>
        </nav>
      </div>

      <ConsultaVendasClient />
    </div>
  );
}
