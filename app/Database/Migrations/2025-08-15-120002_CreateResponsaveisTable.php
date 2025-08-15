<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateResponsaveisTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'aps_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
                'comment' => 'ID do responsável no sistema APS'
            ],
            'nome' => [
                'type' => 'VARCHAR',
                'constraint' => '200',
                'null' => false,
            ],
            'cpf' => [
                'type' => 'VARCHAR',
                'constraint' => '14',
                'null' => false,
            ],
            'email' => [
                'type' => 'VARCHAR',
                'constraint' => '150',
                'null' => true,
            ],
            'telefone' => [
                'type' => 'VARCHAR',
                'constraint' => '20',
                'null' => true,
            ],
            'senha_hash' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
                'null' => true,
                'comment' => 'Senha para acesso ao portal do responsável'
            ],
            'status' => [
                'type' => "ENUM('ativo','inativo')",
                'null' => false,
                'default' => 'ativo',
            ],
            'tentativas_login' => [
                'type' => 'TINYINT',
                'constraint' => 3,
                'unsigned' => true,
                'default' => 0,
            ],
            'bloqueado_ate' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'ultimo_acesso' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'ip_ultimo_acesso' => [
                'type' => 'VARCHAR',
                'constraint' => '45',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('cpf');
        $this->forge->addKey('aps_id');
        $this->forge->addKey('email');
        $this->forge->createTable('cant_responsaveis', true);
    }

    public function down()
    {
        $this->forge->dropTable('cant_responsaveis', true);
    }
}
