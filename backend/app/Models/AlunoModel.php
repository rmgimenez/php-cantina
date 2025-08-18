<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Model para gerenciamento dos alunos
 * Utiliza a view 'alunos' que já existe no banco de dados
 */
class AlunoModel extends Model
{
    protected $table = 'alunos';
    protected $primaryKey = 'ra';
    protected $useAutoIncrement = false;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = false; // View não permite inserção/atualização

    /**
     * Busca aluno por RA
     *
     * @param int $ra
     * @return array|null
     */
    public function findByRa(int $ra): ?array
    {
        return $this->where('ra', $ra)->first();
    }

    /**
     * Busca alunos com filtros
     *
     * @param array $filtros
     * @return array
     */
    public function search(array $filtros = []): array
    {
        $builder = $this->builder();

        // Filtro por query (nome ou RA)
        if (!empty($filtros['q'])) {
            $builder->groupStart()
                    ->like('nome', $filtros['q'])
                    ->orLike('ra', $filtros['q'])
                    ->orLike('nome_social', $filtros['q'])
                    ->groupEnd();
        }

        // Filtro por curso
        if (!empty($filtros['curso'])) {
            $builder->like('curso_nome', $filtros['curso']);
        }

        // Filtro por série
        if (!empty($filtros['serie'])) {
            $builder->where('serie', $filtros['serie']);
        }

        // Filtro por turma
        if (!empty($filtros['turma'])) {
            $builder->where('turma', $filtros['turma']);
        }

        // Filtro por status (padrão: apenas ativos)
        if (isset($filtros['status'])) {
            $builder->where('status', $filtros['status']);
        } else {
            $builder->where('status', 'MAT'); // Apenas matriculados
        }

        return $builder->orderBy('nome', 'ASC')->get()->getResultArray();
    }

    /**
     * Busca paginada de alunos
     *
     * @param array $filtros
     * @param int $perPage
     * @param int $page
     * @return array
     */
    public function paginate(array $filtros = [], int $perPage = 20, int $page = 1): array
    {
        $builder = $this->builder();

        // Aplicar filtros
        if (!empty($filtros['q'])) {
            $builder->groupStart()
                    ->like('nome', $filtros['q'])
                    ->orLike('ra', $filtros['q'])
                    ->orLike('nome_social', $filtros['q'])
                    ->groupEnd();
        }

        if (!empty($filtros['curso'])) {
            $builder->like('curso_nome', $filtros['curso']);
        }

        if (!empty($filtros['serie'])) {
            $builder->where('serie', $filtros['serie']);
        }

        if (!empty($filtros['turma'])) {
            $builder->where('turma', $filtros['turma']);
        }

        if (isset($filtros['status'])) {
            $builder->where('status', $filtros['status']);
        } else {
            $builder->where('status', 'MAT');
        }

        // Contar total
        $total = $builder->countAllResults(false);

        // Aplicar paginação
        $offset = ($page - 1) * $perPage;
        $alunos = $builder->orderBy('nome', 'ASC')
                         ->limit($perPage, $offset)
                         ->get()
                         ->getResultArray();

        return [
            'alunos' => $alunos,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => ceil($total / $perPage)
        ];
    }

    /**
     * Verifica se o aluno existe
     *
     * @param int $ra
     * @return bool
     */
    public function exists(int $ra): bool
    {
        return $this->where('ra', $ra)->countAllResults() > 0;
    }

    /**
     * Busca alunos por responsável (CPF)
     *
     * @param string $cpfResponsavel
     * @return array
     */
    public function findByResponsavel(string $cpfResponsavel): array
    {
        return $this->where('cpf_resp', $cpfResponsavel)
                   ->orWhere('cpf_resp_fin', $cpfResponsavel)
                   ->orderBy('nome', 'ASC')
                   ->findAll();
    }

    /**
     * Busca resumida para listagens (apenas campos essenciais)
     *
     * @param array $filtros
     * @param int $perPage
     * @param int $page
     * @return array
     */
    public function paginateResumo(array $filtros = [], int $perPage = 20, int $page = 1): array
    {
        $builder = $this->builder();
        
        // Selecionar apenas campos essenciais
        $builder->select('ra, nome, nome_social, curso_nome, serie, turma, status');

        // Aplicar filtros
        if (!empty($filtros['q'])) {
            $builder->groupStart()
                    ->like('nome', $filtros['q'])
                    ->orLike('ra', $filtros['q'])
                    ->orLike('nome_social', $filtros['q'])
                    ->groupEnd();
        }

        if (!empty($filtros['curso'])) {
            $builder->like('curso_nome', $filtros['curso']);
        }

        if (!empty($filtros['serie'])) {
            $builder->where('serie', $filtros['serie']);
        }

        if (!empty($filtros['turma'])) {
            $builder->where('turma', $filtros['turma']);
        }

        if (isset($filtros['status'])) {
            $builder->where('status', $filtros['status']);
        } else {
            $builder->where('status', 'MAT');
        }

        // Contar total
        $total = $builder->countAllResults(false);

        // Aplicar paginação
        $offset = ($page - 1) * $perPage;
        $alunos = $builder->orderBy('nome', 'ASC')
                         ->limit($perPage, $offset)
                         ->get()
                         ->getResultArray();

        return [
            'alunos' => $alunos,
            'total' => $total,
            'page' => $page,
            'perPage' => $perPage,
            'totalPages' => ceil($total / $perPage)
        ];
    }
}