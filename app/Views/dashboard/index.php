<?= $this->extend('layouts/main') ?>

<?= $this->section('title') ?>
Dashboard - Cantina
<?= $this->endSection() ?>

<?= $this->section('content') ?>
<div class="row">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="h3 mb-1">Dashboard</h1>
                <p class="text-muted mb-0">Visão geral do sistema da cantina</p>
            </div>
            <div class="text-end">
                <small class="text-muted">
                    Último acesso: <?= date('d/m/Y H:i') ?>
                </small>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <!-- Card de boas-vindas -->
    <div class="col-12">
        <div class="card border-0 shadow-sm">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="card-title text-primary mb-2">
                            <i class="fas fa-hand-sparkles me-2"></i>
                            Bem-vindo(a), <?= esc($user['nome']) ?>!
                        </h5>
                        <p class="card-text text-muted mb-0">
                            Você está logado como <strong><?= esc(ucfirst($user['tipo'])) ?></strong>.
                            Selecione uma das opções abaixo para começar a trabalhar.
                        </p>
                    </div>
                    <div class="col-md-4 text-center">
                        <div class="badge" style="background: <?= $user['tipo'] === 'informatica' ? '#B20000' : ($user['tipo'] === 'gerente' ? '#FEA800' : ($user['tipo'] === 'supervisor' ? '#253287' : '#253287')) ?>; color: #fff; font-size: 1rem; padding: 0.5rem 1rem;">
                            <i class="fas fa-user-tie me-1"></i>
                            <?= esc(ucfirst($user['tipo'])) ?>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Ações rápidas baseadas no tipo de usuário -->
    <?php if (in_array($user['tipo'], ['caixa', 'supervisor', 'gerente', 'informatica'])): ?>
        <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 card-hover">
                <div class="card-body text-center">
                    <div class="mb-3" style="color: #253287;">
                        <i class="fas fa-cash-register fa-2x"></i>
                    </div>
                    <h6 class="card-title">PDV</h6>
                    <p class="card-text text-muted small">
                        Registrar vendas e consumo de alunos e funcionários
                    </p>
                    <a href="#" class="btn btn-primary btn-sm" style="background: linear-gradient(135deg, #253287 0%, #B20000 100%); border: none; color: #fff;">
                        <i class="fas fa-shopping-cart me-1"></i>Abrir PDV
                    </a>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <?php if (in_array($user['tipo'], ['supervisor', 'gerente', 'informatica'])): ?>
        <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 card-hover">
                <div class="card-body text-center">
                    <div class="mb-3" style="color: #10ac84;">
                        <i class="fas fa-box fa-2x"></i>
                    </div>
                    <h6 class="card-title">Produtos</h6>
                    <p class="card-text text-muted small">
                        Gerenciar produtos, categorias e estoque
                    </p>
                    <a href="#" class="btn btn-success btn-sm" style="background: #10ac84; border: none; color: #fff;">
                        <i class="fas fa-cogs me-1"></i>Gerenciar
                    </a>
                </div>
            </div>
        </div>

        <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 card-hover">
                <div class="card-body text-center">
                    <div class="mb-3" style="color: #253287;">
                        <i class="fas fa-chart-bar fa-2x"></i>
                    </div>
                    <h6 class="card-title">Relatórios</h6>
                    <p class="card-text text-muted small">
                        Consultar vendas, consumo e movimentação
                    </p>
                    <a href="#" class="btn btn-info btn-sm" style="background: #253287; border: none; color: #fff;">
                        <i class="fas fa-chart-line me-1"></i>Ver Relatórios
                    </a>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <?php if (in_array($user['tipo'], ['gerente', 'informatica'])): ?>
        <div class="col-md-6 col-lg-3">
            <div class="card border-0 shadow-sm h-100 card-hover">
                <div class="card-body text-center">
                    <div class="mb-3" style="color: #FEA800;">
                        <i class="fas fa-users fa-2x"></i>
                    </div>
                    <h6 class="card-title">Funcionários</h6>
                    <p class="card-text text-muted small">
                        Cadastrar e gerenciar usuários do sistema
                    </p>
                    <a href="#" class="btn btn-warning btn-sm" style="background: #FEA800; border: none; color: #333333;">
                        <i class="fas fa-user-plus me-1"></i>Gerenciar
                    </a>
                </div>
            </div>
        </div>
    <?php endif; ?>

    <!-- KPIs básicos (placeholder) -->
    <div class="col-12">
        <div class="row g-3">
            <div class="col-md-3">
                <div class="card border-0" style="background: #253287; color: #fff;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title mb-0">Vendas Hoje</h6>
                                <h4 class="mb-0">R$ 0,00</h4>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-money-bill-wave fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0" style="background: #10ac84; color: #fff;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title mb-0">Alunos Ativos</h6>
                                <h4 class="mb-0">0</h4>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-graduation-cap fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0" style="background: #FEA800; color: #253287;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title mb-0">Produtos</h6>
                                <h4 class="mb-0">0</h4>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-cube fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-md-3">
                <div class="card border-0" style="background: #B20000; color: #fff;">
                    <div class="card-body">
                        <div class="d-flex justify-content-between">
                            <div>
                                <h6 class="card-title mb-0">Estoque Crítico</h6>
                                <h4 class="mb-0">0</h4>
                            </div>
                            <div class="align-self-center">
                                <i class="fas fa-exclamation-triangle fa-2x opacity-75"></i>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Próximos passos -->
    <div class="col-12">
        <div class="card border-0 shadow-sm">
            <div class="card-header" style="background: #253287; color: #fff; border-bottom: 2px solid #FEA800;">
                <h6 class="mb-0">
                    <i class="fas fa-tasks me-2"></i>Próximos Passos de Implementação
                </h6>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6 style="color: #253287;">Funcionalidades Prioritárias</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2">
                                <i class="fas fa-circle text-warning me-2" style="font-size: 0.5rem;"></i>
                                <small>Implementar PDV (RF010)</small>
                            </li>
                            <li class="mb-2">
                                <i class="fas fa-circle text-warning me-2" style="font-size: 0.5rem;"></i>
                                <small>Cadastro de produtos e categorias (RF006, RF007)</small>
                            </li>
                            <li class="mb-2">
                                <i class="fas fa-circle text-warning me-2" style="font-size: 0.5rem;"></i>
                                <small>Controle de estoque (RF008)</small>
                            </li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6 style="color: #10ac84;">Sistema de Autenticação</h6>
                        <ul class="list-unstyled">
                            <li class="mb-2">
                                <i class="fas fa-check-circle text-success me-2"></i>
                                <small>Login de funcionários implementado</small>
                            </li>
                            <li class="mb-2">
                                <i class="fas fa-check-circle text-success me-2"></i>
                                <small>Portal do responsável criado</small>
                            </li>
                            <li class="mb-2">
                                <i class="fas fa-check-circle text-success me-2"></i>
                                <small>Sistema de auditoria ativo</small>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?= $this->endSection() ?>

<?= $this->section('css') ?>
<style>
    .card-hover {
        transition: transform 0.2s ease-in-out;
    }

    .card-hover:hover {
        transform: translateY(-2px);
    }

    .opacity-75 {
        opacity: 0.75;
    }
</style>
<?= $this->endSection() ?>