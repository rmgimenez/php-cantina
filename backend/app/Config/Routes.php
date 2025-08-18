<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Rota para testar se a API está funcionando - usa controller Health::index
$routes->get('api/health', 'Health::index');

// Rotas da API
$routes->group('api', ['namespace' => 'App\Controllers'], function($routes) {
    // Rotas de autenticação (sem filtro)
    $routes->post('auth/login', 'Auth::login');
    $routes->post('auth/logout', 'Auth::logout');
    $routes->get('auth/me', 'Auth::me');
    $routes->post('auth/refresh', 'Auth::refresh');
    
    // Rotas protegidas (serão implementadas nas próximas tarefas)
    $routes->group('', ['filter' => 'jwt'], function($routes) {
        // Produtos
        $routes->resource('produtos', ['controller' => 'Produtos']);
        $routes->get('produtos/estoque-baixo', 'Produtos::estoqueBaixo');
        $routes->put('produtos/(:num)/ativar', 'Produtos::ativar/$1');
        $routes->put('produtos/(:num)/desativar', 'Produtos::desativar/$1');
        
        // Tipos de produtos
        $routes->resource('tipos-produtos', ['controller' => 'TiposProdutos']);
        $routes->get('tipos-produtos/ativos', 'TiposProdutos::ativos');
        $routes->put('tipos-produtos/(:num)/ativar', 'TiposProdutos::ativar/$1');
        $routes->put('tipos-produtos/(:num)/desativar', 'TiposProdutos::desativar/$1');
        
        // Estoque
        $routes->group('estoque', function($routes) {
            $routes->post('entrada', 'Estoque::entrada');
            $routes->post('ajuste', 'Estoque::ajuste');
            $routes->get('historico/(:num)', 'Estoque::historico/$1');
            $routes->get('movimentacoes', 'Estoque::movimentacoes');
            $routes->get('relatorio', 'Estoque::relatorio');
        });
        
        // Alunos
        // $routes->resource('alunos', ['controller' => 'Alunos']);
        
        // Vendas
        // $routes->resource('vendas', ['controller' => 'Vendas']);
    });
});
