<?php

namespace App\Controllers;

use App\Models\EstoqueHistoricoModel;
use App\Models\ProdutoModel;
use CodeIgniter\HTTP\ResponseInterface;

/**
 * Controller para gerenciamento do estoque
 */
class Estoque extends BaseApiController
{
    protected $estoqueModel;
    protected $produtoModel;

    public function __construct()
    {
        $this->estoqueModel = new EstoqueHistoricoModel();
        $this->produtoModel = new ProdutoModel();
    }

    /**
     * Registra entrada de estoque
     *
     * @return ResponseInterface
     */
    public function entrada(): ResponseInterface
    {
        try {
            $data = $this->getRequestData();

            // Validação
            $rules = [
                'produto_id' => 'required|numeric|is_not_unique[cant_produtos.id]',
                'quantidade' => 'required|integer|greater_than[0]',
                'motivo' => 'required|min_length[3]|max_length[255]',
                'funcionario_cantina_id' => 'required|numeric|is_not_unique[cant_funcionarios.id]'
            ];

            if (!$this->validateInput($rules, $data)) {
                return $this->respondValidationError($this->getValidationErrors());
            }

            // Registra a entrada
            $historicoId = $this->estoqueModel->registrarEntrada(
                (int) $data['produto_id'],
                (int) $data['quantidade'],
                $data['motivo'],
                (int) $data['funcionario_cantina_id']
            );

            if (!$historicoId) {
                return $this->respondError('Erro ao registrar entrada de estoque', 500);
            }

            // Busca o registro criado com informações completas
            $historico = $this->estoqueModel->select('cant_estoque_historico.*, cant_produtos.nome as produto_nome, cant_funcionarios.nome as funcionario_nome')
                                          ->join('cant_produtos', 'cant_estoque_historico.produto_id = cant_produtos.id')
                                          ->join('cant_funcionarios', 'cant_estoque_historico.funcionario_cantina_id = cant_funcionarios.id')
                                          ->find($historicoId);

            return $this->respondSuccess($historico, 'Entrada de estoque registrada com sucesso', 201);

        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            log_message('error', 'Erro ao registrar entrada de estoque: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Registra ajuste de estoque
     *
     * @return ResponseInterface
     */
    public function ajuste(): ResponseInterface
    {
        try {
            $data = $this->getRequestData();

            // Validação
            $rules = [
                'produto_id' => 'required|numeric|is_not_unique[cant_produtos.id]',
                'quantidade' => 'required|integer|differs[0]',
                'motivo' => 'required|min_length[3]|max_length[255]',
                'funcionario_cantina_id' => 'required|numeric|is_not_unique[cant_funcionarios.id]'
            ];

            if (!$this->validateInput($rules, $data)) {
                return $this->respondValidationError($this->getValidationErrors());
            }

            // Verifica se o produto existe e está ativo
            $produto = $this->produtoModel->find((int) $data['produto_id']);
            if (!$produto || !$produto['ativo']) {
                return $this->respondError('Produto não encontrado ou inativo', 404);
            }

            // Verifica se o ajuste negativo não resultará em estoque negativo
            $quantidadeAjuste = (int) $data['quantidade'];
            if ($quantidadeAjuste < 0 && abs($quantidadeAjuste) > $produto['estoque_atual']) {
                return $this->respondError('Ajuste resultaria em estoque negativo', 422);
            }

            // Registra o ajuste
            $historicoId = $this->estoqueModel->registrarAjuste(
                (int) $data['produto_id'],
                $quantidadeAjuste,
                $data['motivo'],
                (int) $data['funcionario_cantina_id']
            );

            if (!$historicoId) {
                return $this->respondError('Erro ao registrar ajuste de estoque', 500);
            }

            // Busca o registro criado com informações completas
            $historico = $this->estoqueModel->select('cant_estoque_historico.*, cant_produtos.nome as produto_nome, cant_funcionarios.nome as funcionario_nome')
                                          ->join('cant_produtos', 'cant_estoque_historico.produto_id = cant_produtos.id')
                                          ->join('cant_funcionarios', 'cant_estoque_historico.funcionario_cantina_id = cant_funcionarios.id')
                                          ->find($historicoId);

            return $this->respondSuccess($historico, 'Ajuste de estoque registrado com sucesso', 201);

        } catch (\RuntimeException $e) {
            return $this->respondError($e->getMessage(), 422);
        } catch (\Exception $e) {
            log_message('error', 'Erro ao registrar ajuste de estoque: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Busca histórico de movimentações por produto
     *
     * @param int $produto_id
     * @return ResponseInterface
     */
    public function historico($produto_id = null): ResponseInterface
    {
        try {
            if (!$produto_id || !is_numeric($produto_id)) {
                return $this->respondError('ID do produto é obrigatório e deve ser numérico', 400);
            }

            // Verifica se o produto existe
            $produto = $this->produtoModel->find((int) $produto_id);
            if (!$produto) {
                return $this->respondNotFound('Produto não encontrado');
            }

            $perPage = (int) ($this->getParam('perPage', 50));
            $page = (int) ($this->getParam('page', 1));
            $offset = ($page - 1) * $perPage;

            // Busca o histórico
            $movimentacoes = $this->estoqueModel->buscarHistoricoPorProduto((int) $produto_id, $perPage, $offset);
            $total = $this->estoqueModel->contarMovimentacoesPorProduto((int) $produto_id);

            return $this->respondSuccess([
                'produto' => $produto,
                'movimentacoes' => $movimentacoes,
                'pagination' => [
                    'page' => $page,
                    'perPage' => $perPage,
                    'total' => $total,
                    'totalPages' => ceil($total / $perPage)
                ]
            ], 'Histórico de movimentações obtido com sucesso');

        } catch (\Exception $e) {
            log_message('error', 'Erro ao buscar histórico de estoque: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Lista últimas movimentações gerais
     *
     * @return ResponseInterface
     */
    public function movimentacoes(): ResponseInterface
    {
        try {
            $perPage = (int) ($this->getParam('perPage', 20));
            $page = (int) ($this->getParam('page', 1));
            
            $filtros = [
                'tipo_movimentacao' => $this->getParam('tipo_movimentacao'),
                'data_inicio' => $this->getParam('data_inicio'),
                'data_fim' => $this->getParam('data_fim'),
                'produto_id' => $this->getParam('produto_id'),
                'funcionario_cantina_id' => $this->getParam('funcionario_cantina_id')
            ];

            // Remove filtros vazios
            $filtros = array_filter($filtros, function($value) {
                return $value !== null && $value !== '';
            });

            $resultado = $this->estoqueModel->buscarMovimentacoesPaginado($filtros, $perPage, $page);

            return $this->respondSuccess([
                'movimentacoes' => $resultado['movimentacoes'],
                'pagination' => [
                    'page' => $resultado['page'],
                    'perPage' => $resultado['perPage'],
                    'total' => $resultado['total'],
                    'totalPages' => $resultado['totalPages']
                ]
            ], 'Movimentações listadas com sucesso');

        } catch (\Exception $e) {
            log_message('error', 'Erro ao listar movimentações de estoque: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }

    /**
     * Relatório de estoque atual
     *
     * @return ResponseInterface
     */
    public function relatorio(): ResponseInterface
    {
        try {
            // Produtos com estoque baixo
            $produtosEstoqueBaixo = $this->produtoModel->findEstoqueBaixo();

            // Estatísticas gerais
            $totalProdutos = $this->produtoModel->contarAtivos();
            $produtosZerados = $this->produtoModel->where('estoque_atual', 0)
                                                 ->where('ativo', 1)
                                                 ->countAllResults();

            // Últimas movimentações (últimos 10 registros)
            $ultimasMovimentacoes = $this->estoqueModel->buscarUltimasMovimentacoes(10);

            // Valor total do estoque
            $valorEstoque = $this->produtoModel->selectSum('(preco * estoque_atual)', 'valor_total')
                                              ->where('ativo', 1)
                                              ->first();

            return $this->respondSuccess([
                'resumo' => [
                    'total_produtos' => $totalProdutos,
                    'produtos_estoque_baixo' => count($produtosEstoqueBaixo),
                    'produtos_zerados' => $produtosZerados,
                    'valor_total_estoque' => (float) ($valorEstoque['valor_total'] ?? 0)
                ],
                'produtos_estoque_baixo' => $produtosEstoqueBaixo,
                'ultimas_movimentacoes' => $ultimasMovimentacoes
            ], 'Relatório de estoque gerado com sucesso');

        } catch (\Exception $e) {
            log_message('error', 'Erro ao gerar relatório de estoque: ' . $e->getMessage());
            return $this->respondError('Erro interno do servidor');
        }
    }
}