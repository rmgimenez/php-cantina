<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Model para gerenciamento dos funcionários da cantina
 */
class FuncionarioCantinaModel extends Model
{
    protected $table = 'cant_funcionarios';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'usuario',
        'senha',
        'nome',
        'email',
        'telefone',
        'tipo',
        'ativo'
    ];

    // Validação
    protected $validationRules = [
        'usuario' => 'required|min_length[3]|max_length[50]|is_unique[cant_funcionarios.usuario,id,{id}]',
        'senha' => 'required|min_length[6]',
        'nome' => 'required|min_length[3]|max_length[255]',
        'email' => 'permit_empty|valid_email|max_length[255]',
        'telefone' => 'permit_empty|max_length[20]',
        'tipo' => 'required|in_list[administrador,atendente,estoquista]',
        'ativo' => 'permit_empty|in_list[0,1]'
    ];

    protected $validationMessages = [
        'usuario' => [
            'required' => 'O usuário é obrigatório',
            'min_length' => 'O usuário deve ter pelo menos 3 caracteres',
            'max_length' => 'O usuário não pode ter mais de 50 caracteres',
            'is_unique' => 'Este usuário já está em uso'
        ],
        'senha' => [
            'required' => 'A senha é obrigatória',
            'min_length' => 'A senha deve ter pelo menos 6 caracteres'
        ],
        'nome' => [
            'required' => 'O nome é obrigatório',
            'min_length' => 'O nome deve ter pelo menos 3 caracteres',
            'max_length' => 'O nome não pode ter mais de 255 caracteres'
        ],
        'email' => [
            'valid_email' => 'Formato de email inválido',
            'max_length' => 'O email não pode ter mais de 255 caracteres'
        ],
        'telefone' => [
            'max_length' => 'O telefone não pode ter mais de 20 caracteres'
        ],
        'tipo' => [
            'required' => 'O tipo de funcionário é obrigatório',
            'in_list' => 'Tipo inválido. Deve ser: administrador, atendente ou estoquista'
        ]
    ];

    // Eventos
    protected $beforeInsert = ['hashPassword'];
    protected $beforeUpdate = ['hashPassword'];

    /**
     * Hash da senha antes de inserir/atualizar
     */
    protected function hashPassword(array $data)
    {
        if (isset($data['data']['senha'])) {
            $data['data']['senha'] = password_hash($data['data']['senha'], PASSWORD_DEFAULT);
        }

        return $data;
    }

    /**
     * Busca funcionário por usuário
     *
     * @param string $usuario
     * @return array|null
     */
    public function findByUsuario(string $usuario): ?array
    {
        return $this->where('usuario', $usuario)
                   ->where('ativo', 1)
                   ->first();
    }

    /**
     * Verifica se a senha está correta
     *
     * @param string $senha
     * @param string $hash
     * @return bool
     */
    public function verificarSenha(string $senha, string $hash): bool
    {
        return password_verify($senha, $hash);
    }

    /**
     * Busca funcionários por tipo
     *
     * @param string $tipo
     * @return array
     */
    public function findByTipo(string $tipo): array
    {
        return $this->where('tipo', $tipo)
                   ->where('ativo', 1)
                   ->findAll();
    }

    /**
     * Lista funcionários ativos
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
     * Desativa funcionário em vez de deletar
     *
     * @param int $id
     * @return bool
     */
    public function desativar(int $id): bool
    {
        return $this->update($id, ['ativo' => 0]);
    }

    /**
     * Ativa funcionário
     *
     * @param int $id
     * @return bool
     */
    public function ativar(int $id): bool
    {
        return $this->update($id, ['ativo' => 1]);
    }

    /**
     * Atualiza último acesso
     *
     * @param int $id
     * @return bool
     */
    public function atualizarUltimoAcesso(int $id): bool
    {
        return $this->set('data_atualizacao', 'NOW()', false)
                   ->where('id', $id)
                   ->update();
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

        if (!empty($filtros['usuario'])) {
            $builder->like('usuario', $filtros['usuario']);
        }

        if (!empty($filtros['tipo'])) {
            $builder->where('tipo', $filtros['tipo']);
        }

        if (isset($filtros['ativo'])) {
            $builder->where('ativo', $filtros['ativo']);
        } else {
            $builder->where('ativo', 1); // Por padrão, só ativos
        }

        return $builder->orderBy('nome', 'ASC')->get()->getResultArray();
    }

    /**
     * Conta funcionários por tipo
     *
     * @return array
     */
    public function contarPorTipo(): array
    {
        return $this->select('tipo, COUNT(*) as total')
                   ->where('ativo', 1)
                   ->groupBy('tipo')
                   ->findAll();
    }
}
