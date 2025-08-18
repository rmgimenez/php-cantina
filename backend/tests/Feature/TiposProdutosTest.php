<?php

namespace Tests\Feature;

use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\FeatureTestTrait;
use CodeIgniter\Test\DatabaseTestTrait;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * @internal
 */
final class TiposProdutosTest extends CIUnitTestCase
{
    use FeatureTestTrait;
    use DatabaseTestTrait;

    protected $migrate = false;
    protected $migrateOnce = false;
    protected $refresh = true;
    protected $namespace = null;

    protected string $jwtSecret;
    protected string $validToken;
    protected string $adminToken;
    protected string $atendenteToken;

    protected function setUp(): void
    {
        parent::setUp();
        
        $this->jwtSecret = 'sua-chave-jwt-super-secreta-para-cantina-escolar-2025';
        $this->createTestTables();
        $this->createTestTokens();
    }

    protected function createTestTables(): void
    {
        $forge = \Config\Database::forge();
        
        // Create tipos_produtos table
        $forge->dropTable('cant_tipos_produtos', true);
        $fields = [
            'id' => [
                'type' => 'INTEGER',
                'constraint' => 11,
                'auto_increment' => true
            ],
            'nome' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
            ],
            'descricao' => [
                'type' => 'TEXT',
                'null' => true
            ],
            'ativo' => [
                'type' => 'INTEGER',
                'constraint' => 1,
                'default' => 1
            ],
            'data_criacao' => [
                'type' => 'DATETIME',
                'null' => true
            ]
        ];
        $forge->addField($fields);
        $forge->addKey('id', true);
        $forge->createTable('cant_tipos_produtos');

