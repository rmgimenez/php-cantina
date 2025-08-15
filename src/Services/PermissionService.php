<?php

namespace App\Services;

use PDO;

class PermissionService
{
    public function __construct(private PDO $pdo)
    {
    }

    public function userHasPermission(int $userId, string $permissionCode): bool
    {
        $stmt = $this->pdo->prepare('SELECT p.codigo FROM cant_usuario u JOIN cant_papel p ON p.id = u.papel_id WHERE u.id = ?');
        $stmt->execute([$userId]);
        $papel = $stmt->fetchColumn();
        if ($papel === 'informatica') { // RN004
            return true;
        }
        $stmt = $this->pdo->prepare('SELECT 1 FROM cant_usuario u JOIN cant_papel_permissao pp ON pp.papel_id = u.papel_id JOIN cant_permissao perm ON perm.id = pp.permissao_id WHERE u.id = ? AND perm.codigo = ? LIMIT 1');
        $stmt->execute([$userId, $permissionCode]);
        return (bool)$stmt->fetchColumn();
    }

    public function loadPermissionsForUser(int $userId): array
    {
        $stmt = $this->pdo->prepare('SELECT p.codigo FROM cant_usuario u JOIN cant_papel_permissao pp ON pp.papel_id = u.papel_id JOIN cant_permissao p ON p.id = pp.permissao_id WHERE u.id = ?');
        $stmt->execute([$userId]);
        return array_column($stmt->fetchAll(), 'codigo');
    }
}
