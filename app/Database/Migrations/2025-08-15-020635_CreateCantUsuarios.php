<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateCantUsuarios extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'BIGINT',
                'constraint' => 20,
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'nome' => [
                'type' => 'VARCHAR',
                'constraint' => '150',
                'null' => false,
            ],
            'email' => [
                'type' => 'VARCHAR',
                'constraint' => '150',
                'null' => true,
                'default' => null,
            ],
            'cpf' => [
                'type' => 'CHAR',
                'constraint' => '11',
                'null' => true,
                'default' => null,
            ],
            'senha_hash' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
                'null' => false,
            ],
            'tipo' => [
                'type' => 'ENUM',
                'constraint' => ['caixa', 'supervisor', 'gerente', 'informatica', 'responsavel'],
                'default' => 'caixa',
            ],
            'status' => [
                'type' => 'ENUM',
                'constraint' => ['ativo', 'inativo', 'bloqueado'],
                'default' => 'ativo',
            ],
            'ultimo_acesso' => [
                'type' => 'DATETIME',
                'null' => true,
                'default' => null,
            ],
            'tentativas_login' => [
                'type' => 'INT',
                'constraint' => 11,
                'null' => false,
                'default' => 0,
            ],
            'bloqueado_ate' => [
                'type' => 'DATETIME',
                'null' => true,
                'default' => null,
            ],
            'created_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
                'default' => 'CURRENT_TIMESTAMP',
            ],
            'updated_at' => [
                'type' => 'TIMESTAMP',
                'null' => true,
                'default' => 'CURRENT_TIMESTAMP',
                'on_update' => true,
            ],
        ]);

        $this->forge->addKey('id', true);
    $this->forge->addKey('email', false, true);
    $this->forge->addKey('cpf', false, true);
        $this->forge->addKey('tipo', false);

        // Create unique keys for email and cpf
        $attributes = ['ENGINE' => 'InnoDB', 'CHARSET' => 'utf8mb4', 'COLLATION' => 'utf8mb4_unicode_ci'];
        $this->forge->createTable('cant_usuario', true, $attributes);

    // unique constraints already added via addKey above
    }

    public function down()
    {
    $this->forge->dropTable('cant_usuario', true);
    }
}
