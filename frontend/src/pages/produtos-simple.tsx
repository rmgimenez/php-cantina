import React, { useState } from 'react';
import { ProdutoForm } from '../components/produtos/produto-form-simple';

export function ProdutosPageSimple() {
  const [showForm, setShowForm] = useState(true);

  function handleProductCreated() {
    alert('Produto criado com sucesso!');
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Gestão de Produtos - Demo</h1>
      
      <div style={{ 
        backgroundColor: '#e3f2fd',
        padding: '1rem',
        borderRadius: '4px',
        marginBottom: '2rem',
        border: '1px solid #2196f3'
      }}>
        <p><strong>Tela de Cadastro de Produtos</strong></p>
        <p>Esta é uma demonstração da tela de cadastro de produtos da cantina escolar.</p>
        <p>Funcionalidades implementadas:</p>
        <ul>
          <li>Formulário completo de cadastro de produtos</li>
          <li>Validação de campos obrigatórios</li>
          <li>Seleção de tipos de produtos</li>
          <li>Campos para estoque e preço</li>
          <li>Interface responsiva e intuitiva</li>
        </ul>
      </div>

      {showForm && (
        <ProdutoForm 
          onSuccess={handleProductCreated}
        />
      )}
    </div>
  );
}