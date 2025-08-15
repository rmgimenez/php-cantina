<?php

namespace App\Repositories;

use PDO;

class PapelRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function listFuncionariosPapeis(): array
    {
        $stmt = $this->pdo->query('SELECT id, codigo FROM cant_papel WHERE codigo <> "responsavel" ORDER BY id');
        return $stmt->fetchAll();
    }
}
