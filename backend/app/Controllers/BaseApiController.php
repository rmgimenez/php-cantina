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
        // Tenta obter JSON do corpo da requisição
        $input = $this->request->getBody();
        if (!empty($input)) {
            $json = json_decode($input, true);
            if (json_last_error() === JSON_ERROR_NONE) {
                return $json;
            }
        }
        
        // Fallback para POST data
        return $_POST ?? [];
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
}
