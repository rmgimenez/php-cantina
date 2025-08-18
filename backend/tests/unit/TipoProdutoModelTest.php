<?php

namespace Tests\Unit;

use App\Models\TipoProdutoModel;
use CodeIgniter\Test\CIUnitTestCase;
use CodeIgniter\Test\DatabaseTestTrait;

/**
 * @internal
 */
final class TipoProdutoModelTest extends CIUnitTestCase
{
    use DatabaseTestTrait;

    protected $migrate = false; // We'll use existing schema
    protected $migrateOnce = false;
    protected $refresh = true;
    protected $namespace = null;

    protected TipoProdutoModel $model;

    protected function setUp(): void
    {
        parent::setUp();
        $this->model = new TipoProdutoModel();
        
        // Create the table structure for testing
        $this->createTestTable();
    }

    protected function createTestTable(): void
    {
        $forge = \Config\Database::forge();
        
        // Drop table if exists
        $forge->dropTable('cant_tipos_produtos', true);
        
        // Create table structure
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
    }

    public function testCanCreateTipoProduto(): void
    {
        $data = [
            'nome' => 'Bebidas',
            'descricao' => 'Sucos e refrigerantes',
            'ativo' => 1
        ];

        $id = $this->model->insert($data);
        
        $this->assertIsNumeric($id);
        $this->assertGreaterThan(0, $id);
        
        $tipoProduto = $this->model->find($id);
        $this->assertEquals('Bebidas', $tipoProduto['nome']);
        $this->assertEquals('Sucos e refrigerantes', $tipoProduto['descricao']);
        $this->assertEquals(1, $tipoProduto['ativo']);
    }

    public function testCanUpdateTipoProduto(): void
    {
        $data = [
            'nome' => 'Salgados',
            'descricao' => 'Coxinhas e pastéis',
            'ativo' => 1
        ];

        $id = $this->model->insert($data);
        
        $updateData = [
            'nome' => 'Salgados Fritos',
            'descricao' => 'Coxinhas, pastéis e risóles'
        ];
        
        $result = $this->model->update($id, $updateData);
        $this->assertTrue($result);
        
        $tipoProduto = $this->model->find($id);
        $this->assertEquals('Salgados Fritos', $tipoProduto['nome']);
        $this->assertEquals('Coxinhas, pastéis e risóles', $tipoProduto['descricao']);
    }

    public function testCanDesativarTipoProduto(): void
    {
        $data = [
            'nome' => 'Doces',
            'descricao' => 'Brigadeiros e tortas',
            'ativo' => 1
        ];

        $id = $this->model->insert($data);
        
        $result = $this->model->desativar($id);
        $this->assertTrue($result);
        
        $tipoProduto = $this->model->find($id);
        $this->assertEquals(0, $tipoProduto['ativo']);
    }

    public function testCanAtivarTipoProduto(): void
    {
        $data = [
            'nome' => 'Lanches',
            'descricao' => 'Sanduíches e pães',
            'ativo' => 0
        ];

        $id = $this->model->insert($data);
        
        $result = $this->model->ativar($id);
        $this->assertTrue($result);
        
        $tipoProduto = $this->model->find($id);
        $this->assertEquals(1, $tipoProduto['ativo']);
    }

    public function testFindAtivos(): void
    {
        // Insert active type
        $this->model->insert(['nome' => 'Tipo Ativo', 'ativo' => 1]);
        
        // Insert inactive type
        $this->model->insert(['nome' => 'Tipo Inativo', 'ativo' => 0]);
        
        $ativos = $this->model->findAtivos();
        
        $this->assertCount(1, $ativos);
        $this->assertEquals('Tipo Ativo', $ativos[0]['nome']);
    }

    public function testBuscarComFiltrosPaginado(): void
    {
        // Create test data
        for ($i = 1; $i <= 25; $i++) {
            $this->model->insert([
                'nome' => "Tipo $i",
                'descricao' => "Descrição do tipo $i",
                'ativo' => 1
            ]);
        }

        // Test pagination
        $resultados = $this->model->buscarComFiltrosPaginado([], 1, 10);
        $this->assertCount(10, $resultados);

        $resultados = $this->model->buscarComFiltrosPaginado([], 2, 10);
        $this->assertCount(10, $resultados);

        $resultados = $this->model->buscarComFiltrosPaginado([], 3, 10);
        $this->assertCount(5, $resultados);
    }

    public function testContarComFiltros(): void
    {
        // Create test data
        $this->model->insert(['nome' => 'Bebidas Quentes', 'ativo' => 1]);
        $this->model->insert(['nome' => 'Bebidas Frias', 'ativo' => 1]);
        $this->model->insert(['nome' => 'Bebidas Inativas', 'ativo' => 0]);

        // Count all active
        $count = $this->model->contarComFiltros([]);
        $this->assertEquals(2, $count);

        // Count with filter
        $count = $this->model->contarComFiltros(['nome' => 'Quentes']);
        $this->assertEquals(1, $count);

        // Count including inactive
        $count = $this->model->contarComFiltros(['ativo' => 0]);
        $this->assertEquals(1, $count);
    }

    public function testValidationRules(): void
    {
        // Test required name
        $data = ['descricao' => 'Sem nome'];
        $result = $this->model->insert($data);
        $this->assertFalse($result);

        // Test name length
        $data = ['nome' => 'A']; // Too short
        $result = $this->model->insert($data);
        $this->assertFalse($result);

        $data = ['nome' => str_repeat('A', 101)]; // Too long
        $result = $this->model->insert($data);
        $this->assertFalse($result);
    }
}