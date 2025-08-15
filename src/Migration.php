<?php

namespace App;

use PDO;

interface Migration
{
    public function getId(): string; // formato YYYYMMDDHHMMSS_descricao
    public function up(PDO $pdo): void;
}
