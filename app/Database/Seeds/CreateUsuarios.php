<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class CreateUsuarios extends Seeder
{
    public function run()
    {
        // Usuarios de teste para os papeis: caixa, supervisor, gerente, informatica
        $passwordHash = password_hash('123456', PASSWORD_BCRYPT);

        $data = [
            [
                'nome' => 'Usuario Caixa',
                'email' => 'caixa@example.com',
                'cpf' => '000.000.000-01',
                'senha_hash' => $passwordHash,
                'tipo' => 'caixa',
                'status' => 'ativo',
                'ultimo_acesso' => null,
            ],
            [
                'nome' => 'Usuario Supervisor',
                'email' => 'supervisor@example.com',
                'cpf' => '000.000.000-02',
                'senha_hash' => $passwordHash,
                'tipo' => 'supervisor',
                'status' => 'ativo',
                'ultimo_acesso' => null,
            ],
            [
                'nome' => 'Usuario Gerente',
                'email' => 'gerente@example.com',
                'cpf' => '000.000.000-03',
                'senha_hash' => $passwordHash,
                'tipo' => 'gerente',
                'status' => 'ativo',
                'ultimo_acesso' => null,
            ],
            [
                'nome' => 'Usuario Informatica',
                'email' => 'informatica@example.com',
                'cpf' => '000.000.000-04',
                'senha_hash' => $passwordHash,
                'tipo' => 'informatica',
                'status' => 'ativo',
                'ultimo_acesso' => null,
            ],
        ];

        // Inserir em lote - tabela definida na migration é 'cant_usuarios'
        $this->db->table('cant_usuarios')->insertBatch($data);
    }
}
