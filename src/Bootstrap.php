<?php

namespace App;

class Bootstrap
{
    public function run(): void
    {
        session_start();
        $uri = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH);
        $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

        $routes = $this->routes();
        foreach ($routes as $route) {
            if ($route['method'] === $method && $route['path'] === $uri) {
                $this->dispatch($route['handler']);
                return; // encerra após atender rota
            }
        }
        http_response_code(404);
        echo 'Página não encontrada';
    }

    private function routes(): array
    {
        return [
            ['method' => 'GET', 'path' => '/', 'handler' => [Controllers\HomeController::class, 'index']],
            ['method' => 'GET', 'path' => '/login', 'handler' => [Controllers\AuthController::class, 'showLogin']],
            ['method' => 'POST', 'path' => '/login', 'handler' => [Controllers\AuthController::class, 'login']],
            ['method' => 'POST', 'path' => '/logout', 'handler' => [Controllers\AuthController::class, 'logout']],
            // Funcionários (RF003)
            ['method' => 'GET', 'path' => '/funcionarios', 'handler' => [Controllers\FuncionarioController::class, 'list']],
            ['method' => 'GET', 'path' => '/funcionarios/novo', 'handler' => [Controllers\FuncionarioController::class, 'createForm']],
            ['method' => 'POST', 'path' => '/funcionarios', 'handler' => [Controllers\FuncionarioController::class, 'store']],
            ['method' => 'GET', 'path' => '/funcionarios/editar', 'handler' => [Controllers\FuncionarioController::class, 'editForm']],
            ['method' => 'POST', 'path' => '/funcionarios/editar', 'handler' => [Controllers\FuncionarioController::class, 'update']],
            ['method' => 'POST', 'path' => '/funcionarios/inativar', 'handler' => [Controllers\FuncionarioController::class, 'inactivate']],
        ];
    }

    private function dispatch(array $handler): void
    {
        [$class, $method] = $handler;
        if (!class_exists($class)) {
            http_response_code(500);
            echo 'Handler não encontrado';
            return;
        }

        $pdo = $this->pdo();
        $controller = new $class($pdo);
        if (!method_exists($controller, $method)) {
            http_response_code(500);
            echo 'Método handler inválido';
            return;
        }
        $controller->$method();
    }

    private function pdo(): \PDO
    {
        static $pdo = null;
        if ($pdo) {
            return $pdo;
        }
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
        return $pdo;
    }
}
