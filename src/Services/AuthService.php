<?php

namespace App\Services;

use App\Repositories\UserRepository;
use PDO;

class AuthService
{
    private UserRepository $userRepository;
    private PermissionService $permissionService;
    private const MAX_ATTEMPTS = 5; // RN002
    private const LOCK_MINUTES = 15; // RN002

    public function __construct(private PDO $pdo)
    {
        $this->userRepository = new UserRepository($pdo);
        $this->permissionService = new PermissionService($pdo);
    }

    public function authenticate(string $login, string $senha, ?string $ip, ?string $userAgent): bool
    {
        $user = $this->userRepository->findByEmailOrCpf($login);
        if (!$user) {
            return false;
        }
        if ($user['status'] !== 'ativo') {
            return false;
        }
        if (!empty($user['bloqueado_ate']) && strtotime($user['bloqueado_ate']) > time()) {
            return false;
        }
        $ok = password_verify($senha, $user['senha_hash']);
        if (!$ok) {
            $tentativas = (int)$user['tentativas_login'] + 1;
            $bloqueadoAte = null;
            if ($tentativas >= self::MAX_ATTEMPTS) {
                $bloqueadoAte = date('Y-m-d H:i:s', time() + self::LOCK_MINUTES * 60);
            }
            $this->userRepository->registrarFalhaLogin((int)$user['id'], $tentativas, $bloqueadoAte);
            return false;
        }
        $this->userRepository->registrarSucessoLogin((int)$user['id']);
        $permissoes = $this->permissionService->loadPermissionsForUser((int)$user['id']);
        $_SESSION['user'] = [
            'id' => (int)$user['id'],
            'nome' => $user['nome'],
            'papelCodigo' => $user['papelCodigo'],
            'permissoes' => $permissoes,
        ];
        $this->pdo->prepare('INSERT INTO cant_auditoria(usuario_id, acao, ip, user_agent) VALUES(?,?,?,?)')
            ->execute([(int)$user['id'], 'login', $ip, $userAgent]);
        return true;
    }
}
