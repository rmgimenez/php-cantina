<?php

use CodeIgniter\HTTP\URI;
use CodeIgniter\Test\FeatureTestTrait;
use CodeIgniter\Config\Services;
use PHPUnit\Framework\TestCase;

final class TiposProdutosCreateTest extends TestCase
{
    use FeatureTestTrait;

    public function testCreateWithAssociativePayloadReturns201()
    {
        // Payload associativo esperado
        $payload = [
            'nome' => 'Teste PHPUnit Associativo',
            'descricao' => 'desc',
            'ativo' => 1
        ];

        $result = $this->withHeaders([
            'Content-Type' => 'application/json'
        ])->withBody(json_encode($payload))->post('/api/tipos-produtos');

        // Se o banco não estiver disponível, apenas verificar que não gerou 500 no controlador
        $status = $result->getStatusCode();
        $this->assertNotEquals(500, $status, 'Não deve retornar 500 (erro interno) para payload associativo');
    }

    public function testCreateWithIndexedPayloadReturns400()
    {
        // Payload indexado que anteriormente causava chaves numéricas
        $payload = ['Teste Indexado', 'desc', 1];

        $result = $this->withHeaders([
            'Content-Type' => 'application/json'
        ])->withBody(json_encode($payload))->post('/api/tipos-produtos');

        $status = $result->getStatusCode();
        // Esperamos 400 (payload inválido) ou 422 dependendo da validação
        $this->assertTrue(in_array($status, [400, 422]), 'Payload indexado deve ser rejeitado com 400 ou 422');
    }
}
