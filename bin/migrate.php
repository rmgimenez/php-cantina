<?php

use App\Env;
use App\DatabaseConnection;
use App\Migration;

require_once __DIR__ . '/../vendor/autoload.php';

Env::load(__DIR__ . '/../.env');

$config = [
    'host' => Env::get('DB_HOST', '127.0.0.1'),
    'port' => Env::get('DB_PORT', '3306'),
    'database' => Env::get('DB_DATABASE', 'cantina'),
    'username' => Env::get('DB_USERNAME', 'root'),
    'password' => Env::get('DB_PASSWORD', ''),
];

$conn = new DatabaseConnection($config);
$pdo = $conn->pdo();
$pdo->exec('CREATE TABLE IF NOT EXISTS cant_migration (id VARCHAR(64) PRIMARY KEY, executed_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP)');

$migrationsPath = __DIR__ . '/../database/migrations';
$files = glob($migrationsPath . '/*.php');
sort($files);

$executed = $pdo->query('SELECT id FROM cant_migration')->fetchAll(PDO::FETCH_COLUMN);
$executed = array_flip($executed);

$applied = 0;
foreach ($files as $file) {
    require_once $file;
    $className = pathinfo($file, PATHINFO_FILENAME);
    // Converter para PascalCase se necessário: já adotaremos nome direto
    if (!class_exists($className)) {
        // fallback: tentar App\\Migrations namespace
        $nsClass = 'App\\Migrations\\' . $className;
        if (class_exists($nsClass)) {
            $className = $nsClass;
        }
    }
    if (!class_exists($className)) {
        echo "Ignorando arquivo $file (classe não encontrada)\n";
        continue;
    }
    /** @var Migration $migration */
    $migration = new $className();
    $id = $migration->getId();
    if (isset($executed[$id])) {
        continue;
    }
    echo 'Aplicando migration ' . $id . PHP_EOL;
    $pdo->beginTransaction();
    try {
        $migration->up($pdo);
        $stmt = $pdo->prepare('INSERT INTO cant_migration (id) VALUES (?)');
        $stmt->execute([$id]);
        $pdo->commit();
        $applied++;
    } catch (Throwable $e) {
        $pdo->rollBack();
        fwrite(STDERR, 'Falha na migration ' . $id . ': ' . $e->getMessage() . PHP_EOL);
        exit(1);
    }
}

echo $applied . ' migrations aplicadas.' . PHP_EOL;
