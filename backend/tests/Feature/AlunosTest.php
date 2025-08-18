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
final class AlunosTest extends CIUnitTestCase
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
        $this->insertTestData();
        $this->createTestTokens();
    }

    protected function createTestTables(): void
    {
        $db = \Config\Database::connect();
        
        // Create test tables for alunos functionality
        $db->query('DROP VIEW IF EXISTS alunos');
        $db->query('DROP TABLE IF EXISTS cant_contas_alunos');
        $db->query('DROP TABLE IF EXISTS cant_movimentacoes');
        $db->query('DROP TABLE IF EXISTS cant_funcionarios');
        $db->query('DROP TABLE IF EXISTS cadastro_alunos');
        $db->query('DROP TABLE IF EXISTS matriculas_alunos');
        $db->query('DROP TABLE IF EXISTS cursos');

        // Create cadastro_alunos table (simplified)
        $db->query('
            CREATE TABLE cadastro_alunos (
                ra INT PRIMARY KEY,
                nome VARCHAR(255),
                nome_social VARCHAR(255),
                nasc DATE,
                email VARCHAR(255),
                cpf_resp VARCHAR(255),
                nome_resp VARCHAR(255)
            )
        ');

        // Create cursos table
        $db->query('
            CREATE TABLE cursos (
                codigo INT PRIMARY KEY,
                nome VARCHAR(255),
                ativo TINYINT(1) DEFAULT 1,
                complementar TINYINT(1) DEFAULT 0
            )
        ');

        // Create matriculas_alunos table
        $db->query('
            CREATE TABLE matriculas_alunos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ra INT,
                curso INT,
                serie SMALLINT,
                turma VARCHAR(255),
                status VARCHAR(255),
                periodo VARCHAR(255),
                ano_matricula INT,
                ano_letivo VARCHAR(255),
                data_matricula DATE,
                data_saida DATE,
                nro_chamada SMALLINT,
                FOREIGN KEY (ra) REFERENCES cadastro_alunos(ra),
                FOREIGN KEY (curso) REFERENCES cursos(codigo)
            )
        ');

        // Create alunos view (simplified)
        $db->query('
            CREATE VIEW alunos AS
            SELECT 
                a.ra,
                a.nome,
                a.nome_social,
                a.nasc,
                a.email,
                a.cpf_resp,
                a.nome_resp,
                c.nome as curso_nome,
                m.serie,
                m.turma,
                m.status,
                m.periodo,
                m.nro_chamada,
                m.data_matricula as dt_matricula
            FROM cadastro_alunos a
            JOIN matriculas_alunos m ON a.ra = m.ra
            JOIN cursos c ON m.curso = c.codigo
            WHERE m.ano_matricula = 2025 
              AND (m.ano_letivo = "2025_2026" OR m.ano_letivo = "2025")
              AND m.status = "MAT" 
              AND c.ativo = 1 
              AND c.complementar = 0
        ');

        // Create cant_funcionarios table
        $db->query('
            CREATE TABLE cant_funcionarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                usuario VARCHAR(50) UNIQUE,
                senha VARCHAR(255),
                nome VARCHAR(255),
                email VARCHAR(255),
                tipo ENUM("administrador", "atendente", "estoquista") DEFAULT "atendente",
                ativo TINYINT(1) DEFAULT 1,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ');

        // Create cant_contas_alunos table
        $db->query('
            CREATE TABLE cant_contas_alunos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ra_aluno INT UNIQUE,
                saldo DECIMAL(10,2) DEFAULT 0.00,
                limite_diario DECIMAL(10,2) NULL,
                ativo TINYINT(1) DEFAULT 1,
                data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                FOREIGN KEY (ra_aluno) REFERENCES cadastro_alunos(ra)
            )
        ');

        // Create cant_movimentacoes table
        $db->query('
            CREATE TABLE cant_movimentacoes (
                id INT AUTO_INCREMENT PRIMARY KEY,
                tipo_conta ENUM("aluno", "funcionario"),
                ra_aluno INT NULL,
                codigo_funcionario INT NULL,
                tipo_movimentacao ENUM("credito", "debito"),
                valor DECIMAL(10,2),
                descricao VARCHAR(255),
                venda_id INT NULL,
                funcionario_cantina_id INT NULL,
                data_movimentacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (ra_aluno) REFERENCES cadastro_alunos(ra),
                FOREIGN KEY (funcionario_cantina_id) REFERENCES cant_funcionarios(id)
            )
        ');
    }

    protected function insertTestData(): void
    {
        $db = \Config\Database::connect();

        // Insert test cursos
        $db->query('INSERT INTO cursos (codigo, nome, ativo, complementar) VALUES (1, "Ensino Fundamental", 1, 0)');
        $db->query('INSERT INTO cursos (codigo, nome, ativo, complementar) VALUES (2, "Ensino Médio", 1, 0)');

        // Insert test students
        $db->query('
            INSERT INTO cadastro_alunos (ra, nome, nome_social, nasc, email, cpf_resp, nome_resp) VALUES 
            (2021001, "João Silva", null, "2010-05-15", "joao@teste.com", "12345678901", "Maria Silva"),
            (2021002, "Ana Santos", "Ana", "2011-03-20", "ana@teste.com", "12345678902", "José Santos"),
            (2021003, "Carlos Oliveira", null, "2009-08-10", "carlos@teste.com", "12345678903", "Lucia Oliveira")
        ');

        // Insert test matriculas
        $db->query('
            INSERT INTO matriculas_alunos (ra, curso, serie, turma, status, periodo, ano_matricula, ano_letivo, data_matricula, nro_chamada) VALUES
            (2021001, 1, 6, "6A", "MAT", "manhã", 2025, "2025", "2025-02-01", 10),
            (2021002, 1, 7, "7B", "MAT", "tarde", 2025, "2025", "2025-02-01", 15),
            (2021003, 2, 1, "1A", "MAT", "manhã", 2025, "2025_2026", "2025-02-01", 5)
        ');

        // Insert test funcionario
        $db->query('
            INSERT INTO cant_funcionarios (id, usuario, senha, nome, email, tipo, ativo) VALUES 
            (1, "admin", "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", "Admin Teste", "admin@teste.com", "administrador", 1),
            (2, "atendente", "$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi", "Atendente Teste", "atendente@teste.com", "atendente", 1)
        ');

        // Insert test conta
        $db->query('
            INSERT INTO cant_contas_alunos (ra_aluno, saldo, limite_diario, ativo) VALUES 
            (2021001, 100.00, 50.00, 1),
            (2021002, 0.00, null, 1)
        ');

        // Insert test movimentação
        $db->query('
            INSERT INTO cant_movimentacoes (tipo_conta, ra_aluno, tipo_movimentacao, valor, descricao, funcionario_cantina_id) VALUES
            ("aluno", 2021001, "credito", 100.00, "Crédito inicial", 1)
        ');
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

        // Atendente token
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
        $result = $this->get('api/alunos');
        
        $result->assertStatus(401);
        $result->assertJSONFragment(['success' => false]);
    }

    public function testIndexReturnsAlunosList(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos');
        
        $result->assertStatus(200);
        $result->assertJSONFragment(['success' => true]);
        
        $response = json_decode($result->getBody(), true);
        $this->assertArrayHasKey('data', $response);
        $this->assertArrayHasKey('meta', $response);
        $this->assertCount(3, $response['data']); // 3 test students
    }

    public function testIndexWithSearchFilter(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos?q=João');
        
        $result->assertStatus(200);
        $response = json_decode($result->getBody(), true);
        $this->assertCount(1, $response['data']);
        $this->assertEquals('João Silva', $response['data'][0]['nome']);
    }

    public function testIndexWithPagination(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos?page=1&perPage=2');
        
        $result->assertStatus(200);
        $response = json_decode($result->getBody(), true);
        $this->assertCount(2, $response['data']);
        $this->assertEquals(1, $response['meta']['page']);
        $this->assertEquals(2, $response['meta']['perPage']);
        $this->assertEquals(3, $response['meta']['total']);
    }

    public function testShowReturnsAlunoData(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos/2021001');
        
        $result->assertStatus(200);
        $result->assertJSONFragment([
            'success' => true,
            'ra' => 2021001,
            'nome' => 'João Silva'
        ]);
    }

    public function testShowInvalidRa(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos/abc');
        
        $result->assertStatus(400);
        $result->assertJSONFragment([
            'success' => false,
            'code' => 'INVALID_RA'
        ]);
    }

    public function testShowAlunoNotFound(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos/9999999');
        
        $result->assertStatus(404);
        $result->assertJSONFragment([
            'success' => false,
            'code' => 'NOT_FOUND'
        ]);
    }

    public function testContaReturnsAccountData(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos/2021001/conta');
        
        $result->assertStatus(200);
        $response = json_decode($result->getBody(), true);
        $this->assertTrue($response['success']);
        $this->assertEquals(2021001, $response['data']['ra']);
        $this->assertEquals(100.0, $response['data']['saldo']);
        $this->assertEquals(50.0, $response['data']['limite_diario']);
        $this->assertTrue($response['data']['conta_ativa']);
    }

    public function testContaCreatesAccountIfNotExists(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos/2021003/conta');
        
        $result->assertStatus(200);
        $response = json_decode($result->getBody(), true);
        $this->assertTrue($response['success']);
        $this->assertEquals(2021003, $response['data']['ra']);
        $this->assertEquals(0.0, $response['data']['saldo']);
    }

    public function testCreditoAddsMoneyToAccount(): void
    {
        $data = [
            'valor' => 50.0,
            'motivo' => 'Teste de crédito'
        ];

        $result = $this->withHeaders($this->getAuthHeaders())
                       ->post('api/alunos/2021001/credito', $data);
        
        $result->assertStatus(200);
        $response = json_decode($result->getBody(), true);
        $this->assertTrue($response['success']);
        $this->assertEquals(50.0, $response['data']['valor_adicionado']);
        $this->assertEquals(150.0, $response['data']['saldo_atual']); // 100 + 50
    }

    public function testCreditoValidatesInput(): void
    {
        $data = [
            'valor' => -10.0, // Invalid negative value
            'motivo' => 'Teste inválido'
        ];

        $result = $this->withHeaders($this->getAuthHeaders())
                       ->post('api/alunos/2021001/credito', $data);
        
        $result->assertStatus(422);
        $result->assertJSONFragment(['success' => false]);
    }

    public function testCreditoRequiresPermission(): void
    {
        // Create token for estoquista (no permission)
        $now = time();
        $expiration = $now + 3600;
        $estoquisaPayload = [
            'iss' => 'cantina-escolar',
            'aud' => 'cantina-escolar',
            'iat' => $now,
            'exp' => $expiration,
            'user_id' => 3,
            'tipo' => 'estoquista',
            'nome' => 'Estoquista Teste'
        ];
        $estoquistaToken = JWT::encode($estoquisaPayload, $this->jwtSecret, 'HS256');

        $data = ['valor' => 50.0];

        $result = $this->withHeaders(['Authorization' => 'Bearer ' . $estoquistaToken])
                       ->post('api/alunos/2021001/credito', $data);
        
        $result->assertStatus(403);
        $result->assertJSONFragment(['success' => false]);
    }

    public function testHistoricoReturnsMovements(): void
    {
        $result = $this->withHeaders($this->getAuthHeaders())
                       ->get('api/alunos/2021001/historico');
        
        $result->assertStatus(200);
        $response = json_decode($result->getBody(), true);
        $this->assertTrue($response['success']);
        $this->assertArrayHasKey('historico', $response['data']);
        $this->assertArrayHasKey('meta', $response['data']);
        $this->assertCount(1, $response['data']['historico']); // 1 initial credit
    }

    protected function tearDown(): void
    {
        // Cleanup test tables
        $db = \Config\Database::connect();
        $db->query('DROP VIEW IF EXISTS alunos');
        $db->query('DROP TABLE IF EXISTS cant_movimentacoes');
        $db->query('DROP TABLE IF EXISTS cant_contas_alunos');
        $db->query('DROP TABLE IF EXISTS cant_funcionarios');
        $db->query('DROP TABLE IF EXISTS matriculas_alunos');
        $db->query('DROP TABLE IF EXISTS cadastro_alunos');
        $db->query('DROP TABLE IF EXISTS cursos');
        
        parent::tearDown();
    }
}