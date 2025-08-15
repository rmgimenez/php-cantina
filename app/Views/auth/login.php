<!doctype html>
<html lang="pt-br">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Login - Cantina</title>
    <link href="<?= base_url('assets/libs/bootstrap/css/bootstrap.min.css') ?>" rel="stylesheet" />
    <link href="<?= base_url('assets/css/auth.css') ?>" rel="stylesheet" />
    <style>
        body {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
        }

        .login-container {
            max-width: 400px;
            margin: 0 auto;
        }

        .login-card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(10px);
            border: none;
            border-radius: 15px;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
        }

        .card-header {
            background: transparent;
            border-bottom: 1px solid rgba(0, 0, 0, 0.1);
            text-align: center;
            padding: 2rem 2rem 1rem;
        }

        .card-body {
            padding: 1rem 2rem 2rem;
        }

        .form-control {
            border-radius: 10px;
            border: 1px solid #e1e5e9;
            padding: 0.75rem 1rem;
        }

        .form-control:focus {
            border-color: #667eea;
            box-shadow: 0 0 0 0.2rem rgba(102, 126, 234, 0.25);
        }

        .btn-primary {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border: none;
            border-radius: 10px;
            padding: 0.75rem;
            font-weight: 500;
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #5a6fd8 0%, #6a4190 100%);
        }

        .login-options {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .icon-cantina {
            font-size: 3rem;
            color: #667eea;
            margin-bottom: 1rem;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="login-container">
            <div class="card login-card">
                <div class="card-header">
                    <div class="icon-cantina">
                        <i class="fas fa-utensils"></i>
                    </div>
                    <h4 class="mb-0">Cantina Escolar</h4>
                    <p class="text-muted mb-0">Acesso para Funcionários</p>
                </div>
                <div class="card-body">
                    <?php if (session()->getFlashdata('authError')): ?>
                        <div class="alert alert-danger py-2 mb-3">
                            <i class="fas fa-exclamation-circle me-2"></i><?= esc(session()->getFlashdata('authError')) ?>
                        </div>
                    <?php endif; ?>

                    <form method="post" action="/login" autocomplete="off">
                        <?= csrf_field() ?>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">E-mail ou CPF</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="fas fa-user text-muted"></i>
                                </span>
                                <input type="text" name="login" class="form-control border-start-0"
                                    value="<?= esc(old('login')) ?>" required autofocus
                                    placeholder="Digite seu e-mail ou CPF" />
                            </div>
                        </div>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">Senha</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="fas fa-lock text-muted"></i>
                                </span>
                                <input type="password" name="senha" class="form-control border-start-0"
                                    required placeholder="Digite sua senha" />
                            </div>
                        </div>

                        <div class="d-grid mb-3">
                            <button type="submit" class="btn btn-primary btn-lg">
                                <i class="fas fa-sign-in-alt me-2"></i>Entrar
                            </button>
                        </div>
                    </form>

                    <div class="login-options">
                        <p class="text-muted small mb-2">
                            <i class="fas fa-info-circle me-1"></i>
                            Acesso exclusivo para equipe da cantina
                        </p>
                        <a href="/login/responsavel" class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-user-circle me-1"></i>
                            Sou responsável por aluno
                        </a>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Font Awesome (CDN para ícones) -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">

    <!-- Bootstrap JS -->
    <script src="<?= base_url('assets/libs/bootstrap/js/bootstrap.bundle.min.js') ?>"></script>
</body>

</html>