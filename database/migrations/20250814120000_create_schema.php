<?php

use App\Migration;
use PDO;

class CreateSchema20250814120000 implements Migration
{
    public function getId(): string
    {
        return '20250814120000_create_schema';
    }

    public function up(PDO $pdo): void
    {
        $sql = file_get_contents(__DIR__ . '/../../bancodados.sql');
        $commands = array_filter(array_map('trim', preg_split('/;\s*\n/', $sql)));
        foreach ($commands as $command) {
            if ($command === '' || str_starts_with($command, '--')) {
                continue;
            }
            $pdo->exec($command);
        }
    }
}
