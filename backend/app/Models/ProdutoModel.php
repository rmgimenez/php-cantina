<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Model para gerenciamento dos produtos da cantina
 */
class ProdutoModel extends Model
{
    protected $table = 'cant_produtos';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'codigo_barras',
        'nome',
        'descricao',
        'tipo_produto_id',
        'preco',
        'estoque_atual',
        'estoque_minimo',
        'ativo'
    ];

    // Validação
    protected $validationRules = [
        'codigo_barras' => 'permit_empty|max_length[50]|is_unique[cant_produtos.codigo_barras,id,{id}]',
        'nome' => 'required|min_length[3]|max_length[255]',
        'descricao' => 'permit_empty|max_length[1000]',
        'tipo_produto_id' => 'required|is_natural_no_zero',
        'preco' => 'required|decimal|greater_than[0]',
        'estoque_atual' => 'permit_empty|is_natural',
        'estoque_minimo' => 'permit_empty|is_natural',
        'ativo' => 'permit_empty|in_list[0,1]'
    ];

    protected $validationMessages = [
        'codigo_barras' => [
            'max_length' => 'O código de barras não pode ter mais de 50 caracteres',
            'is_unique' => 'Este código de barras já está em uso'
        ],
        'nome' => [
            'required' => 'O nome do produto é obrigatório',
            'min_length' => 'O nome deve ter pelo menos 3 caracteres',
            'max_length' => 'O nome não pode ter mais de 255 caracteres'
        ],
        'descricao' => [
            'max_length' => 'A descrição não pode ter mais de 1000 caracteres'
        ],
        'tipo_produto_id' => [
            'required' => 'O tipo de produto é obrigatório',
            'is_natural_no_zero' => 'Tipo de produto inválido'
        ],
        'preco' => [
            'required' => 'O preço é obrigatório',
            'decimal' => 'O preço deve ser um valor decimal válido',
            'greater_than' => 'O preço deve ser maior que zero'
        ],
        'estoque_atual' => [
            'is_natural' => 'O estoque atual deve ser um número inteiro positivo'
        ],
        'estoque_minimo' => [
            'is_natural' => 'O estoque mínimo deve ser um número inteiro positivo'
        ]
    ];

    /**
     * Lista produtos com informações do tipo
     *
     * @param array $filtros
     * @return array
     */
    public function listarComTipo(array $filtros = []): array
    {
        $builder = $this->builder();
        $builder->select('cant_produtos.*, cant_tipos_produtos.nome as tipo_nome')
                ->join('cant_tipos_produtos', 'cant_produtos.tipo_produto_id = cant_tipos_produtos.id');

        if (!empty($filtros['nome'])) {
            $builder->like('cant_produtos.nome', $filtros['nome']);
        }

        if (!empty($filtros['tipo_produto_id'])) {
            $builder->where('cant_produtos.tipo_produto_id', $filtros['tipo_produto_id']);
        }

        if (!empty($filtros['codigo_barras'])) {
            $builder->like('cant_produtos.codigo_barras', $filtros['codigo_barras']);
        }

        if (isset($filtros['ativo'])) {
            $builder->where('cant_produtos.ativo', $filtros['ativo']);
        } else {
            $builder->where('cant_produtos.ativo', 1); // Por padrão, só ativos
        }

        if (isset($filtros['estoque_baixo']) && $filtros['estoque_baixo'] === true) {
            $builder->where('cant_produtos.estoque_atual <=', 'cant_produtos.estoque_minimo', false);
        }

        return $builder->orderBy('cant_produtos.nome', 'ASC')->get()->getResultArray();
    }

    /**
     * Busca produto por código de barras
     *
     * @param string $codigoBarras
     * @return array|null
     */
    public function findByCodigoBarras(string $codigoBarras): ?array
    {
        return $this->where('codigo_barras', $codigoBarras)
                   ->where('ativo', 1)
                   ->first();
    }

    /**
     * Lista produtos ativos
     *
     * @return array
     */
    public function findAtivos(): array
    {
        return $this->where('ativo', 1)
                   ->orderBy('nome', 'ASC')
                   ->findAll();
    }

    /**
     * Lista produtos com estoque baixo
     *
     * @return array
     */
    public function findEstoqueBaixo(): array
    {
        return $this->listarComTipo(['estoque_baixo' => true]);
    }

    /**
     * Desativa produto em vez de deletar
     *
     * @param int $id
     * @return bool
     */
    public function desativar(int $id): bool
    {
        return $this->update($id, ['ativo' => 0]);
    }

    /**
     * Ativa produto
     *
     * @param int $id
     * @return bool
     */
    public function ativar(int $id): bool
    {
        return $this->update($id, ['ativo' => 1]);
    }

    /**
     * Atualiza estoque do produto
     *
     * @param int $id
     * @param int $novoEstoque
     * @return bool
     */
    public function atualizarEstoque(int $id, int $novoEstoque): bool
    {
        return $this->update($id, ['estoque_atual' => $novoEstoque]);
    }

    /**
     * Adiciona ao estoque
     *
     * @param int $id
     * @param int $quantidade
     * @return bool
     */
    public function adicionarEstoque(int $id, int $quantidade): bool
    {
        $produto = $this->find($id);
        if (!$produto) {
            return false;
        }

        $novoEstoque = $produto['estoque_atual'] + $quantidade;
        return $this->atualizarEstoque($id, $novoEstoque);
    }

    /**
     * Remove do estoque
     *
     * @param int $id
     * @param int $quantidade
     * @return bool
     */
    public function removerEstoque(int $id, int $quantidade): bool
    {
        $produto = $this->find($id);
        if (!$produto) {
            return false;
        }

        $novoEstoque = max(0, $produto['estoque_atual'] - $quantidade);
        return $this->atualizarEstoque($id, $novoEstoque);
    }

    /**
     * Verifica se produto tem estoque suficiente
     *
     * @param int $id
     * @param int $quantidade
     * @return bool
     */
    public function temEstoqueSuficiente(int $id, int $quantidade): bool
    {
        $produto = $this->find($id);
        return $produto && $produto['estoque_atual'] >= $quantidade;
    }

    /**
     * Busca produtos por tipo
     *
     * @param int $tipoId
     * @return array
     */
    public function findByTipo(int $tipoId): array
    {
        return $this->where('tipo_produto_id', $tipoId)
                   ->where('ativo', 1)
                   ->orderBy('nome', 'ASC')
                   ->findAll();
    }

    /**
     * Validação personalizada do tipo de produto
     */
    protected function validarTipoProduto(array $data): array
    {
        if (isset($data['data']['tipo_produto_id'])) {
            $tipoProdutoModel = new TipoProdutoModel();
            $tipo = $tipoProdutoModel->find($data['data']['tipo_produto_id']);
            
            if (!$tipo || $tipo['ativo'] == 0) {
                $data['errors'][] = 'Tipo de produto inválido ou inativo';
            }
        }

        return $data;
    }

    // Eventos
    protected $beforeInsert = ['validarTipoProduto'];
    protected $beforeUpdate = ['validarTipoProduto'];
}