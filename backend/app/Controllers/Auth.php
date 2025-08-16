<?php

namespace App\Controllers;

use App\Models\FuncionarioCantinaModel;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * Controller de autenticação
 */
class Auth extends BaseApiController
{
    private FuncionarioCantinaModel $funcionarioModel;
    private string $jwtSecret;

    public function __construct()
    {
        $this->funcionarioModel = new FuncionarioCantinaModel();
        $this->jwtSecret = getenv('JWT_SECRET') ?: 'sua-chave-secreta-jwt-muito-segura-aqui';
    }

    /**
     * Login do funcionário da cantina
     * POST /api/auth/login
     */
    public function login()
    {
        // Validar dados de entrada
        $rules = [
            'usuario' => 'required|min_length[3]',
            'senha' => 'required|min_length[6]'
        ];

        if (!$this->validateInput($rules)) {
            return $this->respondValidationError($this->getValidationErrors());
        }

        $data = $this->getRequestData();
        $usuario = $data['usuario'];
        $senha = $data['senha'];

        try {
            // Buscar funcionário pelo usuário
            $funcionario = $this->funcionarioModel->findByUsuario($usuario);
            
            if (!$funcionario) {
                return $this->respondError('Usuário ou senha inválidos', 401);
            }

            // Verificar senha
            if (!$this->funcionarioModel->verificarSenha($senha, $funcionario['senha'])) {
                return $this->respondError('Usuário ou senha inválidos', 401);
            }

            // Gerar token JWT
            $payload = [
                'iss' => 'cantina-escolar',
                'aud' => 'cantina-escolar',
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60), // 24 horas
                'user_id' => $funcionario['id'],
                'usuario' => $funcionario['usuario'],
                'nome' => $funcionario['nome'],
                'tipo' => $funcionario['tipo']
            ];

            $token = JWT::encode($payload, $this->jwtSecret, 'HS256');

            // Atualizar último acesso
            $this->funcionarioModel->atualizarUltimoAcesso($funcionario['id']);

            // Retornar resposta de sucesso
            return $this->respondSuccess([
                'token' => $token,
                'funcionario' => [
                    'id' => $funcionario['id'],
                    'usuario' => $funcionario['usuario'],
                    'nome' => $funcionario['nome'],
                    'email' => $funcionario['email'],
                    'tipo' => $funcionario['tipo']
                ]
            ], 'Login realizado com sucesso');

        } catch (\Exception $e) {
            log_message('error', 'Erro no login: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Logout do funcionário
     * POST /api/auth/logout
     */
    public function logout()
    {
        // Em um sistema mais avançado, poderia invalidar o token
        // Por enquanto, apenas retorna sucesso
        return $this->respondSuccess(null, 'Logout realizado com sucesso');
    }

    /**
     * Retorna informações do usuário logado
     * GET /api/auth/me
     */
    public function me()
    {
        try {
            // Obter token do header
            $authHeader = $this->request->getHeaderLine('Authorization');
            
            if (empty($authHeader)) {
                return $this->respondUnauthorized('Token de acesso não fornecido');
            }

            // Extrair token
            $token = null;
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }

            if (empty($token)) {
                return $this->respondUnauthorized('Formato de token inválido');
            }

            // Decodificar token
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            
            // Buscar funcionário atualizado no banco
            $funcionario = $this->funcionarioModel->find($decoded->user_id);
            
            if (!$funcionario || !$funcionario['ativo']) {
                return $this->respondUnauthorized('Usuário inativo ou não encontrado');
            }

            return $this->respondSuccess([
                'id' => $funcionario['id'],
                'usuario' => $funcionario['usuario'],
                'nome' => $funcionario['nome'],
                'email' => $funcionario['email'],
                'tipo' => $funcionario['tipo']
            ]);

        } catch (\Firebase\JWT\ExpiredException $e) {
            return $this->respondUnauthorized('Token expirado');
        } catch (\Exception $e) {
            return $this->respondUnauthorized('Token inválido');
        }
    }

    /**
     * Refresh do token (opcional)
     * POST /api/auth/refresh
     */
    public function refresh()
    {
        try {
            // Obter token do header
            $authHeader = $this->request->getHeaderLine('Authorization');
            
            if (empty($authHeader)) {
                return $this->respondUnauthorized('Token de acesso não fornecido');
            }

            // Extrair token
            $token = null;
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }

            if (empty($token)) {
                return $this->respondUnauthorized('Formato de token inválido');
            }

            // Decodificar token (permitindo expirado)
            try {
                $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));
            } catch (\Firebase\JWT\ExpiredException $e) {
                // Token expirado, mas vamos verificar se ainda está dentro do período de refresh (opcional)
                // Por simplicidade, vamos retornar erro
                return $this->respondUnauthorized('Token expirado demais para refresh');
            }
            
            // Buscar funcionário
            $funcionario = $this->funcionarioModel->find($decoded->user_id);
            
            if (!$funcionario || !$funcionario['ativo']) {
                return $this->respondUnauthorized('Usuário inativo ou não encontrado');
            }

            // Gerar novo token
            $payload = [
                'iss' => 'cantina-escolar',
                'aud' => 'cantina-escolar',
                'iat' => time(),
                'exp' => time() + (24 * 60 * 60), // 24 horas
                'user_id' => $funcionario['id'],
                'usuario' => $funcionario['usuario'],
                'nome' => $funcionario['nome'],
                'tipo' => $funcionario['tipo']
            ];

            $newToken = JWT::encode($payload, $this->jwtSecret, 'HS256');

            return $this->respondSuccess([
                'token' => $newToken
            ], 'Token renovado com sucesso');

        } catch (\Exception $e) {
            return $this->respondUnauthorized('Token inválido');
        }
    }
}
