<?php

namespace App\Controllers;

use App\Models\AlunoModel;
use App\Models\ContaAlunoModel;

/**
 * Controller para gerenciamento de alunos
 */
class Alunos extends BaseApiController
{
    protected $alunoModel;
    protected $contaAlunoModel;

    public function __construct()
    {
        $this->alunoModel = new AlunoModel();
        $this->contaAlunoModel = new ContaAlunoModel();
    }

    /**
     * Lista alunos com paginação e filtros
     * GET /api/alunos
     *
     * Query params:
     * - q: busca por nome ou RA
     * - curso: filtro por curso
     * - serie: filtro por série
     * - turma: filtro por turma
     * - status: filtro por status (padrão: MAT)
     * - page: página (padrão: 1)
     * - perPage: itens por página (padrão: 20, max: 100)
     */
    public function index()
    {
        $request = $this->request;
        
        // Parâmetros de paginação
        $page = max(1, (int) $request->getGet('page') ?: 1);
        $perPage = min(100, max(1, (int) $request->getGet('perPage') ?: 20));
        
        // Filtros
        $filtros = [];
        if ($q = $request->getGet('q')) {
            $filtros['q'] = trim($q);
        }
        if ($curso = $request->getGet('curso')) {
            $filtros['curso'] = trim($curso);
        }
        if ($serie = $request->getGet('serie')) {
            $filtros['serie'] = trim($serie);
        }
        if ($turma = $request->getGet('turma')) {
            $filtros['turma'] = trim($turma);
        }
        if ($status = $request->getGet('status')) {
            $filtros['status'] = trim($status);
        }

        try {
            $resultado = $this->alunoModel->paginateResumo($filtros, $perPage, $page);
            
            $response = [
                'success' => true,
                'data' => $resultado['alunos'],
                'meta' => [
                    'page' => $resultado['page'],
                    'perPage' => $resultado['perPage'],
                    'total' => $resultado['total'],
                    'totalPages' => $resultado['totalPages']
                ]
            ];

            return $this->respond($response);

        } catch (\Exception $e) {
            log_message('error', 'Erro ao listar alunos: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor', 500);
        }
    }

    /**
     * Obtém dados de um aluno específico
     * GET /api/alunos/{ra}
     */
    public function show($ra = null)
    {
        if (!$ra || !is_numeric($ra)) {
            return $this->respondError('RA inválido', 400, ['code' => 'INVALID_RA']);
        }

        try {
            $aluno = $this->alunoModel->findByRa((int) $ra);
            
            if (!$aluno) {
                return $this->respondError('Aluno não encontrado', 404, ['code' => 'NOT_FOUND']);
            }

            return $this->respondSuccess($aluno, 'Aluno encontrado');

        } catch (\Exception $e) {
            log_message('error', 'Erro ao buscar aluno RA ' . $ra . ': ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor', 500, ['code' => 'SERVER_ERROR']);
        }
    }

    /**
     * Obtém dados da conta do aluno (saldo e histórico)
     * GET /api/alunos/{ra}/conta
     */
    public function conta($ra = null)
    {
        if (!$ra || !is_numeric($ra)) {
            return $this->respondError('RA inválido', 400, ['code' => 'INVALID_RA']);
        }

        try {
            // Verificar se aluno existe
            if (!$this->alunoModel->exists((int) $ra)) {
                return $this->respondError('Aluno não encontrado', 404, ['code' => 'NOT_FOUND']);
            }

            // Buscar dados da conta
            $dadosConta = $this->contaAlunoModel->getContaCompleta((int) $ra);
            
            $response = [
                'ra' => (int) $ra,
                'saldo' => (float) $dadosConta['conta']['saldo'],
                'limite_diario' => $dadosConta['conta']['limite_diario'] ? (float) $dadosConta['conta']['limite_diario'] : null,
                'conta_ativa' => (bool) $dadosConta['conta']['ativo'],
                'historico_recente' => $dadosConta['historico_recente']
            ];

            return $this->respondSuccess($response, 'Dados da conta obtidos');

        } catch (\Exception $e) {
            log_message('error', 'Erro ao buscar conta do aluno RA ' . $ra . ': ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor', 500, ['code' => 'SERVER_ERROR']);
        }
    }

