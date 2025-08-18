<?php

namespace App\Controllers;

use CodeIgniter\API\ResponseTrait;
use CodeIgniter\Controller;

/**
 * Classe base para controladores de API
 * Fornece métodos padronizados para respostas da API
 */
class BaseApiController extends Controller
{
    use ResponseTrait;

    /**
     * Retorna resposta de sucesso padronizada
     *
     * @param mixed $data Dados a serem retornados
     * @param string $message Mensagem de sucesso
     * @param int $statusCode Código de status HTTP
     * @return mixed
     */
    protected function respondSuccess($data = null, string $message = 'Operação realizada com sucesso', int $statusCode = 200)
    {
        $response = [
            'success' => true,
            'message' => $message,
            'data' => $data
        ];

        return $this->respond($response, $statusCode);
    }

    /**
     * Retorna resposta de erro padronizada
     *
     * @param string $message Mensagem de erro
     * @param int $statusCode Código de status HTTP
     * @param mixed $errors Detalhes dos erros
     * @return mixed
     */
    protected function respondError(string $message = 'Erro interno do servidor', int $statusCode = 500, $errors = null)
    {
        $response = [
            'success' => false,
            'message' => $message
        ];

        if ($errors !== null) {
            $response['errors'] = $errors;
        }

        return $this->respond($response, $statusCode);
    }

    /**
     * Retorna resposta de validação de erro
     *
     * @param array $errors Erros de validação
     * @param string $message Mensagem personalizada
     * @return mixed
     */
    protected function respondValidationError(array $errors, string $message = 'Dados inválidos')
    {
        return $this->respondError($message, 422, $errors);
    }

    /**
     * Retorna resposta para recurso não encontrado
     *
     * @param string $message Mensagem personalizada
     * @return mixed
     */
    protected function respondNotFound(string $message = 'Recurso não encontrado')
    {
        return $this->respondError($message, 404);
    }

    /**
     * Retorna resposta para acesso não autorizado
     *
     * @param string $message Mensagem personalizada
     * @return mixed
     */
    protected function respondUnauthorized(string $message = 'Acesso não autorizado')
    {
        return $this->respondError($message, 401);
    }

    /**
     * Retorna resposta para acesso proibido
     *
     * @param string $message Mensagem personalizada
     * @return mixed
     */
    protected function respondForbidden(string $message = 'Acesso proibido')
    {
        return $this->respondError($message, 403);
    }

    /**
     * Valida dados de entrada usando regras do CodeIgniter
     *
     * @param array $rules Regras de validação
     * @param array $data Dados a serem validados (opcional, usa input automaticamente)
     * @return bool
     */
    protected function validateInput(array $rules, array $data = null): bool
    {
        $validation = \Config\Services::validation();

        if ($data === null) {
            $data = $this->getRequestData();
        }

        $validation->setRules($rules);

        if (!$validation->run($data)) {
            $this->validator = $validation;
            return false;
        }

        return true;
    }

    /**
     * Obtém erros de validação formatados
     *
     * @return array
     */
    protected function getValidationErrors(): array
    {
        if (!isset($this->validator)) {
            return [];
        }

        return $this->validator->getErrors();
    }

    /**
     * Obtém dados do request (JSON ou POST)
     *
     * @return array
     */
    protected function getRequestData(): array
    {
        // Prioriza payload JSON se o content-type for correspondente
        if ($this->request->hasHeader('Content-Type') && strpos($this->request->getHeaderLine('Content-Type'), 'application/json') !== false) {
            $data = $this->request->getJSON(true);
            return is_array($data) ? $data : [];
        }

        // Para outros métodos, usa getVar() que lida com POST, PUT, PATCH, etc.
        $data = $this->request->getVar();

        // Se getVar() retornar um objeto, converte para array
        if (is_object($data)) {
            $data = (array) $data;
        }

        // Se ainda assim não for um array, retorna um array vazio
        return is_array($data) ? $data : [];
    }

    /**
     * Obtém parâmetro da URL
     *
     * @param string $key Nome do parâmetro
     * @param mixed $default Valor padrão
     * @return mixed
     */
    protected function getParam(string $key, $default = null)
    {
        return $_GET[$key] ?? $_POST[$key] ?? $default;
    }

    /**
     * Valida e retorna ID inteiro da URL
     *
     * @param string $paramName Nome do parâmetro
     * @return int|null
     */
    protected function getValidId(string $paramName = 'id'): ?int
    {
        $id = $_GET[$paramName] ?? $_POST[$paramName] ?? null;

        if (!is_numeric($id) || $id <= 0) {
            return null;
        }

        return (int) $id;
    }

    /**
     * Obtém informações do usuário autenticado
     *
     * @return object|null
     */
    protected function getAuthenticatedUser(): ?object
    {
        // Compatibilidade: alguns filtros antigos podem setar $request->user (legacy)
        if (isset($this->request) && is_object($this->request) && property_exists($this->request, 'user')) {
            return $this->request->user ?? null;
        }

        // Método preferido: verificar variável global definida pelo filtro JWT
        return $GLOBALS['authenticated_user'] ?? null;
    }

    /**
     * Verifica se o usuário tem permissão de gestão
     *
     * @return bool
     */
    protected function hasManagementPermission(): bool
    {
        $user = $this->getAuthenticatedUser();

        if (!$user) {
            return false;
        }

        // Verifica se o usuário tem tipo 'administrador' ou 'estoquista' (conforme tabela cant_funcionarios)
        return in_array($user->tipo ?? '', ['administrador', 'estoquista']);
    }
}
