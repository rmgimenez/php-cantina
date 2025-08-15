<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */

// Rotas públicas (sem autenticação)
$routes->get('/', 'Auth::loginForm');
$routes->get('/login', 'Auth::loginForm');
$routes->post('/login', 'Auth::login');
$routes->get('/login/responsavel', 'Auth::loginResponsavelForm');
$routes->post('/login/responsavel', 'Auth::loginResponsavel');
$routes->get('/logout', 'Auth::logout');

// Rotas para funcionários da cantina (requer autenticação como funcionário)
$routes->group('', ['filter' => 'auth:funcionario'], static function ($routes) {
    $routes->get('/dashboard', 'Dashboard::index');
});

// Rotas para responsáveis (requer autenticação como responsável)
$routes->group('', ['filter' => 'auth:responsavel'], static function ($routes) {
    $routes->get('/portal', 'Portal::index');
});

// Rotas que aceitam qualquer tipo de usuário autenticado
$routes->group('', ['filter' => 'auth'], static function ($routes) {
    // Rotas compartilhadas podem ser adicionadas aqui se necessário
});
