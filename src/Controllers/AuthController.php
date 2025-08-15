<?php

namespace App\Controllers;

use App\Services\AuthService;
use PDO;

class AuthController
{
    private AuthService $authService;

    public function __construct(private PDO $pdo)
    {
        $this->authService = new AuthService($pdo);
    }

    public function showLogin(): void
    {
        if (!empty($_SESSION['user'])) {
            header('Location: /');
            return;
        }
        $error = $_GET['error'] ?? null;
        echo '<!doctype html><html><head><meta charset="utf-8"><title>Login</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></head><body class="p-4">';
        echo '<div class="container" style="max-width:420px">';
        echo '<h1 class="h4 mb-3">Login</h1>';
        if ($error) {
            echo '<div class="alert alert-danger">' . htmlspecialchars($error) . '</div>';
        }
        echo '<form method="post" action="/login">';
        echo '<div class="mb-3"><label class="form-label">E-mail ou CPF</label><input name="login" class="form-control" required autofocus></div>';
        echo '<div class="mb-3"><label class="form-label">Senha</label><input name="senha" type="password" class="form-control" required></div>';
        echo '<button class="btn btn-primary w-100">Entrar</button>';
        echo '</form>';
        echo '<p class="mt-3"><a href="/">Voltar</a></p>';
        echo '</div></body></html>';
    }

    public function login(): void
    {
        $login = trim($_POST['login'] ?? '');
        $senha = $_POST['senha'] ?? '';
        if ($login === '' || $senha === '') {
            header('Location: /login?error=Credenciais+inválidas');
            return;
        }
        $ok = $this->authService->authenticate($login, $senha, $_SERVER['REMOTE_ADDR'] ?? null, $_SERVER['HTTP_USER_AGENT'] ?? null);
        if (!$ok) {
            header('Location: /login?error=Credenciais+inválidas+ou+usuário+bloqueado');
            return;
        }
        header('Location: /');
    }

    public function logout(): void
    {
        $_SESSION = [];
        session_destroy();
        header('Location: /');
    }
}
