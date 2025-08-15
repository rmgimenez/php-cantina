<!doctype html>
<html lang="pt-br">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Portal do Responsável - Cantina</title>
    <link href="<?= base_url('assets/libs/bootstrap/css/bootstrap.min.css') ?>" rel="stylesheet" />
    <link href="<?= base_url('assets/css/auth.css') ?>" rel="stylesheet" />
    <style>
        body {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
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
            border-color: #4facfe;
            box-shadow: 0 0 0 0.2rem rgba(79, 172, 254, 0.25);
        }

        .btn-primary {
            background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
            border: none;
            border-radius: 10px;
            padding: 0.75rem;
            font-weight: 500;
        }

        .btn-primary:hover {
            background: linear-gradient(135deg, #3d8bfe 0%, #00d4fe 100%);
        }

        .login-options {
            text-align: center;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid rgba(0, 0, 0, 0.1);
        }

        .icon-cantina {
            font-size: 3rem;
            color: #4facfe;
            margin-bottom: 1rem;
        }

        .info-box {
            background: rgba(79, 172, 254, 0.1);
            border: 1px solid rgba(79, 172, 254, 0.2);
            border-radius: 10px;
            padding: 1rem;
            margin-bottom: 1.5rem;
        }
    </style>
</head>

<body>
    <div class="container">
        <div class="login-container">
            <div class="card login-card">
                <div class="card-header">
                    <div class="icon-cantina">
                        <i class="fas fa-user-circle"></i>
                    </div>
                    <h4 class="mb-0">Portal do Responsável</h4>
                    <p class="text-muted mb-0">Acompanhe o consumo dos seus dependentes</p>
                </div>
                <div class="card-body">
                    <div class="info-box">
                        <div class="text-center">
                            <i class="fas fa-info-circle text-primary me-2"></i>
                            <small class="text-muted">
                                Use seu CPF e senha para acessar informações dos seus dependentes cadastrados na escola.
                            </small>
                        </div>
                    </div>

                    <?php if (session()->getFlashdata('authError')): ?>
                        <div class="alert alert-danger py-2 mb-3">
                            <i class="fas fa-exclamation-circle me-2"></i><?= esc(session()->getFlashdata('authError')) ?>
                        </div>
                    <?php endif; ?>

                    <form method="post" action="/login/responsavel" autocomplete="off">
                        <?= csrf_field() ?>

                        <div class="mb-3">
                            <label class="form-label fw-semibold">CPF</label>
                            <div class="input-group">
                                <span class="input-group-text bg-light border-end-0">
                                    <i class="fas fa-id-card text-muted"></i>
                                </span>
                                <input type="text" name="cpf" class="form-control border-start-0"
                                    value="<?= esc(old('cpf')) ?>" required autofocus
                                    placeholder="000.000.000-00"
                                    maxlength="14" />
                            </div>
                            <small class="form-text text-muted">
                                Digite o CPF cadastrado como responsável na escola
                            </small>
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
                            <small class="form-text text-muted">
                                Se ainda não tem senha, procure a secretaria da escola
                            </small>
                        </div>

                        <div class="d-grid mb-3">
                            <button type="submit" class="btn btn-primary btn-lg">
                                <i class="fas fa-sign-in-alt me-2"></i>Acessar Portal
                            </button>
                        </div>
                    </form>

                    <div class="login-options">
                        <a href="/login" class="btn btn-outline-secondary btn-sm">
                            <i class="fas fa-user me-1"></i>
                            Sou funcionário da cantina
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

    <!-- Máscara para CPF -->
    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const cpfInput = document.querySelector('input[name="cpf"]');

            cpfInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, '');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                e.target.value = value;
            });
        });
    </script>
</body>

</html>