<?php

/**
 * Script para criar usuário administrador inicial
 * Execute: php spark criar:admin
 */

namespace App\Commands;

use CodeIgniter\CLI\BaseCommand;
use CodeIgniter\CLI\CLI;
use App\Models\FuncionarioCantinaModel;

class CriarAdmin extends BaseCommand
{
    protected $group = 'cantina';
    protected $name = 'criar:admin';
    protected $description = 'Cria um usuário administrador inicial para a cantina';

    public function run(array $params)
    {
        $funcionarioModel = new FuncionarioCantinaModel();

        CLI::write('=== Criar Administrador da Cantina ===', 'yellow');
        CLI::newLine();

        // Solicitar dados
        $usuario = CLI::prompt('Nome de usuário');
        $senha = CLI::prompt('Senha (mínimo 6 caracteres)');
        $nome = CLI::prompt('Nome completo');
        $email = CLI::prompt('Email (opcional)', '');

        // Validar dados básicos
        if (strlen($usuario) < 3) {
            CLI::error('Usuário deve ter pelo menos 3 caracteres');
            return;
        }

        if (strlen($senha) < 6) {
            CLI::error('Senha deve ter pelo menos 6 caracteres');
            return;
        }

        if (strlen($nome) < 3) {
            CLI::error('Nome deve ter pelo menos 3 caracteres');
            return;
        }

        // Verificar se usuário já existe
        if ($funcionarioModel->findByUsuario($usuario)) {
            CLI::error('Usuário já existe');
            return;
        }

        // Criar administrador
        $data = [
            'usuario' => $usuario,
            'senha' => $senha, // Será hasheada automaticamente pelo model
            'nome' => $nome,
            'email' => $email ?: null,
            'tipo' => 'administrador',
            'ativo' => 1
        ];

        try {
            $id = $funcionarioModel->insert($data);
            
            if ($id) {
                CLI::write('Administrador criado com sucesso!', 'green');
                CLI::write('ID: ' . $id, 'green');
                CLI::write('Usuário: ' . $usuario, 'green');
                CLI::write('Tipo: administrador', 'green');
            } else {
                CLI::error('Erro ao criar administrador');
                $errors = $funcionarioModel->errors();
                if ($errors) {
                    foreach ($errors as $error) {
                        CLI::error($error);
                    }
                }
            }
        } catch (\Exception $e) {
            CLI::error('Erro: ' . $e->getMessage());
        }
    }
}
