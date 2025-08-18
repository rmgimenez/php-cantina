<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Model para gerenciamento dos tipos de produtos
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
        'nome' => 'required|min_length[2]|max_length[100]|is_unique[cant_tipos_produtos.nome,id,{id}]',
        'descricao' => 'permit_empty|max_length[1000]',
        'ativo' => 'permit_empty|in_list[0,1]'
    ];

    protected $validationMessages = [
        'nome' => [
            'required' => 'O nome é obrigatório',
            'min_length' => 'O nome deve ter pelo menos 2 caracteres',
            'max_length' => 'O nome não pode ter mais de 100 caracteres',
            'is_unique' => 'Este nome já está em uso'
        ],
        'descricao' => [
            'max_length' => 'A descrição não pode ter mais de 1000 caracteres'
        ]
    ];

    // Timestamps automáticos
    protected $useTimestamps = true;
    protected $createdField = 'data_criacao';
    protected $updatedField = false; // A tabela não tem campo de atualização

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
     * Busca tipo de produto por nome
     *
     * @param string $nome
     * @return array|null
     */
    public function findByNome(string $nome): ?array
    {
        return $this->where('nome', $nome)
                   ->first();
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

        if (!empty($filtros['descricao'])) {
            $builder->like('descricao', $filtros['descricao']);
        }

        if (isset($filtros['ativo'])) {
            $builder->where('ativo', $filtros['ativo']);
        } else {
            $builder->where('ativo', 1); // Por padrão, só ativos
        }

        return $builder->orderBy('nome', 'ASC')->get()->getResultArray();
    }

    /**
     * Conta total de tipos ativos
     *
     * @return int
     */
    public function contarAtivos(): int
    {
        return $this->where('ativo', 1)->countAllResults();
    }

    /**
     * Verifica se pode ser deletado (não está sendo usado)
     *
     * @param int $id
     * @return bool
     */
    public function podeSerDeletado(int $id): bool
    {
        // Verifica se há produtos usando este tipo
        $db = \Config\Database::connect();
        $query = $db->query('SELECT COUNT(*) as total FROM cant_produtos WHERE tipo_produto_id = ? AND ativo = 1', [$id]);
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
            throw new \RuntimeException('Não é possível excluir este tipo de produto pois existem produtos associados a ele');
        }

        return parent::delete($id, $purge);
    }
}