<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class FuncionarioCantinaSeeder extends Seeder
{
    public function run()
    {
        $data = [
            'usuario' => 'admin',
            'senha' => password_hash('123456', PASSWORD_DEFAULT),
            'nome' => 'Administrador do Sistema',
            'email' => 'admin@escola.com',
            'telefone' => '(11) 99999-9999',
            'tipo' => 'administrador',
            'ativo' => 1
        ];

        // Verifica se já existe antes de inserir
        $builder = $this->db->table('cant_funcionarios');
        $existing = $builder->where('usuario', 'admin')->get()->getRow();
        
        if (!$existing) {
            $builder->insert($data);
            echo "Usuário admin criado com sucesso!\n";
        } else {
            echo "Usuário admin já existe.\n";
        }
    }
}
