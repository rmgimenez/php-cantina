<?php

namespace App\Repositories;

use PDO;
use RuntimeException;

class UserRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function findByEmailOrCpf(string $login): ?array
    {
        $isCpf = preg_match('/^\d{11}$/', preg_replace('/\D+/', '', $login));
        if ($isCpf) {
            $cpf = preg_replace('/\D+/', '', $login);
            $stmt = $this->pdo->prepare('SELECT u.*, p.codigo AS papelCodigo FROM cant_usuario u JOIN cant_papel p ON p.id = u.papel_id WHERE u.cpf = ? LIMIT 1');
            $stmt->execute([$cpf]);
        } else {
            $stmt = $this->pdo->prepare('SELECT u.*, p.codigo AS papelCodigo FROM cant_usuario u JOIN cant_papel p ON p.id = u.papel_id WHERE u.email = ? LIMIT 1');
            $stmt->execute([$login]);
        }
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function createUser(string $nome, ?string $email, ?string $cpf, string $senha, int $papelId): int
    {
        $hash = password_hash($senha, PASSWORD_BCRYPT); // RN001
        $stmt = $this->pdo->prepare('INSERT INTO cant_usuario(nome, email, cpf, senha_hash, papel_id, status) VALUES(?,?,?,?,?,"ativo")');
        try {
            $stmt->execute([$nome, $email, $cpf ?: null, $hash, $papelId]);
        } catch (\PDOException $e) {
            if ($e->getCode() === '23000') {
                throw new RuntimeException('Duplicidade de email ou CPF');
            }
            throw $e;
        }
        return (int)$this->pdo->lastInsertId();
    }

    public function updateUser(int $usuarioId, array $data): void
    {
        $sets = ['nome = :nome', 'email = :email', 'cpf = :cpf'];
        $params = [
            ':id' => $usuarioId,
            ':nome' => $data['nome'],
            ':email' => $data['email'] ?: null,
            ':cpf' => $data['cpf'] ?: null,
        ];
        if (!empty($data['senha'])) {
            $sets[] = 'senha_hash = :senha_hash';
            $params[':senha_hash'] = password_hash($data['senha'], PASSWORD_BCRYPT);
        }
        $mudouPapel = isset($data['papelId']) && $data['papelId'] && $data['papelId'] !== $data['papelAnteriorId'];
        if ($mudouPapel) {
            $sets[] = 'papel_id = :papel_id';
            $params[':papel_id'] = $data['papelId'];
        }
        $sql = 'UPDATE cant_usuario SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($params);
        if ($mudouPapel) { // RN006 auditoria
            $this->pdo->prepare('INSERT INTO cant_auditoria(usuario_id, acao, entidade, entidade_id, dados_antes, dados_depois, ip, user_agent) VALUES(:uid, "alterar_papel", "usuario", :uid, :antes, :depois, NULL, NULL)')
                ->execute([
                    ':uid' => $usuarioId,
                    ':antes' => json_encode(['papelId' => $data['papelAnteriorId']]),
                    ':depois' => json_encode(['papelId' => $data['papelId']]),
                ]);
        }
    }

    public function registrarFalhaLogin(int $id, int $tentativas, ?string $bloqueadoAte): void
    {
        $stmt = $this->pdo->prepare('UPDATE cant_usuario SET tentativas_login = ?, bloqueado_ate = ? WHERE id = ?');
        $stmt->execute([$tentativas, $bloqueadoAte, $id]);
    }

    public function registrarSucessoLogin(int $id): void
    {
        $stmt = $this->pdo->prepare('UPDATE cant_usuario SET tentativas_login = 0, bloqueado_ate = NULL, ultimo_acesso = NOW() WHERE id = ?');
        $stmt->execute([$id]);
    }
}
