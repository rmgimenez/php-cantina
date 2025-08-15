-- ============================================================================
--  Sistema: Controle de Cantina Escolar
--  Arquivo: bancodados.sql
--  Descrição: Script inicial de criação do schema MySQL (InnoDB) com prefixo cant_
--  Derivado dos requisitos RF001-RF040 e regras de negócio RN001-RN053.
--  Observação: Ajuste tipos/tamanhos conforme necessidade real e políticas da escola.
--  Compatível com MySQL 8.x (uso de CHECK constraints; se versão <8 remova-as).
-- ============================================================================
--  Convenções:
--    - Nomes de tabelas: cant_<entidade>
--    - Chaves primárias inteiras auto_increment (BIGINT para entidades de alto volume)
--    - Campos created_at / updated_at (DATETIME) quando aplicável
--    - Campos *_id como BIGINT UNSIGNED
--    - Uso de utf8mb4_unicode_ci
-- ============================================================================

SET NAMES utf8mb4;
SET time_zone = '+00:00';

-- (Opcional) CREATE DATABASE IF NOT EXISTS cantina CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE cantina;

-- ============================================================================
--  Tabelas de Acesso / Segurança
-- ============================================================================

CREATE TABLE IF NOT EXISTS cant_papel (
	id TINYINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	codigo VARCHAR(40) NOT NULL UNIQUE,
	nome VARCHAR(80) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Papéis de usuário (RF002)';

CREATE TABLE IF NOT EXISTS cant_permissao (
	id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	codigo VARCHAR(80) NOT NULL UNIQUE,
	nome VARCHAR(120) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Permissões atômicas (RF002)';

CREATE TABLE IF NOT EXISTS cant_papel_permissao (
	papel_id TINYINT UNSIGNED NOT NULL,
	permissao_id INT UNSIGNED NOT NULL,
	PRIMARY KEY (papel_id, permissao_id),
	CONSTRAINT fk_pp_papel FOREIGN KEY (papel_id) REFERENCES cant_papel(id),
	CONSTRAINT fk_pp_perm FOREIGN KEY (permissao_id) REFERENCES cant_permissao(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Relação N:N papéis/permissões (RF002)';

CREATE TABLE IF NOT EXISTS cant_usuario (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(120) NOT NULL,
	email VARCHAR(150) NULL,
	cpf CHAR(11) NULL,
	senha_hash VARCHAR(255) NOT NULL,
	papel_id TINYINT UNSIGNED NOT NULL,
	status ENUM('ativo','inativo','bloqueado') NOT NULL DEFAULT 'ativo',
	ultimo_acesso DATETIME NULL,
	tentativas_login TINYINT UNSIGNED NOT NULL DEFAULT 0,
	bloqueado_ate DATETIME NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_usuario_email (email),
	UNIQUE KEY uk_usuario_cpf (cpf),
	KEY idx_usuario_papel (papel_id),
	CONSTRAINT fk_usuario_papel FOREIGN KEY (papel_id) REFERENCES cant_papel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Usuários do sistema (RF001)';

CREATE TABLE IF NOT EXISTS cant_funcionario (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id BIGINT UNSIGNED NOT NULL,
	aps_id BIGINT UNSIGNED NULL,
	matricula VARCHAR(40) NULL,
	tipo_funcionario VARCHAR(50) NULL COMMENT 'Para precificação diferenciada (RF012)',
	tipo_contratacao VARCHAR(40) NULL,
	data_admissao DATE NULL,
	ativo TINYINT(1) NOT NULL DEFAULT 1,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_func_usuario (usuario_id),
	KEY idx_func_aps (aps_id),
	CONSTRAINT fk_func_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Funcionários cantina (RF003 / RF030)';

-- ============================================================================
--  Tabelas de Alunos, Responsáveis e Integração APS
-- ============================================================================

CREATE TABLE IF NOT EXISTS cant_aluno (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	matricula VARCHAR(50) NOT NULL,
	serie VARCHAR(50) NULL,
	turno VARCHAR(30) NULL,
	status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
	saldo_atual DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	saldo_reservado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_aluno_aps (aps_id),
	UNIQUE KEY uk_aluno_matricula (matricula),
	KEY idx_aluno_nome (nome),
	KEY idx_aluno_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Alunos (RF005)';

CREATE TABLE IF NOT EXISTS cant_aluno_historico_serie (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aluno_id BIGINT UNSIGNED NOT NULL,
	serie VARCHAR(50) NOT NULL,
	turno VARCHAR(30) NULL,
	inicio DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	fim DATETIME NULL,
	KEY idx_hist_aluno (aluno_id),
	CONSTRAINT fk_hist_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Histórico de série (RN009)';

CREATE TABLE IF NOT EXISTS cant_responsavel (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	cpf CHAR(11) NOT NULL,
	email VARCHAR(150) NULL,
	telefone VARCHAR(30) NULL,
	status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_resp_aps (aps_id),
	UNIQUE KEY uk_resp_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Responsáveis (RF004)';

CREATE TABLE IF NOT EXISTS cant_responsavel_aluno (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	responsavel_id BIGINT UNSIGNED NOT NULL,
	aluno_id BIGINT UNSIGNED NOT NULL,
	status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_resp_aluno (responsavel_id, aluno_id),
	KEY idx_ra_aluno (aluno_id),
	CONSTRAINT fk_ra_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id),
	CONSTRAINT fk_ra_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vínculos Responsável-Aluno (RF004)';

CREATE TABLE IF NOT EXISTS cant_responsavel_aluno_pref (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	responsavel_id BIGINT UNSIGNED NOT NULL,
	aluno_id BIGINT UNSIGNED NOT NULL,
	produto_id BIGINT UNSIGNED NULL,
	categoria_id BIGINT UNSIGNED NULL,
	permitido ENUM('permitido','bloqueado','alerta') NOT NULL,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_pref_unique (responsavel_id, aluno_id, produto_id, categoria_id),
	KEY idx_pref_aluno (aluno_id),
	CONSTRAINT fk_pref_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id),
	CONSTRAINT fk_pref_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id)
	-- produto_id / categoria_id FK adicionadas após definição das tabelas correspondentes
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Restrições de consumo (RF014/RF023)';

-- ============================================================================
--  Catálogo e Estoque
-- ============================================================================

CREATE TABLE IF NOT EXISTS cant_categoria (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(120) NOT NULL,
	descricao VARCHAR(255) NULL,
	ativa TINYINT(1) NOT NULL DEFAULT 1,
	ordem_exibicao INT UNSIGNED NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_categoria_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorias de produto (RF006)';

CREATE TABLE IF NOT EXISTS cant_produto (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	categoria_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	descricao VARCHAR(255) NULL,
	tipo ENUM('unitario','peso','kit') NOT NULL,
	preco_base DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	unidade_medida VARCHAR(20) NULL,
	permite_saldo TINYINT(1) NOT NULL DEFAULT 1,
	ativo TINYINT(1) NOT NULL DEFAULT 1,
	estoque_minimo INT UNSIGNED NULL,
	estoque_atual INT NOT NULL DEFAULT 0,
	codigo_interno VARCHAR(60) NULL,
	flags_restricao VARCHAR(255) NULL COMMENT 'Alérgenos etc (RN013)',
	controle_estoque TINYINT(1) NOT NULL DEFAULT 1 COMMENT '0 = sem controle (RN015)',
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_produto_nome_categoria (nome, categoria_id),
	UNIQUE KEY uk_produto_codigo (codigo_interno),
	KEY idx_produto_categoria (categoria_id),
	KEY idx_produto_tipo (tipo),
	CONSTRAINT fk_prod_categoria FOREIGN KEY (categoria_id) REFERENCES cant_categoria(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Produtos (RF007)';

ALTER TABLE cant_responsavel_aluno_pref
	ADD CONSTRAINT fk_pref_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id),
	ADD CONSTRAINT fk_pref_cat FOREIGN KEY (categoria_id) REFERENCES cant_categoria(id);

CREATE TABLE IF NOT EXISTS cant_estoque_mov (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	produto_id BIGINT UNSIGNED NOT NULL,
	tipo ENUM('entrada','saida','ajuste') NOT NULL,
	quantidade DECIMAL(12,3) NOT NULL,
	origem VARCHAR(50) NULL,
	usuario_id BIGINT UNSIGNED NULL,
	custo_unitario_opc DECIMAL(12,2) NULL,
	observacao VARCHAR(255) NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_est_prod (produto_id),
	KEY idx_est_tipo (tipo),
	CONSTRAINT fk_est_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id),
	CONSTRAINT fk_est_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimentações de estoque (RF008)';

-- ============================================================================
--  Kits (Pacotes) (RF009 / RF013)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cant_kit (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(150) NOT NULL,
	descricao VARCHAR(255) NULL,
	periodo_tipo ENUM('semana','mes','custom') NOT NULL,
	duracao_dias INT UNSIGNED NULL,
	preco DECIMAL(12,2) NOT NULL,
	ativo TINYINT(1) NOT NULL DEFAULT 1,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uk_kit_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Definição de kits (RF009)';

CREATE TABLE IF NOT EXISTS cant_kit_itens (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	kit_id BIGINT UNSIGNED NOT NULL,
	produto_id BIGINT UNSIGNED NOT NULL,
	quantidade_permitida INT UNSIGNED NOT NULL DEFAULT 1,
	UNIQUE KEY uk_kit_item (kit_id, produto_id),
	CONSTRAINT fk_kititem_kit FOREIGN KEY (kit_id) REFERENCES cant_kit(id),
	CONSTRAINT fk_kititem_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Itens de um kit';

CREATE TABLE IF NOT EXISTS cant_kit_assinatura (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	kit_id BIGINT UNSIGNED NOT NULL,
	aluno_id BIGINT UNSIGNED NOT NULL,
	responsavel_id BIGINT UNSIGNED NULL,
	inicio_vigencia DATE NOT NULL,
	fim_vigencia DATE NOT NULL,
	saldo_consumos_restante INT UNSIGNED NOT NULL DEFAULT 0,
	status ENUM('ativo','consumido','expirado','cancelado') NOT NULL DEFAULT 'ativo',
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_assinatura_periodo (kit_id, aluno_id, inicio_vigencia, fim_vigencia),
	KEY idx_assinatura_status (status),
	CONSTRAINT fk_ass_kit FOREIGN KEY (kit_id) REFERENCES cant_kit(id),
	CONSTRAINT fk_ass_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id),
	CONSTRAINT fk_ass_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Assinaturas de kits (RF009/RF024)';

-- ============================================================================
--  Vendas / PDV (RF010-RF016, RF013 integração kit)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cant_venda (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	tipo_consumidor ENUM('aluno','funcionario','externo') NOT NULL,
	aluno_id BIGINT UNSIGNED NULL,
	funcionario_id BIGINT UNSIGNED NULL,
	total_bruto DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	total_descontos DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	total_liquido DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	forma_pagamento ENUM('saldo','dinheiro','misto','folha') NOT NULL,
	status ENUM('ativa','cancelada') NOT NULL DEFAULT 'ativa',
	usuario_caixa_id BIGINT UNSIGNED NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	horario_operacao DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_venda_aluno (aluno_id),
	KEY idx_venda_func (funcionario_id),
	KEY idx_venda_status (status),
	KEY idx_venda_data (created_at),
	CONSTRAINT fk_venda_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id),
	CONSTRAINT fk_venda_func FOREIGN KEY (funcionario_id) REFERENCES cant_funcionario(id),
	CONSTRAINT fk_venda_usuario FOREIGN KEY (usuario_caixa_id) REFERENCES cant_usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Vendas PDV';

CREATE TABLE IF NOT EXISTS cant_venda_item (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	venda_id BIGINT UNSIGNED NOT NULL,
	produto_id BIGINT UNSIGNED NOT NULL,
	quantidade DECIMAL(12,3) NOT NULL DEFAULT 1.000,
	preco_unitario DECIMAL(12,2) NOT NULL,
	subtotal DECIMAL(12,2) NOT NULL,
	origem_preco ENUM('base','personalizado','kit') NOT NULL DEFAULT 'base',
	desconto_aplicado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	peso_registrado_gramas INT UNSIGNED NULL,
	kit_assinatura_id BIGINT UNSIGNED NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_vitem_venda (venda_id),
	KEY idx_vitem_prod (produto_id),
	CONSTRAINT fk_vitem_venda FOREIGN KEY (venda_id) REFERENCES cant_venda(id),
	CONSTRAINT fk_vitem_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id),
	CONSTRAINT fk_vitem_kitass FOREIGN KEY (kit_assinatura_id) REFERENCES cant_kit_assinatura(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Itens de venda';

CREATE TABLE IF NOT EXISTS cant_venda_pagamento (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	venda_id BIGINT UNSIGNED NOT NULL,
	tipo ENUM('saldo','dinheiro','folha') NOT NULL,
	valor DECIMAL(12,2) NOT NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_vpag_venda (venda_id),
	CONSTRAINT fk_vpag_venda FOREIGN KEY (venda_id) REFERENCES cant_venda(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pagamentos (RF015)';

CREATE TABLE IF NOT EXISTS cant_venda_cancelamento (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	venda_id BIGINT UNSIGNED NOT NULL,
	usuario_id BIGINT UNSIGNED NOT NULL,
	motivo VARCHAR(255) NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_cancel_venda (venda_id),
	CONSTRAINT fk_cancel_venda FOREIGN KEY (venda_id) REFERENCES cant_venda(id),
	CONSTRAINT fk_cancel_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cancelamentos (RF016)';

CREATE TABLE IF NOT EXISTS cant_preco_personalizado (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	produto_id BIGINT UNSIGNED NOT NULL,
	tipo_funcionario VARCHAR(50) NOT NULL,
	preco DECIMAL(12,2) NOT NULL,
	UNIQUE KEY uk_preco_prod_tipo (produto_id, tipo_funcionario),
	CONSTRAINT fk_pprod_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Preços diferenciados (RF012)';

-- ============================================================================
--  Saldos, Movimentações e Financeiro (RF017-RF020)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cant_movimento_saldo (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aluno_id BIGINT UNSIGNED NOT NULL,
	tipo ENUM('credito','debito','reserva','ajuste') NOT NULL,
	valor DECIMAL(12,2) NOT NULL,
	referencia_tipo ENUM('venda','recarga','ajuste','kit') NULL,
	referencia_id BIGINT UNSIGNED NULL,
	observacao VARCHAR(255) NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_mov_aluno (aluno_id),
	KEY idx_mov_tipo (tipo),
	CONSTRAINT fk_mov_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimentações de saldo (RF017)';

CREATE TABLE IF NOT EXISTS cant_recarga (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aluno_id BIGINT UNSIGNED NOT NULL,
	responsavel_id BIGINT UNSIGNED NULL,
	valor DECIMAL(12,2) NOT NULL,
	meio ENUM('dinheiro','pix','boleto','cartao','outro') NOT NULL,
	status ENUM('pendente','confirmada','cancelada') NOT NULL DEFAULT 'pendente',
	comprovante_ref VARCHAR(100) NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_rec_aluno (aluno_id),
	KEY idx_rec_resp (responsavel_id),
	CONSTRAINT fk_rec_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id),
	CONSTRAINT fk_rec_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Recargas de saldo (RF018)';

CREATE TABLE IF NOT EXISTS cant_fatura_func (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	funcionario_id BIGINT UNSIGNED NOT NULL,
	mes_ref CHAR(7) NOT NULL COMMENT 'Formato YYYY-MM',
	total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	status ENUM('aberta','baixada') NOT NULL DEFAULT 'aberta',
	data_baixa DATETIME NULL,
	observacao VARCHAR(255) NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_fatura_func_mes (funcionario_id, mes_ref),
	KEY idx_fatura_status (status),
	CONSTRAINT fk_fatura_func FOREIGN KEY (funcionario_id) REFERENCES cant_funcionario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Faturas de funcionários (RF019)';

CREATE TABLE IF NOT EXISTS cant_fatura_func_item (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	fatura_id BIGINT UNSIGNED NOT NULL,
	venda_id BIGINT UNSIGNED NOT NULL,
	valor DECIMAL(12,2) NOT NULL,
	UNIQUE KEY uk_fatura_venda (fatura_id, venda_id),
	KEY idx_ffitem_venda (venda_id),
	CONSTRAINT fk_ffitem_fatura FOREIGN KEY (fatura_id) REFERENCES cant_fatura_func(id),
	CONSTRAINT fk_ffitem_venda FOREIGN KEY (venda_id) REFERENCES cant_venda(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Itens da fatura funcionário';

CREATE TABLE IF NOT EXISTS cant_fatura_func_pagamento (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	fatura_id BIGINT UNSIGNED NOT NULL,
	data DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	valor DECIMAL(12,2) NOT NULL,
	metodo VARCHAR(40) NULL,
	usuario_id BIGINT UNSIGNED NOT NULL,
	CONSTRAINT fk_ffpag_fatura FOREIGN KEY (fatura_id) REFERENCES cant_fatura_func(id),
	CONSTRAINT fk_ffpag_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Pagamentos de fatura (RF020)';

-- ============================================================================
--  Auditoria, Logs, Parametrização, Notificações, Jobs (RF025-RF040)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cant_auditoria (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id BIGINT UNSIGNED NULL,
	acao VARCHAR(80) NOT NULL,
	entidade VARCHAR(80) NULL,
	entidade_id BIGINT UNSIGNED NULL,
	dados_antes JSON NULL,
	dados_depois JSON NULL,
	ip VARCHAR(45) NULL,
	user_agent VARCHAR(255) NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_audit_usuario (usuario_id),
	KEY idx_audit_entidade (entidade, entidade_id),
	CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Log de auditoria (RF027)';

CREATE TABLE IF NOT EXISTS cant_parametro (
	chave VARCHAR(60) PRIMARY KEY,
	valor VARCHAR(255) NOT NULL,
	descricao VARCHAR(255) NULL,
	escopo VARCHAR(40) NULL,
	updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Parâmetros do sistema (RF031)';

CREATE TABLE IF NOT EXISTS cant_job_execucao (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	job VARCHAR(80) NOT NULL,
	status ENUM('sucesso','falha','executando') NOT NULL,
	started_at DATETIME NOT NULL,
	ended_at DATETIME NULL,
	mensagem VARCHAR(255) NULL,
	latencia_ms INT UNSIGNED NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_job_nome (job),
	KEY idx_job_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Execuções de jobs (RF032)';

CREATE TABLE IF NOT EXISTS cant_notificacao (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	responsavel_id BIGINT UNSIGNED NOT NULL,
	tipo VARCHAR(50) NOT NULL,
	payload_json JSON NULL,
	status_envio ENUM('pendente','enviado','falha') NOT NULL DEFAULT 'pendente',
	tentativas TINYINT UNSIGNED NOT NULL DEFAULT 0,
	proxima_tentativa DATETIME NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at DATETIME NULL ON UPDATE CURRENT_TIMESTAMP,
	KEY idx_notif_resp (responsavel_id),
	KEY idx_notif_status (status_envio),
	CONSTRAINT fk_notif_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Notificações (RF037)';

CREATE TABLE IF NOT EXISTS cant_log_erro (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nivel VARCHAR(20) NOT NULL,
	mensagem VARCHAR(255) NOT NULL,
	stack_trace TEXT NULL,
	contexto_json JSON NULL,
	created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	KEY idx_erro_nivel (nivel),
	KEY idx_erro_data (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Logs de erro (RF040)';

-- ============================================================================
--  Busca Global / Índices Auxiliares (RF035 / RF036 / RN048 / RN049)
-- ============================================================================
--  (Demais índices já cobrem a maioria das consultas. Ajustar após monitorar plano.)

-- ============================================================================
--  Tabelas de Staging Integração APS (RF029 / RF030)
-- ============================================================================

CREATE TABLE IF NOT EXISTS cant_stg_aps_responsavel (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	cpf CHAR(11) NOT NULL,
	email VARCHAR(150) NULL,
	telefone VARCHAR(30) NULL,
	raw_json JSON NULL,
	carregado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_stg_resp_aps (aps_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Staging responsáveis APS';

CREATE TABLE IF NOT EXISTS cant_stg_aps_aluno (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	matricula VARCHAR(50) NOT NULL,
	serie VARCHAR(50) NULL,
	turno VARCHAR(30) NULL,
	raw_json JSON NULL,
	carregado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_stg_aluno_aps (aps_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Staging alunos APS';

CREATE TABLE IF NOT EXISTS cant_stg_aps_funcionario (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	matricula VARCHAR(50) NULL,
	tipo_funcionario VARCHAR(50) NULL,
	raw_json JSON NULL,
	carregado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uk_stg_func_aps (aps_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Staging funcionários APS';

-- ============================================================================
--  FKs adicionais dependentes de ordem (adicionadas após criação de todas as tabelas)
-- ============================================================================
-- (Nenhuma pendente além das já adicionadas; blocos mantidos para futuras expansões.)

-- ============================================================================
--  CHECK Constraints (MySQL 8) - simples exemplos (remover se versão antiga)
-- ============================================================================
ALTER TABLE cant_venda_item
	ADD CONSTRAINT chk_vitem_qtd_pos CHECK (quantidade > 0),
	ADD CONSTRAINT chk_vitem_preco_pos CHECK (preco_unitario >= 0),
	ADD CONSTRAINT chk_vitem_subtotal_pos CHECK (subtotal >= 0);

ALTER TABLE cant_movimento_saldo
	ADD CONSTRAINT chk_mov_valor_pos CHECK (valor >= 0);

ALTER TABLE cant_recarga
	ADD CONSTRAINT chk_rec_valor_pos CHECK (valor > 0);

ALTER TABLE cant_estoque_mov
	ADD CONSTRAINT chk_est_quantidade_pos CHECK (quantidade <> 0);

-- ============================================================================
--  Seeds iniciais (papéis, parâmetros, usuário administrativo)
-- ============================================================================

INSERT INTO cant_papel (id, codigo, nome) VALUES
	(1,'caixa','Caixa'),
	(2,'supervisor','Supervisor'),
	(3,'gerente','Gerente'),
	(4,'informatica','Informática'),
	(5,'responsavel','Responsável')
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Usuário técnico inicial (senha deve ser alterada após deploy). Hash bcrypt de 'Trocar@123'
INSERT INTO cant_usuario (id, nome, email, cpf, senha_hash, papel_id, status) VALUES
	(1,'Administrador Técnico','admin@cantina.local',NULL,'$2y$10$abcdefghijklmnopqrstuvCObOGusHashDeExemplo1234567890',4,'ativo')
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Parâmetros padrão
INSERT INTO cant_parametro (chave, valor, descricao) VALUES
 ('janela_cancelamento_min','30','Janela (minutos) para cancelamento de venda (RN027)'),
 ('peso_minimo_gramas','1','Peso mínimo aceitável para produtos por peso (RN021)'),
 ('limite_recarga_min','5.00','Valor mínimo de recarga (RN029)'),
 ('limite_recarga_max_diario','300.00','Valor máximo diário de recarga (RN029)'),
 ('limite_ajuste_supervisor','50.00','Limite de ajuste de saldo/estoque supervisor (RN046)'),
 ('saldo_baixo_threshold','10.00','Limiar de notificação de saldo baixo (RN050)'),
 ('timeout_sessao_min','30','Timeout de sessão em minutos (RN052)'),
 ('pdv_horario_inicio','07:00','Horário inicial PDV (RN020)'),
 ('pdv_horario_fim','18:00','Horário final PDV (RN020)')
ON DUPLICATE KEY UPDATE valor=VALUES(valor);

-- Exemplo de permissões (ampliar conforme necessidade)
INSERT INTO cant_permissao (codigo, nome) VALUES
	('pdv.vender','Acessar PDV e registrar vendas'),
	('produto.gerir','Gerir produtos'),
	('categoria.gerir','Gerir categorias'),
	('estoque.ajustar','Ajustar estoque'),
	('usuario.gerir','Gerir usuários'),
	('relatorios.ver','Ver relatórios'),
	('fatura.gerir','Gerir faturamento funcionários'),
	('saldo.ajustar','Ajustar saldo'),
	('kit.gerir','Gerir kits'),
	('integracao.exec','Executar integrações APS')
ON DUPLICATE KEY UPDATE nome=VALUES(nome);

-- Relaciona permissões a papéis (exemplo inicial simples)
INSERT IGNORE INTO cant_papel_permissao (papel_id, permissao_id)
SELECT p.id, r.id FROM cant_papel p CROSS JOIN cant_permissao r
WHERE p.codigo='informatica'; -- papel informática recebe todas

INSERT IGNORE INTO cant_papel_permissao (papel_id, permissao_id)
SELECT (SELECT id FROM cant_papel WHERE codigo='gerente'), id FROM cant_permissao WHERE codigo IN ('pdv.vender','produto.gerir','categoria.gerir','estoque.ajustar','usuario.gerir','relatorios.ver','fatura.gerir','saldo.ajustar','kit.gerir');

INSERT IGNORE INTO cant_papel_permissao (papel_id, permissao_id)
SELECT (SELECT id FROM cant_papel WHERE codigo='supervisor'), id FROM cant_permissao WHERE codigo IN ('pdv.vender','produto.gerir','categoria.gerir','estoque.ajustar','relatorios.ver','kit.gerir');

INSERT IGNORE INTO cant_papel_permissao (papel_id, permissao_id)
SELECT (SELECT id FROM cant_papel WHERE codigo='caixa'), id FROM cant_permissao WHERE codigo IN ('pdv.vender');

-- Responsável normalmente acessa portal; permissões específicas podem ser adicionadas futuramente

-- ============================================================================
--  Views (exemplos úteis) - criar somente se necessário
-- ============================================================================

CREATE OR REPLACE VIEW cant_view_saldo_aluno AS
SELECT a.id AS aluno_id, a.nome, a.saldo_atual, a.saldo_reservado,
			 (a.saldo_atual - a.saldo_reservado) AS saldo_disponivel
FROM cant_aluno a;

CREATE OR REPLACE VIEW cant_view_estoque_critico AS
SELECT p.id AS produto_id, p.nome, p.estoque_atual, p.estoque_minimo
FROM cant_produto p
WHERE p.controle_estoque = 1 AND p.estoque_minimo IS NOT NULL AND p.estoque_atual <= p.estoque_minimo;

-- ============================================================================
--  Notas:
--  1. Ajustar senha hash do usuário inicial.
--  2. Implementar triggers se desejar manter saldo_atual derivado automaticamente.
--  3. Monitorar índice de crescimento e otimizar índices adicionais conforme queries reais.
--  4. Para ambientes de produção, separar migrations em arquivos incrementais.
-- ============================================================================

-- Fim do script.
