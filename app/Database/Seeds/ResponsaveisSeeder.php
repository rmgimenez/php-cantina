<?php

namespace App\Database\Seeds;

use CodeIgniter\Database\Seeder;

class ResponsaveisSeeder extends Seeder
{
    public function run()
    {
        // Dados de responsáveis para teste
        $responsaveis = [
            [
                'aps_id' => 1,
                'nome' => 'Maria Silva Santos',
                'cpf' => '123.456.789-01',
                'email' => 'maria.silva@email.com',
                'telefone' => '(11) 99999-1234',
                'senha_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'status' => 'ativo',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'aps_id' => 2,
                'nome' => 'João Carlos Oliveira',
                'cpf' => '123.456.789-02',
                'email' => 'joao.oliveira@email.com',
                'telefone' => '(11) 99999-5678',
                'senha_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'status' => 'ativo',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
            [
                'aps_id' => 3,
                'nome' => 'Ana Paula Costa',
                'cpf' => '123.456.789-03',
                'email' => 'ana.costa@email.com',
                'telefone' => '(11) 99999-9876',
                'senha_hash' => password_hash('123456', PASSWORD_DEFAULT),
                'status' => 'ativo',
                'created_at' => date('Y-m-d H:i:s'),
                'updated_at' => date('Y-m-d H:i:s'),
            ],
        ];

        // Limpar tabela antes de inserir (apenas em desenvolvimento)
        $this->db->table('cant_responsaveis')->truncate();

        // Inserir responsáveis
        foreach ($responsaveis as $responsavel) {
            $this->db->table('cant_responsaveis')->insert($responsavel);
        }

        echo "Responsáveis criados com sucesso!\n";
        echo "- 123.456.789-01 / 123456 (Maria Silva Santos)\n";
        echo "- 123.456.789-02 / 123456 (João Carlos Oliveira)\n";
        echo "- 123.456.789-03 / 123456 (Ana Paula Costa)\n";
    }
}
