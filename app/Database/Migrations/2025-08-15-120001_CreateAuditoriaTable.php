<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class CreateAuditorialTable extends Migration
{
    public function up()
    {
        $this->forge->addField([
            'id' => [
                'type' => 'INT',
                'unsigned' => true,
                'auto_increment' => true,
            ],
            'usuario_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
            ],
            'acao' => [
                'type' => 'VARCHAR',
                'constraint' => '100',
                'null' => false,
            ],
            'entidade' => [
                'type' => 'VARCHAR',
                'constraint' => '100',
                'null' => true,
            ],
            'entidade_id' => [
                'type' => 'INT',
                'unsigned' => true,
                'null' => true,
            ],
            'dados_antes' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'dados_depois' => [
                'type' => 'JSON',
                'null' => true,
            ],
            'ip' => [
                'type' => 'VARCHAR',
                'constraint' => '45',
                'null' => true,
            ],
            'user_agent' => [
                'type' => 'TEXT',
                'null' => true,
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => false,
            ],
        ]);

        $this->forge->addKey('id', true);
        $this->forge->addKey('usuario_id');
        $this->forge->addKey('acao');
        $this->forge->addKey('created_at');
        $this->forge->createTable('cant_auditoria', true);
    }

    public function down()
    {
        $this->forge->dropTable('cant_auditoria', true);
    }
}
