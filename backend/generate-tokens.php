<?php
// Simple JWT token generator for testing
require_once __DIR__ . '/vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

$jwtSecret = 'sua-chave-jwt-super-secreta-para-cantina-escolar-2025';
$now = time();
$expiration = $now + 3600; // 1 hour

// Admin token
$adminPayload = [
    'iss' => 'cantina-escolar',
    'aud' => 'cantina-escolar', 
    'iat' => $now,
    'exp' => $expiration,
    'user_id' => 1,
    'tipo' => 'administrador',
    'nome' => 'Admin Teste'
];

$adminToken = JWT::encode($adminPayload, $jwtSecret, 'HS256');

// Atendente token (no management permission)
$atendentePayload = [
    'iss' => 'cantina-escolar',
    'aud' => 'cantina-escolar',
    'iat' => $now,
    'exp' => $expiration,
    'user_id' => 2,
    'tipo' => 'atendente',
    'nome' => 'Atendente Teste'
];

$atendenteToken = JWT::encode($atendentePayload, $jwtSecret, 'HS256');

echo "Admin Token (has management permissions):\n";
echo $adminToken . "\n\n";

echo "Atendente Token (no management permissions):\n";
echo $atendenteToken . "\n\n";

// Verify tokens work
try {
    $decoded = JWT::decode($adminToken, new Key($jwtSecret, 'HS256'));
    echo "✓ Admin token verified successfully\n";
    echo "User: " . $decoded->nome . " (Type: " . $decoded->tipo . ")\n\n";
    
    $decoded = JWT::decode($atendenteToken, new Key($jwtSecret, 'HS256'));
    echo "✓ Atendente token verified successfully\n";
    echo "User: " . $decoded->nome . " (Type: " . $decoded->tipo . ")\n";
} catch (Exception $e) {
    echo "✗ Token verification failed: " . $e->getMessage() . "\n";
}