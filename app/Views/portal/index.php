<?= $this->extend('layouts/main') ?>

<?= $this->section('title') ?>
Portal do Responsável - Cantina
<?= $this->endSection() ?>

<?= $this->section('content') ?>
<div class="row">
    <div class="col-12">
        <div class="d-flex justify-content-between align-items-center mb-4">
            <div>
                <h1 class="h3 mb-1">Portal do Responsável</h1>
                <p class="text-muted mb-0">Bem-vindo(a), <?= esc($responsavel['nome']) ?></p>
            </div>
            <div class="text-end">
                <small class="text-muted">CPF: <?= esc($responsavel['cpf']) ?></small>
            </div>
        </div>
    </div>
</div>

<div class="row g-4">
    <!-- Card de boas-vindas -->
    <div class="col-12">
        <div class="card border-0 shadow-sm bg-primary text-white">
            <div class="card-body">
                <div class="row align-items-center">
                    <div class="col-md-8">
                        <h5 class="card-title mb-2">
                            <i class="fas fa-heart me-2"></i>Seja bem-vindo(a) ao Portal da Cantina
                        </h5>
                        <p class="card-text mb-0">
                            Aqui você pode acompanhar o consumo dos seus dependentes, consultar saldos,
                            fazer recargas e configurar preferências alimentares.
                        </p>
                    </div>
                    <div class="col-md-4 text-center">
                        <i class="fas fa-utensils" style="font-size: 4rem; opacity: 0.3;"></i>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Cards de ações rápidas -->
    <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
                <div class="text-info mb-3">
                    <i class="fas fa-users fa-2x"></i>
                </div>
                <h6 class="card-title">Meus Dependentes</h6>
                <p class="card-text text-muted small">
                    Veja todos os alunos sob sua responsabilidade
                </p>
                <a href="#" class="btn btn-outline-info btn-sm">
                    <i class="fas fa-eye me-1"></i>Visualizar
                </a>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
                <div class="text-success mb-3">
                    <i class="fas fa-wallet fa-2x"></i>
                </div>
                <h6 class="card-title">Saldos</h6>
                <p class="card-text text-muted small">
                    Consulte o saldo disponível de cada dependente
                </p>
                <a href="#" class="btn btn-outline-success btn-sm">
                    <i class="fas fa-money-bill-wave me-1"></i>Consultar
                </a>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
                <div class="text-warning mb-3">
                    <i class="fas fa-history fa-2x"></i>
                </div>
                <h6 class="card-title">Histórico</h6>
                <p class="card-text text-muted small">
                    Veja o que foi consumido pelos seus dependentes
                </p>
                <a href="#" class="btn btn-outline-warning btn-sm">
                    <i class="fas fa-list me-1"></i>Ver Histórico
                </a>
            </div>
        </div>
    </div>

    <div class="col-md-6 col-lg-3">
        <div class="card border-0 shadow-sm h-100">
            <div class="card-body text-center">
                <div class="text-purple mb-3">
                    <i class="fas fa-gift fa-2x"></i>
                </div>
                <h6 class="card-title">Kits/Pacotes</h6>
                <p class="card-text text-muted small">
                    Adquira pacotes de alimentação com desconto
                </p>
                <a href="#" class="btn btn-outline-secondary btn-sm">
                    <i class="fas fa-shopping-cart me-1"></i>Ver Ofertas
                </a>
            </div>
        </div>
    </div>

    <!-- Seção de informações importantes -->
    <div class="col-12">
        <div class="card border-0 shadow-sm">
            <div class="card-header bg-light">
                <h6 class="mb-0">
                    <i class="fas fa-info-circle me-2"></i>Informações Importantes
                </h6>
            </div>
            <div class="card-body">
                <div class="row">
                    <div class="col-md-6">
                        <h6 class="text-primary">
                            <i class="fas fa-clock me-2"></i>Horários de Funcionamento
                        </h6>
                        <ul class="list-unstyled small text-muted">
                            <li><strong>Lanche da Manhã:</strong> 09:30 às 10:00</li>
                            <li><strong>Almoço:</strong> 11:30 às 13:30</li>
                            <li><strong>Lanche da Tarde:</strong> 15:00 às 15:30</li>
                        </ul>
                    </div>
                    <div class="col-md-6">
                        <h6 class="text-success">
                            <i class="fas fa-credit-card me-2"></i>Formas de Recarga
                        </h6>
                        <ul class="list-unstyled small text-muted">
                            <li><strong>PIX:</strong> Instantâneo</li>
                            <li><strong>Dinheiro:</strong> Na secretaria</li>
                            <li><strong>Cartão:</strong> Em breve</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Próximas funcionalidades -->
    <div class="col-12">
        <div class="alert alert-info border-0">
            <h6 class="alert-heading">
                <i class="fas fa-rocket me-2"></i>Em Desenvolvimento
            </h6>
            <p class="mb-0 small">
                Estamos trabalhando em novas funcionalidades como notificações por e-mail,
                relatórios personalizados e configuração de restrições alimentares.
                Em breve você terá ainda mais controle sobre a alimentação dos seus dependentes!
            </p>
        </div>
    </div>
</div>
<?= $this->endSection() ?>

<?= $this->section('css') ?>
<style>
    .text-purple {
        color: #6f42c1 !important;
    }

    .btn-outline-purple {
        color: #6f42c1;
        border-color: #6f42c1;
    }

    .btn-outline-purple:hover {
        background-color: #6f42c1;
        border-color: #6f42c1;
        color: white;
    }
</style>
<?= $this->endSection() ?>