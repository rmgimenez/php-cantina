<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Model para gerenciamento dos produtos
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
        'nome' => 'required|min_length[2]|max_length[255]',
        'tipo_produto_id' => 'required|numeric|is_not_unique[cant_tipos_produtos.id]',
        'preco' => 'required|numeric|greater_than_equal_to[0]',
        'estoque_atual' => 'permit_empty|integer|greater_than_equal_to[0]',
        'estoque_minimo' => 'permit_empty|integer|greater_than_equal_to[0]',
        'codigo_barras' => 'permit_empty|max_length[50]|is_unique[cant_produtos.codigo_barras,id,{id}]',
        'descricao' => 'permit_empty|max_length[1000]',
        'ativo' => 'permit_empty|in_list[0,1]'
    ];

    protected $validationMessages = [
        'nome' => [
            'required' => 'O nome é obrigatório',
            'min_length' => 'O nome deve ter pelo menos 2 caracteres',
            'max_length' => 'O nome não pode ter mais de 255 caracteres'
        ],
        'tipo_produto_id' => [
            'required' => 'O tipo de produto é obrigatório',
            'numeric' => 'Tipo de produto inválido',
            'is_not_unique' => 'Tipo de produto não encontrado'
        ],
        'preco' => [
            'required' => 'O preço é obrigatório',
            'numeric' => 'O preço deve ser um valor numérico',
            'greater_than_equal_to' => 'O preço deve ser maior ou igual a zero'
        ],
        'estoque_atual' => [
            'integer' => 'O estoque atual deve ser um número inteiro',
            'greater_than_equal_to' => 'O estoque atual deve ser maior ou igual a zero'
        ],
        'estoque_minimo' => [
            'integer' => 'O estoque mínimo deve ser um número inteiro',
            'greater_than_equal_to' => 'O estoque mínimo deve ser maior ou igual a zero'
        ],
        'codigo_barras' => [
            'max_length' => 'O código de barras não pode ter mais de 50 caracteres',
            'is_unique' => 'Este código de barras já está em uso'
        ],
        'descricao' => [
            'max_length' => 'A descrição não pode ter mais de 1000 caracteres'
        ]
    ];

    // Timestamps automáticos
    protected $useTimestamps = true;
    protected $createdField = 'data_criacao';
    protected $updatedField = 'data_atualizacao';

    /**
     * Lista produtos ativos
     *
     * @return array
     */
    public function findAtivos(): array
    {
        return $this->select('cant_produtos.*, cant_tipos_produtos.nome as tipo_produto_nome')
                   ->join('cant_tipos_produtos', 'cant_produtos.tipo_produto_id = cant_tipos_produtos.id')
                   ->where('cant_produtos.ativo', 1)
                   ->orderBy('cant_produtos.nome', 'ASC')
                   ->findAll();
    }

    /**
     * Busca produto por código de barras
     *
     * @param string $codigoBarras
     * @return array|null
     */
    public function findByCodigoBarras(string $codigoBarras): ?array
    {
        return $this->select('cant_produtos.*, cant_tipos_produtos.nome as tipo_produto_nome')
                   ->join('cant_tipos_produtos', 'cant_produtos.tipo_produto_id = cant_tipos_produtos.id')
                   ->where('cant_produtos.codigo_barras', $codigoBarras)
                   ->first();
    }

    /**
     * Busca produto com informações do tipo
     *
     * @param int $id
     * @return array|null
     */
    public function findComTipo(int $id): ?array
    {
        return $this->select('cant_produtos.*, cant_tipos_produtos.nome as tipo_produto_nome')
                   ->join('cant_tipos_produtos', 'cant_produtos.tipo_produto_id = cant_tipos_produtos.id')
                   ->where('cant_produtos.id', $id)
                   ->first();
    }

    /**
     * Lista produtos com estoque baixo
     *
     * @return array
     */
    public function findEstoqueBaixo(): array
    {
        return $this->select('cant_produtos.*, cant_tipos_produtos.nome as tipo_produto_nome, (cant_produtos.estoque_minimo - cant_produtos.estoque_atual) as quantidade_repor')
                   ->join('cant_tipos_produtos', 'cant_produtos.tipo_produto_id = cant_tipos_produtos.id')
                   ->where('cant_produtos.estoque_atual <=', 'cant_produtos.estoque_minimo', false)
                   ->where('cant_produtos.ativo', 1)
                   ->orderBy('quantidade_repor', 'DESC')
                   ->findAll();
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
     * Busca com filtros
     *
     * @param array $filtros
     * @return array
     */
    public function buscarComFiltros(array $filtros = []): array
    {
        $builder = $this->builder();
        $builder->select('cant_produtos.*, cant_tipos_produtos.nome as tipo_produto_nome')
                ->join('cant_tipos_produtos', 'cant_produtos.tipo_produto_id = cant_tipos_produtos.id');

        if (!empty($filtros['nome'])) {
            $builder->like('cant_produtos.nome', $filtros['nome']);
        }

        if (!empty($filtros['codigo_barras'])) {
            $builder->like('cant_produtos.codigo_barras', $filtros['codigo_barras']);
        }

        if (!empty($filtros['tipo_produto_id'])) {
            $builder->where('cant_produtos.tipo_produto_id', $filtros['tipo_produto_id']);
        }

        if (isset($filtros['ativo'])) {
            $builder->where('cant_produtos.ativo', $filtros['ativo']);
        } else {
            $builder->where('cant_produtos.ativo', 1); // Por padrão, só ativos
        }

        return $builder->orderBy('cant_produtos.nome', 'ASC')->get()->getResultArray();
    }

    /**
     * Busca com paginação
     *
     * @param array $filtros
     * @param int $perPage
     * @param int $page
     * @return array
     */
    public function buscarPaginado(array $filtros = [], int $perPage = 20, int $page = 1): array
    {
        $builder = $this->builder();
        $builder->select('cant_produtos.*, cant_tipos_produtos.nome as tipo_produto_nome')
                ->join('cant_tipos_produtos', 'cant_produtos.tipo_produto_id = cant_tipos_produtos.id');

        // Aplicar filtros
        if (!empty($filtros['q'])) {
            $builder->groupStart()
                    ->like('cant_produtos.nome', $filtros['q'])
                    ->orLike('cant_produtos.codigo_barras', $filtros['q'])
                    ->orLike('cant_produtos.descricao', $filtros['q'])
                    ->groupEnd();
        }

        if (!empty($filtros['tipo_produto_id'])) {
            $builder->where('cant_produtos.tipo_produto_id', $filtros['tipo_produto_id']);
        }

        if (isset($filtros['ativo'])) {
            $builder->where('cant_produtos.ativo', $filtros['ativo']);
        } else {
            $builder->where('cant_produtos.ativo', 1);
        }

        // Contar total
        $total = $builder->countAllResults(false);

        // Aplicar paginação
        $offset = ($page - 1) * $perPage;
        $produtos = $builder->orderBy('cant_produtos.nome', 'ASC')
                           ->limit($perPage, $offset)
                           ->get()
                           ->getResultArray();

        return [
            'produtos' => $produtos,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => ceil($total / $perPage)
        ];
    }

    /**
     * Conta total de produtos ativos
     *
     * @return int
     */
    public function contarAtivos(): int
    {
        return $this->where('ativo', 1)->countAllResults();
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
     * Verifica se pode ser deletado (não tem vendas associadas)
     *
     * @param int $id
     * @return bool
     */
    public function podeSerDeletado(int $id): bool
    {
        // Verifica se há vendas usando este produto
        $db = \Config\Database::connect();
        $query = $db->query('SELECT COUNT(*) as total FROM cant_vendas_itens WHERE produto_id = ?', [$id]);
        $result = $query->getRow();
        
        return $result->total == 0;
    }

    /**
     * Override do delete para verificar dependências
     *
     * @param int $id
     * @return bool
     */
    public function delete($id = null, bool $purge = false)
    {
        if (!$this->podeSerDeletado($id)) {
            throw new \RuntimeException('Não é possível excluir este produto pois existem vendas associadas a ele');
        }

        return parent::delete($id, $purge);
    }
}