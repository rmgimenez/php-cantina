<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateUsuariosCantina extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'nome' => [
                'type' => 'VARCHAR',
                'constraint' => '200',
                'null' => false,
            ],
            'email' => [
                'type' => 'VARCHAR',
                'constraint' => '150',
                'null' => true,
            ],
            'cpf' => [
                'type' => 'VARCHAR',
                'constraint' => '14',
                'null' => true,
            ],
            'senha_hash' => [
                'type' => 'VARCHAR',
                'constraint' => '255',
                'null' => false,
            ],
            'tipo' => [
                'type' => "ENUM('caixa','supervisor','gerente','informatica')",
                'null' => false,
                'default' => 'caixa',
            ],
            'status' => [
                'type' => "ENUM('ativo','inativo')",
                'null' => false,
                'default' => 'ativo',
            ],
            'ultimo_acesso' => [
                'type' => 'DATETIME',
                'null' => true,
            ],

        ]);

        $this->forge->addKey('id', true);
        $this->forge->addUniqueKey('email');
        $this->forge->addUniqueKey('cpf');
        $this->forge->createTable('cant_usuarios', true);
    }

    public function down()
    {
        $this->forge->dropTable('cant_usuarios', true);
    }
}
