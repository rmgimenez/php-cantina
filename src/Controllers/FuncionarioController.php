<?php

namespace App\Controllers;

use App\Services\PermissionService;
use App\Repositories\FuncionarioRepository;
use App\Repositories\UserRepository;
use App\Repositories\PapelRepository;
use PDO;

class FuncionarioController
{
    private PermissionService $permissionService;
    private FuncionarioRepository $funcionarioRepository;
    private UserRepository $userRepository;
    private PapelRepository $papelRepository;

    public function __construct(private PDO $pdo)
    {
        $this->permissionService = new PermissionService($pdo);
        $this->funcionarioRepository = new FuncionarioRepository($pdo);
        $this->userRepository = new UserRepository($pdo);
        $this->papelRepository = new PapelRepository($pdo);
    }

    private function requireAuth(string $permissionCode): ?array
    {
        $user = $_SESSION['user'] ?? null;
        if (!$user) {
            header('Location: /login');
            return null;
        }
        if (!$this->permissionService->userHasPermission($user['id'], $permissionCode)) {
            http_response_code(403);
            echo 'Acesso negado';
            return null;
        }
        return $user;
    }

    public function list(): void
    {
        if (!$this->requireAuth('usuario.gerir')) { return; }
        $items = $this->funcionarioRepository->listAllWithUser();
        echo '<!doctype html><html><head><meta charset="utf-8"><title>Funcionários</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></head><body class="p-4">';
        echo '<div class="container">';
        echo '<h1 class="h4">Funcionários</h1>';
        echo '<a class="btn btn-sm btn-primary mb-3" href="/funcionarios/novo">Novo</a> <a href="/" class="btn btn-sm btn-secondary">Voltar</a>';
        if (!empty($_GET['error'])) {
            echo '<div class="alert alert-danger">' . htmlspecialchars($_GET['error']) . '</div>';
        }
        echo '<table class="table table-sm table-striped"><thead><tr><th>ID</th><th>Nome</th><th>Papel</th><th>Matrícula</th><th>Ativo</th><th>Ações</th></tr></thead><tbody>';
        foreach ($items as $row) {
            echo '<tr>';
            echo '<td>' . (int)$row['id'] . '</td>';
            echo '<td>' . htmlspecialchars($row['nome']) . '</td>';
            echo '<td>' . htmlspecialchars($row['papelCodigo']) . '</td>';
            echo '<td>' . htmlspecialchars((string)$row['matricula']) . '</td>';
            echo '<td>' . ($row['ativo'] ? 'Sim' : 'Não') . '</td>';
            echo '<td>';
            echo '<a class="btn btn-sm btn-outline-secondary" href="/funcionarios/editar?id=' . (int)$row['id'] . '">Editar</a> ';
            if ($row['ativo']) {
                echo '<form method="post" action="/funcionarios/inativar" style="display:inline" onsubmit="return confirm(\'Inativar?\')">';
                echo '<input type="hidden" name="id" value="' . (int)$row['id'] . '">';
                echo '<button class="btn btn-sm btn-outline-danger">Inativar</button>';
                echo '</form>';
            }
            echo '</td>';
            echo '</tr>';
        }
        echo '</tbody></table>';
        echo '</div></body></html>';
    }

    public function createForm(): void
    {
        if (!$this->requireAuth('usuario.gerir')) { return; }
        $papeis = $this->papelRepository->listFuncionariosPapeis();
        echo '<!doctype html><html><head><meta charset="utf-8"><title>Novo Funcionário</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></head><body class="p-4">';
        echo '<div class="container" style="max-width:640px">';
        echo '<h1 class="h4 mb-3">Novo Funcionário</h1>';
        echo '<form method="post" action="/funcionarios">';
        echo '<div class="mb-3"><label class="form-label">Nome</label><input name="nome" class="form-control" required></div>';
        echo '<div class="mb-3"><label class="form-label">Email</label><input name="email" type="email" class="form-control"></div>';
        echo '<div class="mb-3"><label class="form-label">CPF</label><input name="cpf" class="form-control"></div>';
        echo '<div class="mb-3"><label class="form-label">Matrícula</label><input name="matricula" class="form-control"></div>';
        echo '<div class="mb-3"><label class="form-label">Tipo Contratação</label><input name="tipoContratacao" class="form-control"></div>';
        echo '<div class="mb-3"><label class="form-label">Data Admissão</label><input name="dataAdmissao" type="date" class="form-control"></div>';
        echo '<div class="mb-3"><label class="form-label">Papel</label><select name="papelId" class="form-select" required>';
        foreach ($papeis as $p) {
            echo '<option value="' . (int)$p['id'] . '">' . htmlspecialchars($p['codigo']) . '</option>';
        }
        echo '</select></div>';
        echo '<div class="mb-3"><label class="form-label">Senha Inicial</label><input name="senha" type="password" class="form-control" required></div>';
        echo '<button class="btn btn-primary">Salvar</button> <a href="/funcionarios" class="btn btn-secondary">Cancelar</a>';
        echo '</form></div></body></html>';
    }

