<?php
// Database setup script

require_once 'vendor/autoload.php';

// Load environment
$env = parse_ini_file('.env');
foreach ($env as $key => $value) {
    putenv("$key=$value");
}

echo "Setting up database for testing...\n";

try {
    // Get database instance
    $config = new \Config\Database();
    $db = \Config\Database::connect();
    $forge = \Config\Database::forge();
    
    echo "✓ Database connection successful\n";
    
    // Check if table exists and create if not
    if (!$db->tableExists('cant_tipos_produtos')) {
        echo "Creating cant_tipos_produtos table...\n";
        
        $fields = [
            'id' => [
                'type' => 'INTEGER',
                'auto_increment' => true
            ],
            'nome' => [
                'type' => 'VARCHAR',
                'constraint' => 100,
                'null' => false
            ],
            'descricao' => [
                'type' => 'TEXT',
                'null' => true
            ],
            'ativo' => [
                'type' => 'INTEGER',
                'constraint' => 1,
                'default' => 1,
                'null' => false
            ],
            'data_criacao' => [
                'type' => 'TIMESTAMP',
                'null' => true
            ]
        ];
        
        $forge->addField($fields);
        $forge->addKey('id', true);
        $result = $forge->createTable('cant_tipos_produtos');
        
        if ($result) {
            echo "✓ Table created successfully\n";
        } else {
            echo "✗ Failed to create table\n";
            exit(1);
        }
    } else {
        echo "✓ Table already exists\n";
    }
    
    // Test insert operation
    echo "\nTesting direct database insert...\n";
    $data = [
        'nome' => 'Test Direct Insert',
        'descricao' => 'Testing direct database insert',
        'ativo' => 1,
        'data_criacao' => date('Y-m-d H:i:s')
    ];
    
    $builder = $db->table('cant_tipos_produtos');
    $result = $builder->insert($data);
    
    if ($result) {
        echo "✓ Direct insert successful\n";
        $insertId = $db->insertID();
        echo "Insert ID: $insertId\n";
        
        // Test select
        $record = $builder->where('id', $insertId)->get()->getRowArray();
        if ($record) {
            echo "✓ Record retrieved successfully\n";
            print_r($record);
        }
    } else {
        echo "✗ Direct insert failed\n";
        echo "Error: " . $db->getLastQuery() . "\n";
    }
    
    echo "\n✓ Database setup completed successfully!\n";
    
} catch (Exception $e) {
    echo "✗ Error: " . $e->getMessage() . "\n";
    echo "Stack trace:\n" . $e->getTraceAsString() . "\n";
    exit(1);
}