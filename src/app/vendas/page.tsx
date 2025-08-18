import { Metadata } from "next";
import VendasClient from "./vendas-client";

export const metadata: Metadata = {
  title: "Vendas - Sistema Cantina",
  description: "Sistema de vendas da cantina escolar",
};

export default function VendasPage() {
  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 className="h3 mb-0">Nova Venda</h1>
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb mb-0">
            <li className="breadcrumb-item">
              <a href="/dashboard">Dashboard</a>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Vendas
            </li>
          </ol>
        </nav>
      </div>

      <VendasClient />
    </div>
  );
}