    public function store(): void
    {
        if (!$this->requireAuth('usuario.gerir')) { return; }
        $data = [
            'nome' => trim($_POST['nome'] ?? ''),
            'email' => trim($_POST['email'] ?? ''),
            'cpf' => preg_replace('/\D+/', '', $_POST['cpf'] ?? ''),
            'senha' => $_POST['senha'] ?? '',
            'papelId' => (int)($_POST['papelId'] ?? 0),
        ];
        if ($data['nome'] === '' || $data['senha'] === '' || !$data['papelId']) {
            header('Location: /funcionarios/novo?error=Dados+inválidos');
            return;
        }
        $pdo = $this->pdo;
        $pdo->beginTransaction();
        try {
            $usuarioId = $this->userRepository->createUser($data['nome'], $data['email'] ?: null, $data['cpf'] ?: null, $data['senha'], $data['papelId']);
            $this->funcionarioRepository->createFuncionario($usuarioId, trim($_POST['matricula'] ?? ''), trim($_POST['tipoContratacao'] ?? ''), $_POST['dataAdmissao'] ?? null);
            $pdo->commit();
            header('Location: /funcionarios');
        } catch (\Throwable $e) {
            $pdo->rollBack();
            header('Location: /funcionarios/novo?error=' . urlencode('Erro: ' . $e->getMessage()));
        }
    }

    public function editForm(): void
    {
        if (!$this->requireAuth('usuario.gerir')) { return; }
        $id = (int)($_GET['id'] ?? 0);
        $row = $this->funcionarioRepository->findWithUser($id);
        if (!$row) { http_response_code(404); echo 'Não encontrado'; return; }
        $papeis = $this->papelRepository->listFuncionariosPapeis();
        echo '<!doctype html><html><head><meta charset="utf-8"><title>Editar Funcionário</title><link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"></head><body class="p-4">';
        echo '<div class="container" style="max-width:640px">';
        echo '<h1 class="h4 mb-3">Editar Funcionário</h1>';
        echo '<form method="post" action="/funcionarios/editar">';
        echo '<input type="hidden" name="id" value="' . (int)$row['id'] . '">';
        echo '<div class="mb-3"><label class="form-label">Nome</label><input name="nome" class="form-control" value="' . htmlspecialchars($row['nome']) . '" required></div>';
        echo '<div class="mb-3"><label class="form-label">Email</label><input name="email" type="email" class="form-control" value="' . htmlspecialchars((string)$row['email']) . '"></div>';
        echo '<div class="mb-3"><label class="form-label">CPF</label><input name="cpf" class="form-control" value="' . htmlspecialchars((string)$row['cpf']) . '"></div>';
        echo '<div class="mb-3"><label class="form-label">Matrícula</label><input name="matricula" class="form-control" value="' . htmlspecialchars((string)$row['matricula']) . '"></div>';
        echo '<div class="mb-3"><label class="form-label">Tipo Contratação</label><input name="tipoContratacao" class="form-control" value="' . htmlspecialchars((string)$row['tipo_contratacao']) . '"></div>';
        echo '<div class="mb-3"><label class="form-label">Data Admissão</label><input name="dataAdmissao" type="date" class="form-control" value="' . htmlspecialchars((string)$row['data_admissao']) . '"></div>';
        echo '<div class="mb-3"><label class="form-label">Papel</label><select name="papelId" class="form-select" required>';
        foreach ($papeis as $p) {
            $sel = ($p['id'] == $row['papel_id']) ? ' selected' : '';
            echo '<option value="' . (int)$p['id'] . '"' . $sel . '>' . htmlspecialchars($p['codigo']) . '</option>';
        }
        echo '</select></div>';
        echo '<div class="mb-3"><label class="form-label">Senha (deixe em branco para não alterar)</label><input name="senha" type="password" class="form-control"></div>';
        echo '<button class="btn btn-primary">Salvar</button> <a href="/funcionarios" class="btn btn-secondary">Cancelar</a>';
        echo '</form></div></body></html>';
    }

    public function update(): void
    {
        if (!$this->requireAuth('usuario.gerir')) { return; }
        $id = (int)($_POST['id'] ?? 0);
        $row = $this->funcionarioRepository->findWithUser($id);
        if (!$row) { http_response_code(404); echo 'Não encontrado'; return; }
        $pdo = $this->pdo;
        $pdo->beginTransaction();
        try {
            $novoPapelId = (int)($_POST['papelId'] ?? $row['papel_id']);
            $this->userRepository->updateUser((int)$row['usuario_id'], [
                'nome' => trim($_POST['nome'] ?? $row['nome']),
                'email' => trim($_POST['email'] ?? ''),
                'cpf' => preg_replace('/\D+/', '', $_POST['cpf'] ?? ''),
                'papelId' => $novoPapelId,
                'senha' => $_POST['senha'] ?? '',
                'papelAnteriorId' => $row['papel_id'],
            ]);
            $this->funcionarioRepository->updateFuncionario($id, [
                'matricula' => trim($_POST['matricula'] ?? ''),
                'tipo_contratacao' => trim($_POST['tipoContratacao'] ?? ''),
                'data_admissao' => $_POST['dataAdmissao'] ?? null,
            ]);
            $pdo->commit();
            header('Location: /funcionarios');
        } catch (\Throwable $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo 'Erro: ' . htmlspecialchars($e->getMessage());
        }
    }

    public function inactivate(): void
    {
        if (!$this->requireAuth('usuario.gerir')) { return; }
        $id = (int)($_POST['id'] ?? 0);
        $row = $this->funcionarioRepository->findWithUser($id);
        if (!$row) { http_response_code(404); echo 'Não encontrado'; return; }
        if ($this->funcionarioRepository->hasOpenInvoice($id)) { // RN005
            header('Location: /funcionarios?error=Fatura+aberta');
            return;
        }
        $this->funcionarioRepository->inactivate($id, (int)$row['usuario_id']);
        header('Location: /funcionarios');
    }
}
