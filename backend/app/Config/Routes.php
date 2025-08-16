<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', 'Home::index');

// Rota para testar se a API está funcionando
$routes->get('api/health', function() {
    $response = \Config\Services::response();
    $data = [
        'success' => true,
        'message' => 'API da Cantina Escolar funcionando',
        'timestamp' => date('Y-m-d H:i:s')
    ];
    
    $response->setStatusCode(200)
            ->setContentType('application/json')
            ->setBody(json_encode($data));
    
    return $response;
});

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
        // $routes->resource('produtos', ['controller' => 'Produtos']);
        
        // Tipos de produtos
        // $routes->resource('tipos-produtos', ['controller' => 'TiposProdutos']);
        
        // Alunos
        // $routes->resource('alunos', ['controller' => 'Alunos']);
        
        // Vendas
        // $routes->resource('vendas', ['controller' => 'Vendas']);
        
        // Estoque
        // $routes->group('estoque', function($routes) {
        //     $routes->post('entrada', 'Estoque::entrada');
        //     $routes->post('ajuste', 'Estoque::ajuste');
        //     $routes->get('historico/(:num)', 'Estoque::historico/$1');
        // });
    });
});
