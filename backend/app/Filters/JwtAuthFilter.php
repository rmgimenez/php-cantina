<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Config\Services;

/**
 * Filtro de autenticação JWT
 */
class JwtAuthFilter implements FilterInterface
{
    /**
     * Chave secreta para JWT (deve vir do .env)
     */
    private string $jwtSecret;

    public function __construct()
    {
        // Valor padrão compatível com os testes automatizados
        $this->jwtSecret = getenv('JWT_SECRET') ?: 'sua-chave-jwt-super-secreta-para-cantina-escolar-2025';
    }

    /**
     * Executa antes da requisição
     */
    public function before(RequestInterface $request, $arguments = null)
    {
        try {
            // Obtém o token do header Authorization
            $authHeader = $request->getHeaderLine('Authorization');

            if (empty($authHeader)) {
                return $this->unauthorized('Token de acesso não fornecido');
            }

            // Verifica se o header tem o formato "Bearer token"
            $token = null;
            if (preg_match('/Bearer\s+(.*)$/i', $authHeader, $matches)) {
                $token = $matches[1];
            }

            if (empty($token)) {
                return $this->unauthorized('Formato de token inválido');
            }

            // Decodifica e valida o token
            $decoded = JWT::decode($token, new Key($this->jwtSecret, 'HS256'));

            // Verifica se o token não expirou
            if ($decoded->exp < time()) {
                return $this->unauthorized('Token expirado');
            }

            // Armazena informações do usuário de forma compatível com PHP 8.2+
            // Evita criar propriedades dinâmicas em IncomingRequest (deprecated)
            $GLOBALS['authenticated_user'] = $decoded;

            return $request;
        } catch (\Firebase\JWT\ExpiredException $e) {
            return $this->unauthorized('Token expirado');
        } catch (\Firebase\JWT\SignatureInvalidException $e) {
            return $this->unauthorized('Assinatura do token inválida');
        } catch (\Firebase\JWT\BeforeValidException $e) {
            return $this->unauthorized('Token ainda não é válido');
        } catch (\Exception $e) {
            return $this->unauthorized('Token inválido');
        }
    }

    /**
     * Executa após a requisição
     */
    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null)
    {
        // Não precisa fazer nada após a requisição
        return $response;
    }

    /**
     * Retorna resposta de não autorizado
     */
    private function unauthorized(string $message = 'Acesso não autorizado')
    {
        $response = Services::response();

        $data = [
            'success' => false,
            'message' => $message
        ];

        $response->setStatusCode(401)
            ->setContentType('application/json')
            ->setBody(json_encode($data));

        return $response;
    }
}
