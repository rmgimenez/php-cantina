'use client';

import { useState } from 'react';
import { FaSearch, FaUserCheck } from 'react-icons/fa';

export default function RestricoesClient() {
  const [buscaAluno, setBuscaAluno] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const buscarAluno = async () => {
    if (!buscaAluno.trim()) {
      setMessage('Digite o RA ou nome do aluno para buscar');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Simular busca
      setMessage('Funcionalidade em desenvolvimento');
    } catch (error) {
      setMessage('Erro ao buscar aluno');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='container-fluid py-4'>
      <div className='d-flex justify-content-between align-items-center mb-4'>
        <h2>
          <FaUserCheck className='me-2' />
          Restrições e Observações de Alunos
        </h2>
      </div>

      {message && <div className='alert alert-info'>{message}</div>}

      {/* Busca de Aluno */}
      <div className='card mb-4'>
        <div className='card-header'>
          <h5 className='mb-0'>
            <FaSearch className='me-2' />
            Buscar Aluno
          </h5>
        </div>
        <div className='card-body'>
          <div className='row g-3'>
            <div className='col-md-8'>
              <label className='form-label'>RA ou Nome do Aluno</label>
              <input
                type='text'
                className='form-control'
                placeholder='Digite o RA ou nome do aluno...'
                value={buscaAluno}
                onChange={(e) => setBuscaAluno(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && buscarAluno()}
              />
            </div>
            <div className='col-md-4 d-flex align-items-end'>
              <button className='btn btn-primary' onClick={buscarAluno} disabled={loading}>
                <FaSearch className='me-2' />
                {loading ? 'Buscando...' : 'Buscar'}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className='card'>
        <div className='card-body'>
          <div className='text-center text-muted py-5'>
            <FaUserCheck size={64} className='mb-3' />
            <h4>Gestão de Restrições</h4>
            <p>
              Aqui você pode configurar restrições de produtos para alunos específicos.
              <br />
              Use o campo de busca acima para encontrar um aluno e gerenciar suas restrições.
            </p>
            <div className='mt-4'>
              <h6>Como usar:</h6>
              <ol
                className='list-unstyled text-start'
                style={{ maxWidth: '600px', margin: '0 auto' }}
              >
                <li>1. Busque o aluno pelo RA ou nome</li>
                <li>2. Selecione o aluno da lista</li>
                <li>3. Configure as restrições de produtos ou categorias</li>
                <li>4. Adicione observações especiais se necessário</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
