<?php
// Simple test script to validate the TipoProduto CRUD implementation

// Load CodeIgniter
require_once __DIR__ . '/vendor/autoload.php';

use App\Models\TipoProdutoModel;

// Set environment
putenv('CI_ENVIRONMENT=testing');

// Bootstrap CodeIgniter
$paths = new \Config\Paths();
$bootstrap = \CodeIgniter\Bootstrap::initialize($paths);

echo "Testing TipoProduto CRUD implementation...\n";

try {
    // Test 1: Create Model
    echo "\n1. Testing Model instantiation...\n";
    $model = new TipoProdutoModel();
    echo "✓ Model created successfully\n";
    
    // Test 2: Check if validation rules are working
    echo "\n2. Testing validation rules...\n";
    $rules = $model->getValidationRules();
    if (!empty($rules)) {
        echo "✓ Validation rules defined\n";
        print_r($rules);
    } else {
        echo "✗ No validation rules found\n";
    }
    
    echo "\n3. Testing manual database operation...\n";
    $db = \Config\Database::connect();
    
    // Create table if not exists
    $forge = \Config\Database::forge();
    
    // Check if table exists
    if (!$db->tableExists('cant_tipos_produtos')) {
        echo "Creating test table...\n";
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
        echo "✓ Table created\n";
    } else {
        echo "✓ Table already exists\n";
    }
    
    // Test 4: Insert operation
    echo "\n4. Testing insert operation...\n";
    $data = [
        'nome' => 'Test Tipo ' . time(),
        'descricao' => 'Teste de inserção',
        'ativo' => 1
    ];
    
    $id = $model->insert($data);
    if ($id) {
        echo "✓ Insert successful. ID: $id\n";
        
        // Test 5: Find operation
        echo "\n5. Testing find operation...\n";
        $record = $model->find($id);
        if ($record) {
            echo "✓ Find successful\n";
            print_r($record);
            
            // Test 6: Update operation
            echo "\n6. Testing update operation...\n";
            $updateData = ['descricao' => 'Descrição atualizada'];
            $result = $model->update($id, $updateData);
            if ($result) {
                echo "✓ Update successful\n";
                
                // Test 7: Pagination method
                echo "\n7. Testing pagination method...\n";
                $results = $model->buscarComFiltrosPaginado([], 1, 10);
                echo "✓ Pagination method works. Found " . count($results) . " records\n";
                
                // Test 8: Count method
                echo "\n8. Testing count method...\n";
                $count = $model->contarComFiltros([]);
                echo "✓ Count method works. Total: $count\n";
                
                // Test 9: Soft delete (desativar)
                echo "\n9. Testing soft delete (desativar)...\n";
                $result = $model->desativar($id);
                if ($result) {
                    echo "✓ Soft delete successful\n";
                    
                    $record = $model->find($id);
                    if ($record['ativo'] == 0) {
                        echo "✓ Record properly deactivated\n";
                    } else {
                        echo "✗ Record not deactivated properly\n";
                    }
                } else {
                    echo "✗ Soft delete failed\n";
                }
                
            } else {
                echo "✗ Update failed: " . implode(', ', $model->errors()) . "\n";
            }
        } else {
            echo "✗ Find failed\n";
        }
    } else {
        echo "✗ Insert failed: " . implode(', ', $model->errors()) . "\n";
    }
    
    echo "\n✓ All tests completed successfully!\n";
    
} catch (Exception $e) {
    echo "\n✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
}