        // Create products table for dependency testing
        $forge->dropTable('cant_produtos', true);
        $fields = [
            'id' => [
                'type' => 'INTEGER',
                'constraint' => 11,
                'auto_increment' => true
            ],
            'nome' => [
                'type' => 'VARCHAR',
                'constraint' => 255,
            ],
            'tipo_produto_id' => [
                'type' => 'INTEGER',
                'constraint' => 11,
            ],
            'ativo' => [
                'type' => 'INTEGER',
                'constraint' => 1,
                'default' => 1
            ]
        ];
        $forge->addField($fields);
        $forge->addKey('id', true);
        $forge->createTable('cant_produtos');
    }

    protected function createTestTokens(): void
    {
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
        $this->adminToken = JWT::encode($adminPayload, $this->jwtSecret, 'HS256');

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
        $this->atendenteToken = JWT::encode($atendentePayload, $this->jwtSecret, 'HS256');

        $this->validToken = $this->adminToken; // Use admin as default valid token
    }

    protected function getAuthHeaders(string $token = null): array
    {
        return ['Authorization' => 'Bearer ' . ($token ?: $this->validToken)];
    }

    public function testIndexRequiresAuthentication(): void
    {
        $result = $this->get('api/tipos-produtos');
        
        $result->assertStatus(401);
        $result->assertJSONFragment(['success' => false]);
    }

    public function testIndexReturnsEmptyListInitially(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/tipos-produtos');
        
        $result->assertStatus(200);
        $result->assertJSONFragment([
            'success' => true,
            'data' => [],
            'meta' => [
                'page' => 1,
                'perPage' => 20,
                'total' => 0,
                'totalPages' => 0
            ]
        ]);
    }

    public function testCreateRequiresManagementPermission(): void
    {
        $data = [
            'nome' => 'Bebidas',
            'descricao' => 'Sucos e refrigerantes'
        ];

        // Test with atendente (no permission)
        $result = $this->withHeaders($this->getAuthHeaders($this->atendenteToken))
                       ->post('api/tipos-produtos', $data);
        
        $result->assertStatus(403);

        // Test with admin (has permission)
        $result = $this->withHeaders($this->getAuthHeaders($this->adminToken))
                       ->post('api/tipos-produtos', $data);
        
        $result->assertStatus(201);
    }

    public function testCreateTipoProduto(): void
    {
        $data = [
            'nome' => 'Bebidas',
            'descricao' => 'Sucos e refrigerantes'
        ];

        $result = $this->withHeaders($this->getAuthHeaders())
                       ->post('api/tipos-produtos', $data);
        
        $result->assertStatus(201);
        $result->assertJSONFragment([
            'success' => true,
            'data' => [
                'nome' => 'Bebidas',
                'descricao' => 'Sucos e refrigerantes',
                'ativo' => true
            ]
        ]);

        // Verify in database
        $db = \Config\Database::connect();
        $query = $db->query('SELECT * FROM cant_tipos_produtos WHERE nome = ?', ['Bebidas']);
        $this->assertCount(1, $query->getResultArray());
    }

    public function testCreateValidatesRequiredFields(): void
    {
        $data = [
            'descricao' => 'Sem nome'
        ];

        $result = $this->withHeaders($this->getAuthHeaders())
                       ->post('api/tipos-produtos', $data);
        
        $result->assertStatus(422);
        $result->assertJSONFragment(['success' => false]);
    }

    public function testCreateValidatesUniqueNome(): void
    {
        // Create first
        $data = ['nome' => 'Doces'];
        $this->withHeaders($this->getAuthHeaders())
             ->post('api/tipos-produtos', $data);

        // Try to create duplicate
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->post('api/tipos-produtos', $data);
        
        $result->assertStatus(422);
    }

    public function testShowTipoProduto(): void
    {
        // Create tipo produto
        $data = ['nome' => 'Salgados', 'descricao' => 'Coxinhas e pastéis'];
        $createResult = $this->withHeaders($this->getAuthHeaders())
                             ->post('api/tipos-produtos', $data);
        
        $createResponse = json_decode($createResult->getBody(), true);
        $id = $createResponse['data']['id'];

        // Get the created tipo produto
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get("api/tipos-produtos/$id");
        
        $result->assertStatus(200);
        $result->assertJSONFragment([
            'success' => true,
            'data' => [
                'id' => $id,
                'nome' => 'Salgados',
                'descricao' => 'Coxinhas e pastéis',
                'ativo' => 1
            ]
        ]);
    }

    public function testShowNonExistentTipoProduto(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/tipos-produtos/999');
        
        $result->assertStatus(404);
    }

    public function testUpdateTipoProduto(): void
    {
        // Create tipo produto
        $data = ['nome' => 'Lanches', 'descricao' => 'Sanduíches'];
        $createResult = $this->withHeaders($this->getAuthHeaders())
                             ->post('api/tipos-produtos', $data);
        
        $createResponse = json_decode($createResult->getBody(), true);
        $id = $createResponse['data']['id'];

        // Update
        $updateData = ['nome' => 'Lanches Quentes', 'descricao' => 'Sanduíches e pães'];
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->put("api/tipos-produtos/$id", $updateData);
        
        $result->assertStatus(200);
        $result->assertJSONFragment([
            'success' => true,
            'data' => [
                'id' => $id,
                'nome' => 'Lanches Quentes',
                'descricao' => 'Sanduíches e pães'
            ]
        ]);
    }

    public function testUpdateRequiresManagementPermission(): void
    {
        // Create tipo produto first
        $data = ['nome' => 'Refeições'];
        $createResult = $this->withHeaders($this->getAuthHeaders())
                             ->post('api/tipos-produtos', $data);
        
        $createResponse = json_decode($createResult->getBody(), true);
        $id = $createResponse['data']['id'];

        // Try to update with atendente (no permission)
        $updateData = ['nome' => 'Refeições Completas'];
        $result = $this->withHeaders($this->getAuthHeaders($this->atendenteToken))
                       ->put("api/tipos-produtos/$id", $updateData);
        
        $result->assertStatus(403);
    }

    public function testDeleteTipoProduto(): void
    {
        // Create tipo produto
        $data = ['nome' => 'Temporary Type'];
        $createResult = $this->withHeaders($this->getAuthHeaders())
                             ->post('api/tipos-produtos', $data);
        
        $createResponse = json_decode($createResult->getBody(), true);
        $id = $createResponse['data']['id'];

        // Delete
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->delete("api/tipos-produtos/$id");
        
        $result->assertStatus(204);

        // Verify soft delete (ativo = 0)
        $db = \Config\Database::connect();
        $query = $db->query('SELECT ativo FROM cant_tipos_produtos WHERE id = ?', [$id]);
        $record = $query->getRow();
        $this->assertEquals(0, $record->ativo);
    }

    public function testDeleteRequiresManagementPermission(): void
    {
        // Create tipo produto first
        $data = ['nome' => 'To Delete'];
        $createResult = $this->withHeaders($this->getAuthHeaders())
                             ->post('api/tipos-produtos', $data);
        
        $createResponse = json_decode($createResult->getBody(), true);
        $id = $createResponse['data']['id'];

        // Try to delete with atendente (no permission)
        $result = $this->withHeaders($this->getAuthHeaders($this->atendenteToken))
                       ->delete("api/tipos-produtos/$id");
        
        $result->assertStatus(403);
    }

    public function testDeletePreventsWhenProductsExist(): void
    {
        // Create tipo produto
        $data = ['nome' => 'With Products'];
        $createResult = $this->withHeaders($this->getAuthHeaders())
                             ->post('api/tipos-produtos', $data);
        
        $createResponse = json_decode($createResult->getBody(), true);
        $tipoId = $createResponse['data']['id'];

        // Create a product that uses this type
        $db = \Config\Database::connect();
        $db->query('INSERT INTO cant_produtos (nome, tipo_produto_id, ativo) VALUES (?, ?, ?)', 
                   ['Test Product', $tipoId, 1]);

        // Try to delete
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->delete("api/tipos-produtos/$tipoId");
        
        $result->assertStatus(409);
    }

    public function testPaginationWorksCorrectly(): void
    {
        // Create multiple tipos
        for ($i = 1; $i <= 25; $i++) {
            $data = ['nome' => "Tipo $i"];
            $this->withHeaders($this->getAuthHeaders())
                 ->post('api/tipos-produtos', $data);
        }

        // Test first page
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/tipos-produtos?page=1&perPage=10');
        
        $result->assertStatus(200);
        $response = json_decode($result->getBody(), true);
        
        $this->assertCount(10, $response['data']['data']);
        $this->assertEquals(1, $response['data']['meta']['page']);
        $this->assertEquals(10, $response['data']['meta']['perPage']);
        $this->assertEquals(25, $response['data']['meta']['total']);
        $this->assertEquals(3, $response['data']['meta']['totalPages']);

        // Test last page
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/tipos-produtos?page=3&perPage=10');
        
        $response = json_decode($result->getBody(), true);
        $this->assertCount(5, $response['data']['data']);
    }

    public function testFilterByNome(): void
    {
        // Create test data
        $this->withHeaders($this->getAuthHeaders())
             ->post('api/tipos-produtos', ['nome' => 'Bebidas Quentes']);
        $this->withHeaders($this->getAuthHeaders())
             ->post('api/tipos-produtos', ['nome' => 'Bebidas Frias']);
        $this->withHeaders($this->getAuthHeaders())
             ->post('api/tipos-produtos', ['nome' => 'Salgados']);

        // Filter by name
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/tipos-produtos?q=Bebidas');
        
        $response = json_decode($result->getBody(), true);
        $this->assertEquals(2, $response['data']['meta']['total']);
    }

    public function testFilterByAtivo(): void
    {
        // Create active and inactive types
        $activeResult = $this->withHeaders($this->getAuthHeaders())
                             ->post('api/tipos-produtos', ['nome' => 'Active Type']);
        $activeResponse = json_decode($activeResult->getBody(), true);
        $activeId = $activeResponse['data']['id'];

        $inactiveResult = $this->withHeaders($this->getAuthHeaders())
                               ->post('api/tipos-produtos', ['nome' => 'Inactive Type']);
        $inactiveResponse = json_decode($inactiveResult->getBody(), true);
        $inactiveId = $inactiveResponse['data']['id'];

        // Deactivate one
        $db = \Config\Database::connect();
        $db->query('UPDATE cant_tipos_produtos SET ativo = 0 WHERE id = ?', [$inactiveId]);

        // Filter by active
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/tipos-produtos?ativo=1');
        
        $response = json_decode($result->getBody(), true);
        $this->assertEquals(1, $response['data']['meta']['total']);

        // Filter by inactive
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/tipos-produtos?ativo=0');
        
        $response = json_decode($result->getBody(), true);
        $this->assertEquals(1, $response['data']['meta']['total']);
    }
}