'use client';

import React, { useState } from 'react';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Erro');
        return;
      }
      // redirect to dashboard
      window.location.href = '/dashboard';
    } catch (err) {
      setError('Erro de rede');
    }
  }

  return (
    <div className='container mt-5'>
      <div className='row justify-content-center'>
        <div className='col-md-6'>
          <div className='card'>
            <div className='card-body'>
              <h3 className='card-title'>Login Funcionário</h3>
              {error && <div className='alert alert-danger'>{error}</div>}
              <form onSubmit={handleSubmit}>
                <div className='mb-3'>
                  <label className='form-label'>Usuário</label>
                  <input
                    className='form-control'
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                </div>
                <div className='mb-3'>
                  <label className='form-label'>Senha</label>
                  <input
                    type='password'
                    className='form-control'
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <button className='btn btn-primary' type='submit'>
                  Entrar
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
