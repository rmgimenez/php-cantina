<?php

use CodeIgniter\Router\RouteCollection;

/**
 * @var RouteCollection $routes
 */
$routes->get('/', static function () {
	// Sempre sirva o SPA buildado na raiz, se existir
	$index = rtrim(FCPATH, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'index.html';
	if (is_file($index)) {
		$response = service('response');
		$response->setHeader('Content-Type', 'text/html; charset=utf-8');
		$response->setBody(file_get_contents($index));
		return $response;
	}
	// Se não houver build do frontend, fallback para Home::index (útil em dev sem build)
	$home = new \App\Controllers\Home();
	return $home->index();
});

// Fallback para o SPA gerado pelo Vite (frontend build)
// Não intercepta rotas que começam com 'api'
$routes->addPlaceholder('any', '.+');
$routes->get('(:any)', static function ($path) {
	// Garantir que $path seja string para satisfazer o analisador estático
	$pathStr = (string) $path;
	if (strpos($pathStr, 'api') === 0) {
		throw new \CodeIgniter\Exceptions\PageNotFoundException($pathStr);
	}
	$index = rtrim(FCPATH, DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR . 'frontend' . DIRECTORY_SEPARATOR . 'index.html';
	if (is_file($index)) {
		$response = service('response');
		$response->setHeader('Content-Type', 'text/html; charset=utf-8');
		$response->setBody(file_get_contents($index));
		return $response;
	}
	throw new \CodeIgniter\Exceptions\PageNotFoundException($pathStr);
});

/*
 Example: how to add API routes with /api prefix to avoid collision with SPA fallback:

 // In app/Controllers/Api/Users.php create controller class App\Controllers\Api\Users
 $routes->get('api/users', 'Api\Users::index');
 $routes->post('api/users', 'Api\Users::create');

*/
