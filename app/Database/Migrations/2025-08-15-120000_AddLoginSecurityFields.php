<?php

namespace App\Database\Migrations;

use CodeIgniter\Database\Migration;

class AddLoginSecurityFields extends Migration
{
    public function up()
    {
        $this->forge->addColumn('cant_usuarios', [
            'tentativas_login' => [
                'type' => 'TINYINT',
                'constraint' => 3,
                'unsigned' => true,
                'default' => 0,
                'after' => 'ultimo_acesso'
            ],
            'bloqueado_ate' => [
                'type' => 'DATETIME',
                'null' => true,
                'after' => 'tentativas_login'
            ],
            'ip_ultimo_acesso' => [
                'type' => 'VARCHAR',
                'constraint' => 45,
                'null' => true,
                'after' => 'bloqueado_ate'
            ],
            'user_agent' => [
                'type' => 'TEXT',
                'null' => true,
                'after' => 'ip_ultimo_acesso'
            ],
            'created_at' => [
                'type' => 'DATETIME',
                'null' => true,
                'after' => 'user_agent'
            ],
            'updated_at' => [
                'type' => 'DATETIME',
                'null' => true,
                'after' => 'created_at'
            ]
        ]);
    }

    public function down()
    {
        $this->forge->dropColumn('cant_usuarios', [
            'tentativas_login',
            'bloqueado_ate',
            'ip_ultimo_acesso',
            'user_agent',
            'created_at',
            'updated_at'
        ]);
    }
}
