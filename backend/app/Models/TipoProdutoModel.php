<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Model para gerenciamento dos tipos de produtos da cantina
 */
class TipoProdutoModel extends Model
{
    protected $table = 'cant_tipos_produtos';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'nome',
        'descricao',
        'ativo'
    ];

    // Validação
    protected $validationRules = [
        'nome' => 'required|min_length[3]|max_length[100]|is_unique[cant_tipos_produtos.nome,id,{id}]',
        'descricao' => 'permit_empty|max_length[500]',
        'ativo' => 'permit_empty|in_list[0,1]'
    ];

    protected $validationMessages = [
        'nome' => [
            'required' => 'O nome do tipo de produto é obrigatório',
            'min_length' => 'O nome deve ter pelo menos 3 caracteres',
            'max_length' => 'O nome não pode ter mais de 100 caracteres',
            'is_unique' => 'Este nome de tipo de produto já está em uso'
        ],
        'descricao' => [
            'max_length' => 'A descrição não pode ter mais de 500 caracteres'
        ]
    ];

    /**
     * Lista tipos de produtos ativos
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
     * Desativa tipo de produto em vez de deletar
     *
     * @param int $id
     * @return bool
     */
    public function desativar(int $id): bool
    {
        return $this->update($id, ['ativo' => 0]);
    }

    /**
     * Ativa tipo de produto
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

        if (!empty($filtros['nome'])) {
            $builder->like('nome', $filtros['nome']);
        }

        if (isset($filtros['ativo'])) {
            $builder->where('ativo', $filtros['ativo']);
        } else {
            $builder->where('ativo', 1); // Por padrão, só ativos
        }

        return $builder->orderBy('nome', 'ASC')->get()->getResultArray();
    }

    /**
     * Conta produtos por tipo
     *
     * @param int $tipoId
     * @return int
     */
    public function contarProdutos(int $tipoId): int
    {
        $db = \Config\Database::connect();
        $builder = $db->table('cant_produtos');
        
        return $builder->where('tipo_produto_id', $tipoId)
                      ->where('ativo', 1)
                      ->countAllResults();
    }

    /**
     * Verifica se tipo pode ser excluído (não tem produtos associados)
     *
     * @param int $id
     * @return bool
     */
    public function podeExcluir(int $id): bool
    {
        return $this->contarProdutos($id) === 0;
    }
}