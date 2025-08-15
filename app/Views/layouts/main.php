<?php /* Layout principal */ ?>
<!doctype html>
<html lang="pt-br">

<head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title><?= $this->renderSection('title', true) ? $this->renderSection('title') : 'Cantina - Sistema' ?></title>

    <!-- Bootstrap CSS -->
    <link href="<?= base_url('assets/libs/bootstrap/css/bootstrap.min.css') ?>" rel="stylesheet" />

    <!-- Select2 CSS -->
    <link href="<?= base_url('assets/libs/select2/css/select2.min.css') ?>" rel="stylesheet" />
    <link href="<?= base_url('assets/libs/select2/css/select2-bootstrap5.min.css') ?>" rel="stylesheet" />

    <!-- DataTables CSS -->
    <link href="<?= base_url('assets/libs/datatable/css/dataTables.bootstrap5.min.css') ?>" rel="stylesheet" />

    <!-- CSS customizado -->
    <link href="<?= base_url('assets/css/app.css') ?>" rel="stylesheet" />

    <?= $this->renderSection('css') ?>
</head>

<body>
    <?php $authUser = session()->get('authUser'); ?>
    <?php $authResponsavel = session()->get('authResponsavel'); ?>

    <nav class="navbar navbar-expand-lg navbar-dark mb-4" style="background: linear-gradient(135deg, #253287 0%, #B20000 100%);">
        <div class="container-fluid">
            <a class="navbar-brand" href="<?= $authUser ? '/dashboard' : '/portal' ?>" style="color: #FEA800; font-weight: bold;">
                <i class="fas fa-utensils me-2"></i>Cantina
            </a>
            <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#mainNav" aria-controls="mainNav" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>
            <div class="collapse navbar-collapse" id="mainNav">
                <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                    <?php if ($authUser): ?>
                        <!-- Menu para funcionários -->
                        <li class="nav-item"><a class="nav-link" href="/dashboard">Início</a></li>
                        <?php if (in_array($authUser['tipo'], ['caixa', 'supervisor', 'gerente', 'informatica'])): ?>
                            <li class="nav-item"><a class="nav-link" href="#">PDV</a></li>
                        <?php endif; ?>
                        <?php if (in_array($authUser['tipo'], ['supervisor', 'gerente', 'informatica'])): ?>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    Cadastros
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">Produtos</a></li>
                                    <li><a class="dropdown-item" href="#">Categorias</a></li>
                                    <li><a class="dropdown-item" href="#">Kits</a></li>
                                </ul>
                            </li>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    Relatórios
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">Vendas</a></li>
                                    <li><a class="dropdown-item" href="#">Estoque</a></li>
                                    <li><a class="dropdown-item" href="#">Consumo</a></li>
                                </ul>
                            </li>
                        <?php endif; ?>
                        <?php if (in_array($authUser['tipo'], ['gerente', 'informatica'])): ?>
                            <li class="nav-item"><a class="nav-link" href="#">Funcionários</a></li>
                        <?php endif; ?>
                        <?php if ($authUser['tipo'] === 'informatica'): ?>
                            <li class="nav-item dropdown">
                                <a class="nav-link dropdown-toggle" href="#" role="button" data-bs-toggle="dropdown">
                                    Administração
                                </a>
                                <ul class="dropdown-menu">
                                    <li><a class="dropdown-item" href="#">Parâmetros</a></li>
                                    <li><a class="dropdown-item" href="#">Auditoria</a></li>
                                    <li><a class="dropdown-item" href="#">Integração APS</a></li>
                                </ul>
                            </li>
                        <?php endif; ?>
                    <?php elseif ($authResponsavel): ?>
                        <!-- Menu para responsáveis -->
                        <li class="nav-item"><a class="nav-link" href="/portal">Início</a></li>
                        <li class="nav-item"><a class="nav-link" href="#">Meus Dependentes</a></li>
                        <li class="nav-item"><a class="nav-link" href="#">Histórico de Consumo</a></li>
                        <li class="nav-item"><a class="nav-link" href="#">Recargas</a></li>
                        <li class="nav-item"><a class="nav-link" href="#">Kits/Pacotes</a></li>
                    <?php endif; ?>
                </ul>

                <div class="navbar-text me-3">
                    <?php if ($authUser): ?>
                        <i class="fas fa-user me-1"></i>
                        Olá, <strong><?= esc($authUser['nome']) ?></strong>
                        <small class="text-muted">(<?= esc(ucfirst($authUser['tipo'])) ?>)</small>
                    <?php elseif ($authResponsavel): ?>
                        <i class="fas fa-user-circle me-1"></i>
                        Olá, <strong><?= esc($authResponsavel['nome']) ?></strong>
                        <small class="text-muted">(Responsável)</small>
                    <?php endif; ?>
                </div>

                <a href="/logout" class="btn btn-outline-light btn-sm">
                    <i class="fas fa-sign-out-alt me-1"></i>Sair
                </a>
            </div>
        </div>
    </nav>

    <main class="container-fluid" style="background: #f8f9fa; min-height: 90vh;">
        <!-- Alertas de sessão -->
        <?php if (session()->getFlashdata('success')): ?>
            <div class="alert alert-success alert-dismissible fade show" role="alert">
                <i class="fas fa-check-circle me-2"></i><?= esc(session()->getFlashdata('success')) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <?php if (session()->getFlashdata('error')): ?>
            <div class="alert alert-danger alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-circle me-2"></i><?= esc(session()->getFlashdata('error')) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <?php if (session()->getFlashdata('warning')): ?>
            <div class="alert alert-warning alert-dismissible fade show" role="alert">
                <i class="fas fa-exclamation-triangle me-2"></i><?= esc(session()->getFlashdata('warning')) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <?php if (session()->getFlashdata('info')): ?>
            <div class="alert alert-info alert-dismissible fade show" role="alert">
                <i class="fas fa-info-circle me-2"></i><?= esc(session()->getFlashdata('info')) ?>
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        <?php endif; ?>

        <!-- Conteúdo principal -->
        <?= $this->renderSection('content') ?>
    </main>

    <!-- jQuery -->
    <script src="<?= base_url('assets/libs/jquery/jquery.min.js') ?>"></script>

    <!-- Popper.js -->
    <script src="<?= base_url('assets/libs/popper/popper.min.js') ?>"></script>

    <!-- Bootstrap JS -->
    <script src="<?= base_url('assets/libs/bootstrap/js/bootstrap.bundle.min.js') ?>"></script>

    <!-- Select2 JS -->
    <script src="<?= base_url('assets/libs/select2/js/select2.full.min.js') ?>"></script>
    <script src="<?= base_url('assets/libs/select2/js/i18n/pt-BR.js') ?>"></script>

    <!-- DataTables JS -->
    <script src="<?= base_url('assets/libs/datatable/js/jquery.dataTables.min.js') ?>"></script>
    <script src="<?= base_url('assets/libs/datatable/js/dataTables.bootstrap5.min.js') ?>"></script>

    <!-- JS customizado -->
    <script src="<?= base_url('assets/js/app.js') ?>"></script>

    <?= $this->renderSection('js') ?>
</body>

</html>