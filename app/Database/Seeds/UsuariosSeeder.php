<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class UsuariosSeeder extends Seeder
{
    public function run()
    {
        // Dados dos usuários padrão para teste
        $usuarios = [
            [
                'nome' => 'Admin Sistema',
                'email' => 'admin@cantina.local',
                'cpf' => '000.000.000-01',
                'senha_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'tipo' => 'informatica',
                'status' => 'ativo',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'nome' => 'Gerente Cantina',
                'email' => 'gerente@cantina.local',
                'cpf' => '000.000.000-02',
                'senha_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'tipo' => 'gerente',
                'status' => 'ativo',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'nome' => 'Supervisor Cantina',
                'email' => 'supervisor@cantina.local',
                'cpf' => '000.000.000-03',
                'senha_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'tipo' => 'supervisor',
                'status' => 'ativo',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'nome' => 'Operador Caixa',
                'email' => 'caixa@cantina.local',
                'cpf' => '000.000.000-04',
                'senha_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'tipo' => 'caixa',
                'status' => 'ativo',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];

        // Limpar tabela antes de inserir (apenas em desenvolvimento)
        $this->db->table('cant_usuarios')->truncate();

        // Inserir usuários
        foreach ($usuarios as $usuario) {
            $this->db->table('cant_usuarios')->insert($usuario);
        }

        echo "Usuários criados com sucesso!\n";
        echo "- admin@cantina.local / 123456 (Informática)\n";
        echo "- gerente@cantina.local / 123456 (Gerente)\n";
        echo "- supervisor@cantina.local / 123456 (Supervisor)\n";
        echo "- caixa@cantina.local / 123456 (Caixa)\n";
    }
}
