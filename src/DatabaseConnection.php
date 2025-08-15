<?php

namespace App;

use PDO;
use PDOException;

class DatabaseConnection
{
    private PDO $pdo;

    public function __construct(array $config)
    {
        $dsn = 'mysql:host=' . $config['host'] . ';port=' . $config['port'] . ';dbname=' . $config['database'] . ';charset=utf8mb4';
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ];
        try {
            $this->pdo = new PDO($dsn, $config['username'], $config['password'], $options);
        } catch (PDOException $e) {
            throw new \RuntimeException('Erro ao conectar ao banco: ' . $e->getMessage());
        }
    }

    public function pdo(): PDO
    {
        return $this->pdo;
    }
}
