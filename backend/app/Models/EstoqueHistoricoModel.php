<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Model para gerenciamento do histórico de estoque
 */
class EstoqueHistoricoModel extends Model
{
    protected $table = 'cant_estoque_historico';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'produto_id',
        'tipo_movimentacao',
        'quantidade',
        'estoque_anterior',
        'estoque_atual',
        'motivo',
        'venda_id',
        'funcionario_cantina_id'
    ];

    // Validação
    protected $validationRules = [
        'produto_id' => 'required|numeric|is_not_unique[cant_produtos.id]',
        'tipo_movimentacao' => 'required|in_list[entrada,saida,ajuste]',
        'quantidade' => 'required|integer|differs[0]',
        'estoque_anterior' => 'required|integer|greater_than_equal_to[0]',
        'estoque_atual' => 'required|integer|greater_than_equal_to[0]',
        'motivo' => 'permit_empty|max_length[255]',
        'venda_id' => 'permit_empty|numeric|is_not_unique[cant_vendas.id]',
        'funcionario_cantina_id' => 'required|numeric|is_not_unique[cant_funcionarios.id]'
    ];

    protected $validationMessages = [
        'produto_id' => [
            'required' => 'O produto é obrigatório',
            'numeric' => 'Produto inválido',
            'is_not_unique' => 'Produto não encontrado'
        ],
        'tipo_movimentacao' => [
            'required' => 'O tipo de movimentação é obrigatório',
            'in_list' => 'Tipo de movimentação inválido. Deve ser: entrada, saida ou ajuste'
        ],
        'quantidade' => [
            'required' => 'A quantidade é obrigatória',
            'integer' => 'A quantidade deve ser um número inteiro',
            'differs' => 'A quantidade deve ser diferente de zero'
        ],
        'estoque_anterior' => [
            'required' => 'O estoque anterior é obrigatório',
            'integer' => 'O estoque anterior deve ser um número inteiro',
            'greater_than_equal_to' => 'O estoque anterior deve ser maior ou igual a zero'
        ],
        'estoque_atual' => [
            'required' => 'O estoque atual é obrigatório',
            'integer' => 'O estoque atual deve ser um número inteiro',
            'greater_than_equal_to' => 'O estoque atual deve ser maior ou igual a zero'
        ],
        'motivo' => [
            'max_length' => 'O motivo não pode ter mais de 255 caracteres'
        ],
        'funcionario_cantina_id' => [
            'required' => 'O funcionário é obrigatório',
            'numeric' => 'Funcionário inválido',
            'is_not_unique' => 'Funcionário não encontrado'
        ]
    ];

    // Timestamps automáticos
    protected $useTimestamps = true;
    protected $createdField = 'data_movimentacao';
    protected $updatedField = false; // Histórico não é atualizado

    /**
     * Registra movimentação de entrada de estoque
     *
     * @param int $produtoId
     * @param int $quantidade
     * @param string $motivo
     * @param int $funcionarioCantinaId
     * @return int|false ID do registro ou false em caso de erro
     */
    public function registrarEntrada(int $produtoId, int $quantidade, string $motivo, int $funcionarioCantinaId)
    {
        $db = \Config\Database::connect();
        $db->transStart();

        try {
            // Busca o estoque atual
            $produtoModel = new ProdutoModel();
            $produto = $produtoModel->find($produtoId);
            
            if (!$produto) {
                throw new \RuntimeException('Produto não encontrado');
            }

            $estoqueAnterior = (int) $produto['estoque_atual'];
            $estoqueAtual = $estoqueAnterior + $quantidade;

            // Registra o histórico
            $historicoId = $this->insert([
                'produto_id' => $produtoId,
                'tipo_movimentacao' => 'entrada',
                'quantidade' => $quantidade,
                'estoque_anterior' => $estoqueAnterior,
                'estoque_atual' => $estoqueAtual,
                'motivo' => $motivo,
                'funcionario_cantina_id' => $funcionarioCantinaId
            ]);

            if (!$historicoId) {
                throw new \RuntimeException('Erro ao registrar histórico de estoque');
            }

            // Atualiza o estoque do produto
            if (!$produtoModel->atualizarEstoque($produtoId, $estoqueAtual)) {
                throw new \RuntimeException('Erro ao atualizar estoque do produto');
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                throw new \RuntimeException('Erro na transação de entrada de estoque');
            }

            return $historicoId;

        } catch (\Exception $e) {
            $db->transRollback();
            throw $e;
        }
    }

    /**
     * Registra ajuste de estoque (positivo ou negativo)
     *
     * @param int $produtoId
     * @param int $quantidadeAjuste (pode ser negativo)
     * @param string $motivo
     * @param int $funcionarioCantinaId
     * @return int|false ID do registro ou false em caso de erro
     */
    public function registrarAjuste(int $produtoId, int $quantidadeAjuste, string $motivo, int $funcionarioCantinaId)
    {
        $db = \Config\Database::connect();
        $db->transStart();

        try {
            // Busca o estoque atual
            $produtoModel = new ProdutoModel();
            $produto = $produtoModel->find($produtoId);
            
            if (!$produto) {
                throw new \RuntimeException('Produto não encontrado');
            }

            $estoqueAnterior = (int) $produto['estoque_atual'];
            $estoqueAtual = $estoqueAnterior + $quantidadeAjuste;

            // Não permite estoque negativo
            if ($estoqueAtual < 0) {
                throw new \RuntimeException('Ajuste resultaria em estoque negativo');
            }

            // Registra o histórico
            $historicoId = $this->insert([
                'produto_id' => $produtoId,
                'tipo_movimentacao' => 'ajuste',
                'quantidade' => $quantidadeAjuste,
                'estoque_anterior' => $estoqueAnterior,
                'estoque_atual' => $estoqueAtual,
                'motivo' => $motivo,
                'funcionario_cantina_id' => $funcionarioCantinaId
            ]);

            if (!$historicoId) {
                throw new \RuntimeException('Erro ao registrar histórico de estoque');
            }

            // Atualiza o estoque do produto
            if (!$produtoModel->atualizarEstoque($produtoId, $estoqueAtual)) {
                throw new \RuntimeException('Erro ao atualizar estoque do produto');
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                throw new \RuntimeException('Erro na transação de ajuste de estoque');
            }

            return $historicoId;

        } catch (\Exception $e) {
            $db->transRollback();
            throw $e;
        }
    }

    /**
     * Busca histórico de movimentações por produto
     *
     * @param int $produtoId
     * @param int $limit
     * @param int $offset
     * @return array
     */
    public function buscarHistoricoPorProduto(int $produtoId, int $limit = 50, int $offset = 0): array
    {
        return $this->select('cant_estoque_historico.*, cant_produtos.nome as produto_nome, cant_funcionarios.nome as funcionario_nome')
                   ->join('cant_produtos', 'cant_estoque_historico.produto_id = cant_produtos.id')
                   ->join('cant_funcionarios', 'cant_estoque_historico.funcionario_cantina_id = cant_funcionarios.id')
                   ->where('cant_estoque_historico.produto_id', $produtoId)
                   ->orderBy('cant_estoque_historico.data_movimentacao', 'DESC')
                   ->limit($limit, $offset)
                   ->findAll();
    }

    /**
     * Conta total de movimentações por produto
     *
     * @param int $produtoId
     * @return int
     */
    public function contarMovimentacoesPorProduto(int $produtoId): int
    {
        return $this->where('produto_id', $produtoId)->countAllResults();
    }

    /**
     * Busca últimas movimentações gerais
     *
     * @param int $limit
     * @param array $filtros
     * @return array
     */
    public function buscarUltimasMovimentacoes(int $limit = 50, array $filtros = []): array
    {
        $builder = $this->builder();
        $builder->select('cant_estoque_historico.*, cant_produtos.nome as produto_nome, cant_funcionarios.nome as funcionario_nome')
                ->join('cant_produtos', 'cant_estoque_historico.produto_id = cant_produtos.id')
                ->join('cant_funcionarios', 'cant_estoque_historico.funcionario_cantina_id = cant_funcionarios.id');

        // Aplicar filtros
        if (!empty($filtros['tipo_movimentacao'])) {
            $builder->where('cant_estoque_historico.tipo_movimentacao', $filtros['tipo_movimentacao']);
        }

        if (!empty($filtros['data_inicio'])) {
            $builder->where('DATE(cant_estoque_historico.data_movimentacao) >=', $filtros['data_inicio']);
        }

        if (!empty($filtros['data_fim'])) {
            $builder->where('DATE(cant_estoque_historico.data_movimentacao) <=', $filtros['data_fim']);
        }

        if (!empty($filtros['produto_id'])) {
            $builder->where('cant_estoque_historico.produto_id', $filtros['produto_id']);
        }

        return $builder->orderBy('cant_estoque_historico.data_movimentacao', 'DESC')
                       ->limit($limit)
                       ->get()
                       ->getResultArray();
    }

    /**
     * Busca movimentações com paginação
     *
     * @param array $filtros
     * @param int $perPage
     * @param int $page
     * @return array
     */
    public function buscarMovimentacoesPaginado(array $filtros = [], int $perPage = 20, int $page = 1): array
    {
        $builder = $this->builder();
        $builder->select('cant_estoque_historico.*, cant_produtos.nome as produto_nome, cant_funcionarios.nome as funcionario_nome')
                ->join('cant_produtos', 'cant_estoque_historico.produto_id = cant_produtos.id')
                ->join('cant_funcionarios', 'cant_estoque_historico.funcionario_cantina_id = cant_funcionarios.id');

        // Aplicar filtros
        if (!empty($filtros['tipo_movimentacao'])) {
            $builder->where('cant_estoque_historico.tipo_movimentacao', $filtros['tipo_movimentacao']);
        }

        if (!empty($filtros['data_inicio'])) {
            $builder->where('DATE(cant_estoque_historico.data_movimentacao) >=', $filtros['data_inicio']);
        }

        if (!empty($filtros['data_fim'])) {
            $builder->where('DATE(cant_estoque_historico.data_movimentacao) <=', $filtros['data_fim']);
        }

        if (!empty($filtros['produto_id'])) {
            $builder->where('cant_estoque_historico.produto_id', $filtros['produto_id']);
        }

        if (!empty($filtros['funcionario_cantina_id'])) {
            $builder->where('cant_estoque_historico.funcionario_cantina_id', $filtros['funcionario_cantina_id']);
        }

        // Contar total
        $total = $builder->countAllResults(false);

        // Aplicar paginação
        $offset = ($page - 1) * $perPage;
        $movimentacoes = $builder->orderBy('cant_estoque_historico.data_movimentacao', 'DESC')
                                ->limit($perPage, $offset)
                                ->get()
                                ->getResultArray();

        return [
            'movimentacoes' => $movimentacoes,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => ceil($total / $perPage)
        ];
    }
}