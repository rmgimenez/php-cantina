<?php

namespace App\Repositories;

use PDO;

class FuncionarioRepository
{
    public function __construct(private PDO $pdo)
    {
    }

    public function createFuncionario(int $usuarioId, ?string $matricula, ?string $tipoContratacao, ?string $dataAdmissao): void
    {
        $stmt = $this->pdo->prepare('INSERT INTO cant_funcionario(usuario_id, matricula, tipo_contratacao, data_admissao, ativo) VALUES(?,?,?,?,1)');
        $stmt->execute([$usuarioId, $matricula, $tipoContratacao, $dataAdmissao]);
    }

    public function listAllWithUser(): array
    {
        $sql = 'SELECT f.id, f.matricula, f.ativo, u.nome, u.email, u.cpf, u.papel_id, p.codigo AS papelCodigo FROM cant_funcionario f JOIN cant_usuario u ON u.id = f.usuario_id JOIN cant_papel p ON p.id = u.papel_id ORDER BY u.nome';
        return $this->pdo->query($sql)->fetchAll();
    }

    public function findWithUser(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT f.*, u.nome, u.email, u.cpf, u.papel_id, u.id AS usuario_id FROM cant_funcionario f JOIN cant_usuario u ON u.id = f.usuario_id WHERE f.id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }

    public function updateFuncionario(int $id, array $data): void
    {
        $stmt = $this->pdo->prepare('UPDATE cant_funcionario SET matricula = :matricula, tipo_contratacao = :tipo_contratacao, data_admissao = :data_admissao WHERE id = :id');
        $stmt->execute([
            ':matricula' => $data['matricula'],
            ':tipo_contratacao' => $data['tipo_contratacao'],
            ':data_admissao' => $data['data_admissao'],
            ':id' => $id,
        ]);
    }

    public function inactivate(int $id, int $usuarioId): void
    {
        $this->pdo->prepare('UPDATE cant_funcionario SET ativo = 0 WHERE id = ?')->execute([$id]);
        $this->pdo->prepare('INSERT INTO cant_auditoria(usuario_id, acao, entidade, entidade_id) VALUES(?,?,?,?)')
            ->execute([$usuarioId, 'inativar_funcionario', 'funcionario', $id]);
    }

    public function hasOpenInvoice(int $funcionarioId): bool
    {
        $stmt = $this->pdo->prepare('SELECT 1 FROM cant_fatura_func WHERE funcionario_id = ? AND status = "aberta" LIMIT 1');
        $stmt->execute([$funcionarioId]);
        return (bool)$stmt->fetchColumn();
    }
}