    /**
     * Adiciona crédito na conta do aluno
     * POST /api/alunos/{ra}/credito
     * 
     * Body: {
     *   "valor": number (required),
     *   "motivo": string (optional, max 255 chars)
     * }
     */
    public function credito($ra = null)
    {
        if (!$ra || !is_numeric($ra)) {
            return $this->respondError('RA inválido', 400, ['code' => 'INVALID_RA']);
        }

        // Validar entrada
        $rules = [
            'valor' => 'required|numeric|greater_than[0]',
            'motivo' => 'permit_empty|max_length[255]'
        ];

        if (!$this->validateInput($rules)) {
            return $this->respondValidationError($this->validator->getErrors(), 'Dados inválidos');
        }

        $data = $this->getRequestData();
        $valor = (float) $data['valor'];
        $motivo = $data['motivo'] ?? 'Crédito adicionado';

        try {
            // Verificar se aluno existe
            if (!$this->alunoModel->exists((int) $ra)) {
                return $this->respondError('Aluno não encontrado', 404, ['code' => 'NOT_FOUND']);
            }

            // Obter dados do usuário logado (do JWT)
            $jwt = $this->request->getServer('HTTP_AUTHORIZATION');
            if (!$jwt) {
                return $this->respondUnauthorized('Token de acesso requerido');
            }

            // Extrair user_id do token JWT
            $funcionarioCantinaId = $this->getFuncionarioIdFromToken();
            if (!$funcionarioCantinaId) {
                return $this->respondUnauthorized('Token inválido');
            }

            // Verificar permissões (funcionário deve ser administrador ou atendente)
            if (!$this->hasPermissionToManageCredits()) {
                return $this->respondForbidden('Sem permissão para adicionar créditos');
            }

            // Adicionar crédito
            $sucesso = $this->contaAlunoModel->addCredito(
                (int) $ra,
                $valor,
                $funcionarioCantinaId,
                $motivo
            );

            if (!$sucesso) {
                return $this->respondError('Erro ao adicionar crédito', 500, ['code' => 'CREDIT_ERROR']);
            }

            // Buscar saldo atualizado
            $saldoAtualizado = $this->contaAlunoModel->getSaldo((int) $ra);

            $response = [
                'ra' => (int) $ra,
                'valor_adicionado' => $valor,
                'saldo_atual' => $saldoAtualizado,
                'motivo' => $motivo
            ];

            return $this->respondSuccess($response, 'Crédito adicionado com sucesso');

        } catch (\Exception $e) {
            log_message('error', 'Erro ao adicionar crédito para aluno RA ' . $ra . ': ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor', 500, ['code' => 'SERVER_ERROR']);
        }
    }

    /**
     * Obtém histórico detalhado de movimentações
     * GET /api/alunos/{ra}/historico
     */
    public function historico($ra = null)
    {
        if (!$ra || !is_numeric($ra)) {
            return $this->respondError('RA inválido', 400, ['code' => 'INVALID_RA']);
        }

        $request = $this->request;
        $page = max(1, (int) $request->getGet('page') ?: 1);
        $perPage = min(100, max(1, (int) $request->getGet('perPage') ?: 20));
        $offset = ($page - 1) * $perPage;

        try {
            // Verificar se aluno existe
            if (!$this->alunoModel->exists((int) $ra)) {
                return $this->respondError('Aluno não encontrado', 404, ['code' => 'NOT_FOUND']);
            }

            $historico = $this->contaAlunoModel->getHistorico((int) $ra, $perPage, $offset);
            
            // Para obter total de registros, fazer uma query separada
            $db = \Config\Database::connect();
            $total = $db->table('cant_movimentacoes')
                       ->where('tipo_conta', 'aluno')
                       ->where('ra_aluno', (int) $ra)
                       ->countAllResults();

            $response = [
                'historico' => $historico,
                'meta' => [
                    'page' => $page,
                    'perPage' => $perPage,
                    'total' => $total,
                    'totalPages' => ceil($total / $perPage)
                ]
            ];

            return $this->respondSuccess($response, 'Histórico obtido');

        } catch (\Exception $e) {
            log_message('error', 'Erro ao buscar histórico do aluno RA ' . $ra . ': ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor', 500, ['code' => 'SERVER_ERROR']);
        }
    }

    /**
     * Obtém dados do usuário do token JWT
     */
    private function getFuncionarioIdFromToken(): ?int
    {
        try {
            $jwt = $this->request->getServer('HTTP_AUTHORIZATION');
            if (!$jwt) {
                return null;
            }

            // Remover 'Bearer ' do início
            $token = str_replace('Bearer ', '', $jwt);
            
            $key = getenv('JWT_SECRET');
            if (!$key) {
                return null;
            }

            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($key, 'HS256'));
            
            return $decoded->user_id ?? null;

        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Verifica se o usuário tem permissão para gerenciar créditos
     */
    private function hasPermissionToManageCredits(): bool
    {
        try {
            $jwt = $this->request->getServer('HTTP_AUTHORIZATION');
            if (!$jwt) {
                return false;
            }

            $token = str_replace('Bearer ', '', $jwt);
            $key = getenv('JWT_SECRET');
            
            if (!$key) {
                return false;
            }

            $decoded = \Firebase\JWT\JWT::decode($token, new \Firebase\JWT\Key($key, 'HS256'));
            
            $tipo = $decoded->tipo ?? null;
            
            // Apenas administradores e atendentes podem adicionar créditos
            return in_array($tipo, ['administrador', 'atendente']);

        } catch (\Exception $e) {
            return false;
        }
    }

    /**
     * Obtém dados do request (JSON ou form data)
     */
    private function getRequestData(): array
    {
        $contentType = $this->request->getHeaderLine('Content-Type');
        
        if (strpos($contentType, 'application/json') !== false) {
            return $this->request->getJSON(true) ?: [];
        }
        
        return $this->request->getPost() ?: [];
    }
}