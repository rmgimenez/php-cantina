import React, { useState } from 'react';
import { ProdutoForm } from '../components/produtos/produto-form';
import { ProdutoList } from '../components/produtos/produto-list';
import { Produto } from '../lib/produtos-service';

export function ProdutosPage() {
  const [activeTab, setActiveTab] = useState<'cadastro' | 'lista'>('cadastro');
  const [refreshList, setRefreshList] = useState(0);

  function handleProductCreated() {
    // Força a atualização da lista
    setRefreshList(prev => prev + 1);
    // Muda para a aba de listagem
    setActiveTab('lista');
  }

  function handleEditProduct(produto: Produto) {
    // Por enquanto, apenas muda para a aba de cadastro
    // Em uma implementação completa, seria necessário implementar a edição
    setActiveTab('cadastro');
  }

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Gestão de Produtos</h1>
      
      {/* Navegação */}
      <div style={{ 
        borderBottom: '1px solid #ddd', 
        marginBottom: '2rem',
        display: 'flex',
        gap: '0'
      }}>
        <button
          onClick={() => setActiveTab('cadastro')}
          style={{
            padding: '1rem 2rem',
            backgroundColor: activeTab === 'cadastro' ? '#007bff' : 'transparent',
            color: activeTab === 'cadastro' ? 'white' : '#007bff',
            border: '1px solid #007bff',
            borderBottom: activeTab === 'cadastro' ? '1px solid #007bff' : '1px solid #ddd',
            borderTopLeftRadius: '4px',
            borderTopRightRadius: activeTab === 'cadastro' ? '4px' : '0',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
            cursor: 'pointer',
            marginBottom: '-1px'
          }}
        >
          Cadastrar Produto
        </button>
        
        <button
          onClick={() => setActiveTab('lista')}
          style={{
            padding: '1rem 2rem',
            backgroundColor: activeTab === 'lista' ? '#007bff' : 'transparent',
            color: activeTab === 'lista' ? 'white' : '#007bff',
            border: '1px solid #007bff',
            borderLeft: '0',
            borderBottom: activeTab === 'lista' ? '1px solid #007bff' : '1px solid #ddd',
            borderTopLeftRadius: '0',
            borderTopRightRadius: '4px',
            borderBottomLeftRadius: '0',
            borderBottomRightRadius: '0',
            cursor: 'pointer',
            marginBottom: '-1px'
          }}
        >
          Lista de Produtos
        </button>
      </div>

      {/* Conteúdo */}
      {activeTab === 'cadastro' && (
        <ProdutoForm 
          onSuccess={handleProductCreated}
        />
      )}
      
      {activeTab === 'lista' && (
        <ProdutoList 
          key={refreshList} // Força re-render quando refreshList muda
          onEdit={handleEditProduct}
        />
      )}
    </div>
  );
}