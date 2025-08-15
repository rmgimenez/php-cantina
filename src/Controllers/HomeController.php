<?php

namespace App\Controllers;

use PDO;

class HomeController
{
    public function __construct(private PDO $pdo)
    {
    }

    public function index(): void
    {
        $user = $_SESSION['user'] ?? null;
        echo '<!doctype html><html><head><meta charset="utf-8"><title>Dashboard</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></head><body class="p-4">';
        echo '<div class="container">';
        echo '<h1>PHP Cantina</h1>';
        if ($user) {
            echo '<p>Logado como <strong>' . htmlspecialchars($user['nome']) . '</strong> (papel: ' . htmlspecialchars($user['papelCodigo']) . ')</p>';
            echo '<form method="post" action="/logout" class="d-inline me-2">';
            echo '<button class="btn btn-sm btn-outline-secondary">Sair</button>';
            echo '</form>';
            if (in_array('usuario.gerir', $user['permissoes'] ?? [])) {
                echo '<a class="btn btn-sm btn-primary" href="/funcionarios">Funcionários</a>';
            }
        } else {
            echo '<p><a href="/login" class="btn btn-primary">Login</a></p>';
        }
        echo '<hr><p>MVP inicial - RF001/RF002/RF003 (básico).</p>';
        echo '</div></body></html>';
    }
}
