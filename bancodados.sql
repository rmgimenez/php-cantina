-- ------------------------------------------------------------
-- Banco de Dados: Sistema de Cantina Escolar
-- Gerado a partir dos requisitos funcionais (RF001-RF040) e RN001-RN053
-- Prefixo obrigatório: cant_
-- Observação: Em produção recomenda-se quebrar em migrations individuais.
-- Charset/Collation: utf8mb4 / utf8mb4_unicode_ci
-- ------------------------------------------------------------

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS=0;

-- ------------------------------------------------------------
-- TABELAS DE CONTROLE DE ACESSO / USUÁRIOS
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cant_papel (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	codigo VARCHAR(50) NOT NULL UNIQUE, -- 'caixa','supervisor','gerente','informatica','responsavel'
	nome VARCHAR(100) NOT NULL,
	descricao VARCHAR(255) NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_permissao (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	codigo VARCHAR(100) NOT NULL UNIQUE, -- ex: 'venda.cancelar'
	nome VARCHAR(150) NOT NULL,
	descricao VARCHAR(255) NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_papel_permissao (
	papel_id BIGINT UNSIGNED NOT NULL,
	permissao_id BIGINT UNSIGNED NOT NULL,
	PRIMARY KEY (papel_id, permissao_id),
	CONSTRAINT fk_papelperm_papel FOREIGN KEY (papel_id) REFERENCES cant_papel(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_papelperm_perm FOREIGN KEY (permissao_id) REFERENCES cant_permissao(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_usuario (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(150) NOT NULL,
	email VARCHAR(150) NULL,
	cpf CHAR(11) NULL,
	senha_hash VARCHAR(255) NOT NULL,
	papel_id BIGINT UNSIGNED NOT NULL,
	status ENUM('ativo','inativo','bloqueado') NOT NULL DEFAULT 'ativo',
	ultimo_acesso DATETIME NULL,
	tentativas_login INT NOT NULL DEFAULT 0, -- RN002
	bloqueado_ate DATETIME NULL, -- RN002 bloqueio temporário
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_usuario_email (email),
	UNIQUE KEY uq_usuario_cpf (cpf),
	INDEX idx_usuario_papel (papel_id),
	CONSTRAINT fk_usuario_papel FOREIGN KEY (papel_id) REFERENCES cant_papel(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Funcionários da cantina / importados APS (RF003, RF030)
CREATE TABLE IF NOT EXISTS cant_funcionario (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id BIGINT UNSIGNED NOT NULL UNIQUE,
	aps_id BIGINT UNSIGNED NULL, -- id origem APS
	matricula VARCHAR(50) NULL,
	tipo_funcionario VARCHAR(50) NULL, -- usado para precificação diferenciada RN022
	tipo_contratacao VARCHAR(50) NULL,
	data_admissao DATE NULL,
	ativo TINYINT(1) NOT NULL DEFAULT 1,
	arquivado TINYINT(1) NOT NULL DEFAULT 0, -- RN043
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_func_matricula (matricula),
	INDEX idx_func_tipo (tipo_funcionario),
	CONSTRAINT fk_func_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Responsáveis (RF004) - autenticação via CPF
CREATE TABLE IF NOT EXISTS cant_responsavel (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NULL,
	nome VARCHAR(150) NOT NULL,
	cpf CHAR(11) NOT NULL,
	email VARCHAR(150) NULL,
	telefone VARCHAR(30) NULL,
	status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
	usuario_id BIGINT UNSIGNED NULL UNIQUE, -- referência cant_usuario (papel responsavel)
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_resp_cpf (cpf),
	CONSTRAINT fk_resp_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Alunos (RF005)
CREATE TABLE IF NOT EXISTS cant_aluno (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NULL,
	nome VARCHAR(150) NOT NULL,
	matricula VARCHAR(50) NOT NULL,
	serie VARCHAR(50) NULL,
	turno VARCHAR(30) NULL,
	status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
	saldo_atual DECIMAL(12,2) NOT NULL DEFAULT 0.00, -- visão denormalizada para leitura rápida
	saldo_reservado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_aluno_matricula (matricula),
	INDEX idx_aluno_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Histórico de série (RN009)
CREATE TABLE IF NOT EXISTS cant_aluno_serie_historico (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aluno_id BIGINT UNSIGNED NOT NULL,
	serie VARCHAR(50) NOT NULL,
	turno VARCHAR(30) NULL,
	vigencia_inicio DATE NOT NULL,
	vigencia_fim DATE NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_aluno_hist_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id) ON DELETE CASCADE ON UPDATE CASCADE,
	INDEX idx_aluno_hist_aluno (aluno_id, vigencia_inicio)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Vinculo Responsável <> Aluno (RF004)
CREATE TABLE IF NOT EXISTS cant_responsavel_aluno (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	responsavel_id BIGINT UNSIGNED NOT NULL,
	aluno_id BIGINT UNSIGNED NOT NULL,
	status ENUM('ativo','inativo') NOT NULL DEFAULT 'ativo',
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uq_resp_aluno (responsavel_id, aluno_id),
	CONSTRAINT fk_respAluno_responsavel FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_respAluno_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id) ON DELETE CASCADE ON UPDATE CASCADE,
	INDEX idx_respAluno_aluno (aluno_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preferências de restrição de consumo (RF014, RF023) RN025
CREATE TABLE IF NOT EXISTS cant_responsavel_aluno_preferencias (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	responsavel_id BIGINT UNSIGNED NOT NULL,
	aluno_id BIGINT UNSIGNED NOT NULL,
	produto_id BIGINT UNSIGNED NULL,
	categoria_id BIGINT UNSIGNED NULL,
	permitido ENUM('sim','nao','alerta') NOT NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_pref_resp_aluno_prod_cat (responsavel_id, aluno_id, produto_id, categoria_id),
	CONSTRAINT fk_pref_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_pref_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_pref_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_pref_cat FOREIGN KEY (categoria_id) REFERENCES cant_categoria(id) ON DELETE CASCADE ON UPDATE CASCADE,
	INDEX idx_pref_aluno (aluno_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- CATÁLOGO / ESTOQUE
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cant_categoria (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(100) NOT NULL,
	descricao VARCHAR(255) NULL,
	ativa TINYINT(1) NOT NULL DEFAULT 1,
	ordem_exibicao INT NOT NULL DEFAULT 0,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_categoria_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_produto (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	categoria_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	descricao VARCHAR(255) NULL,
	tipo ENUM('unitario','peso','kit') NOT NULL, -- RN012
	preco_base DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	unidade_medida VARCHAR(20) NULL, -- ex: 'UN','KG'
	permite_saldo TINYINT(1) NOT NULL DEFAULT 1,
	ativo TINYINT(1) NOT NULL DEFAULT 1, -- RN011 inativação
	estoque_minimo DECIMAL(12,3) NULL,
	estoque_atual DECIMAL(12,3) NULL DEFAULT 0.000,
	sem_controle_estoque TINYINT(1) NOT NULL DEFAULT 0, -- RN015
	codigo_interno VARCHAR(50) NULL,
	flags_restricao VARCHAR(255) NULL, -- RN013
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_prod_cat_nome (categoria_id, nome),
	UNIQUE KEY uq_prod_codigo (codigo_interno),
	INDEX idx_prod_categoria (categoria_id),
	INDEX idx_prod_nome (nome),
	CONSTRAINT fk_prod_categoria FOREIGN KEY (categoria_id) REFERENCES cant_categoria(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Movimentações de estoque (RF008)
CREATE TABLE IF NOT EXISTS cant_estoque_mov (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	produto_id BIGINT UNSIGNED NOT NULL,
	tipo ENUM('entrada','saida','ajuste') NOT NULL,
	quantidade DECIMAL(12,3) NOT NULL,
	origem VARCHAR(50) NOT NULL, -- 'compra','venda','ajuste','cancelamento'
	usuario_id BIGINT UNSIGNED NULL,
	custo_unitario_opcional DECIMAL(12,4) NULL,
	observacao VARCHAR(255) NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_est_mov_prod (produto_id),
	INDEX idx_est_mov_tipo (tipo),
	CONSTRAINT fk_est_mov_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id) ON UPDATE CASCADE,
	CONSTRAINT fk_est_mov_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Kits (RF009)
CREATE TABLE IF NOT EXISTS cant_kit (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nome VARCHAR(150) NOT NULL,
	descricao VARCHAR(255) NULL,
	periodo_tipo ENUM('semana','mes','custom') NOT NULL,
	duracao_dias INT NOT NULL,
	preco DECIMAL(12,2) NOT NULL,
	ativo TINYINT(1) NOT NULL DEFAULT 1,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_kit_nome (nome)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_kit_itens (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	kit_id BIGINT UNSIGNED NOT NULL,
	produto_id BIGINT UNSIGNED NOT NULL,
	quantidade_permitida INT NOT NULL DEFAULT 1, -- RN016
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uq_kit_item (kit_id, produto_id),
	CONSTRAINT fk_kit_item_kit FOREIGN KEY (kit_id) REFERENCES cant_kit(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_kit_item_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_kit_assinatura (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	kit_id BIGINT UNSIGNED NOT NULL,
	aluno_id BIGINT UNSIGNED NOT NULL,
	responsavel_id BIGINT UNSIGNED NULL,
	inicio_vigencia DATE NOT NULL,
	fim_vigencia DATE NOT NULL,
	saldo_consumos_restante INT NOT NULL,
	status ENUM('ativa','consumido','expirada','cancelada') NOT NULL DEFAULT 'ativa',
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_kit_assinatura_periodo (kit_id, aluno_id, inicio_vigencia, fim_vigencia), -- RN017
	INDEX idx_kit_ass_aluno (aluno_id),
	CONSTRAINT fk_kit_ass_kit FOREIGN KEY (kit_id) REFERENCES cant_kit(id) ON UPDATE CASCADE,
	CONSTRAINT fk_kit_ass_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_kit_ass_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Preço Personalizado (RF012)
CREATE TABLE IF NOT EXISTS cant_preco_personalizado (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	produto_id BIGINT UNSIGNED NOT NULL,
	tipo_funcionario VARCHAR(50) NOT NULL,
	preco DECIMAL(12,2) NOT NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_preco_prod_tipo (produto_id, tipo_funcionario),
	CONSTRAINT fk_preco_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- VENDAS / PDV (RF010-RF016)
-- ------------------------------------------------------------

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
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX idx_venda_data (created_at),
	INDEX idx_venda_aluno (aluno_id),
	INDEX idx_venda_func (funcionario_id),
	CONSTRAINT fk_venda_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id) ON UPDATE CASCADE,
	CONSTRAINT fk_venda_funcionario FOREIGN KEY (funcionario_id) REFERENCES cant_funcionario(id) ON UPDATE CASCADE,
	CONSTRAINT fk_venda_usuario_caixa FOREIGN KEY (usuario_caixa_id) REFERENCES cant_usuario(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_venda_item (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	venda_id BIGINT UNSIGNED NOT NULL,
	produto_id BIGINT UNSIGNED NOT NULL,
	quantidade DECIMAL(12,3) NOT NULL DEFAULT 1.000,
	preco_unitario DECIMAL(12,2) NOT NULL,
	subtotal DECIMAL(12,2) NOT NULL,
	origem_preco ENUM('base','personalizado','kit','desconto','promocao') NOT NULL DEFAULT 'base',
	desconto_aplicado DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	peso_registrado_gramas INT NULL, -- RF011
	kit_assinatura_id BIGINT UNSIGNED NULL, -- se origem_preco='kit'
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_vendaitem_venda FOREIGN KEY (venda_id) REFERENCES cant_venda(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_vendaitem_prod FOREIGN KEY (produto_id) REFERENCES cant_produto(id) ON UPDATE CASCADE,
	CONSTRAINT fk_vendaitem_kit_ass FOREIGN KEY (kit_assinatura_id) REFERENCES cant_kit_assinatura(id) ON UPDATE CASCADE,
	INDEX idx_vendaitem_prod (produto_id),
	INDEX idx_vendaitem_venda (venda_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_venda_pagamento (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	venda_id BIGINT UNSIGNED NOT NULL,
	tipo ENUM('saldo','dinheiro','folha') NOT NULL,
	valor DECIMAL(12,2) NOT NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_vendapg_venda FOREIGN KEY (venda_id) REFERENCES cant_venda(id) ON DELETE CASCADE ON UPDATE CASCADE,
	INDEX idx_vendapg_venda (venda_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_venda_cancelamento (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	venda_id BIGINT UNSIGNED NOT NULL UNIQUE,
	motivo VARCHAR(255) NULL,
	usuario_id BIGINT UNSIGNED NOT NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_venda_cancel_venda FOREIGN KEY (venda_id) REFERENCES cant_venda(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_venda_cancel_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- SALDOS / FINANCEIRO (RF017-RF020, RF018 recarga)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cant_movimento_saldo (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aluno_id BIGINT UNSIGNED NOT NULL,
	tipo ENUM('credito','debito','reserva','ajuste') NOT NULL,
	valor DECIMAL(12,2) NOT NULL,
	referencia_tipo ENUM('venda','recarga','ajuste','kit','outro') NOT NULL,
	referencia_id BIGINT UNSIGNED NULL,
	observacao VARCHAR(255) NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_movsaldo_aluno (aluno_id, created_at),
	CONSTRAINT fk_movsaldo_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_recarga (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aluno_id BIGINT UNSIGNED NOT NULL,
	responsavel_id BIGINT UNSIGNED NULL,
	valor DECIMAL(12,2) NOT NULL,
	meio ENUM('dinheiro','pix','boleto','cartao','outro') NOT NULL,
	status ENUM('pendente','confirmada','cancelada') NOT NULL DEFAULT 'pendente',
	comprovante_ref VARCHAR(150) NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	INDEX idx_recarga_aluno (aluno_id),
	CONSTRAINT fk_recarga_aluno FOREIGN KEY (aluno_id) REFERENCES cant_aluno(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_recarga_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_fatura_func (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	funcionario_id BIGINT UNSIGNED NOT NULL,
	mes_ref CHAR(7) NOT NULL, -- formato YYYY-MM
	total DECIMAL(12,2) NOT NULL DEFAULT 0.00,
	status ENUM('aberta','baixada','reprocessar') NOT NULL DEFAULT 'aberta', -- RN031
	data_baixa DATETIME NULL,
	observacao VARCHAR(255) NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
	UNIQUE KEY uq_fatura_func_mes (funcionario_id, mes_ref),
	CONSTRAINT fk_fatura_func_func FOREIGN KEY (funcionario_id) REFERENCES cant_funcionario(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_fatura_func_item (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	fatura_id BIGINT UNSIGNED NOT NULL,
	venda_id BIGINT UNSIGNED NOT NULL,
	valor DECIMAL(12,2) NOT NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uq_fatura_item_venda (fatura_id, venda_id),
	CONSTRAINT fk_faturaitem_fatura FOREIGN KEY (fatura_id) REFERENCES cant_fatura_func(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_faturaitem_venda FOREIGN KEY (venda_id) REFERENCES cant_venda(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_fatura_func_pagamento (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	fatura_id BIGINT UNSIGNED NOT NULL,
	data_pagamento DATETIME NOT NULL,
	valor DECIMAL(12,2) NOT NULL,
	metodo VARCHAR(50) NOT NULL, -- 'folha'
	usuario_id BIGINT UNSIGNED NOT NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	CONSTRAINT fk_faturapg_fatura FOREIGN KEY (fatura_id) REFERENCES cant_fatura_func(id) ON DELETE CASCADE ON UPDATE CASCADE,
	CONSTRAINT fk_faturapg_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- RELATÓRIOS / AUDITORIA / LOGS (RF025-RF028, RF027, RF040)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cant_auditoria (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id BIGINT UNSIGNED NULL,
	acao VARCHAR(100) NOT NULL,
	entidade VARCHAR(100) NULL,
	entidade_id BIGINT UNSIGNED NULL,
	dados_antes JSON NULL,
	dados_depois JSON NULL,
	ip VARCHAR(45) NULL,
	user_agent VARCHAR(255) NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_audit_entidade (entidade, entidade_id),
	INDEX idx_audit_usuario (usuario_id, created_at),
	CONSTRAINT fk_audit_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id) ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_log_erro (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	nivel VARCHAR(20) NOT NULL, -- ERROR, WARNING, INFO
	mensagem VARCHAR(255) NOT NULL,
	stack_trace TEXT NULL,
	contexto_json JSON NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_logerro_data (created_at),
	INDEX idx_logerro_nivel (nivel)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exportações podem ser on-the-fly, sem tabela persistente adicional.

-- ------------------------------------------------------------
-- INTEGRAÇÕES APS (RF029, RF030)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cant_staging_aps_responsavel (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	cpf CHAR(11) NOT NULL,
	email VARCHAR(150) NULL,
	telefone VARCHAR(30) NULL,
	recebido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uq_stage_resp_aps (aps_id),
	INDEX idx_stage_resp_cpf (cpf)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_staging_aps_aluno (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	matricula VARCHAR(50) NOT NULL,
	serie VARCHAR(50) NULL,
	turno VARCHAR(30) NULL,
	recebido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uq_stage_aluno_aps (aps_id),
	INDEX idx_stage_aluno_matricula (matricula)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_staging_aps_funcionario (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	aps_id BIGINT UNSIGNED NOT NULL,
	nome VARCHAR(150) NOT NULL,
	cpf CHAR(11) NULL,
	matricula VARCHAR(50) NULL,
	tipo_funcionario VARCHAR(50) NULL,
	recebido_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	UNIQUE KEY uq_stage_func_aps (aps_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PARAMETRIZAÇÕES / JOBS / NOTIFICAÇÕES (RF031-RF037)
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS cant_parametro (
	chave VARCHAR(100) PRIMARY KEY,
	valor VARCHAR(255) NOT NULL,
	descricao VARCHAR(255) NULL,
	escopo VARCHAR(50) NULL,
	updated_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_job_execucao (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	job VARCHAR(100) NOT NULL, -- ex: 'sync_aps_full'
	status ENUM('sucesso','erro','executando') NOT NULL,
	started_at DATETIME NULL,
	ended_at DATETIME NULL,
	mensagem VARCHAR(255) NULL,
	latencia_ms INT NULL, -- RN045
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_jobexec_job (job, started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS cant_notificacao (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	responsavel_id BIGINT UNSIGNED NOT NULL,
	tipo VARCHAR(50) NOT NULL, -- 'saldo_baixo','kit_expira','recarga_confirmada'
	payload_json JSON NULL,
	status_envio ENUM('pendente','enviado','erro') NOT NULL DEFAULT 'pendente',
	tentativas INT NOT NULL DEFAULT 0,
	proxima_tentativa DATETIME NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_notif_resp (responsavel_id),
	INDEX idx_notif_tipo (tipo),
	CONSTRAINT fk_notif_resp FOREIGN KEY (responsavel_id) REFERENCES cant_responsavel(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- BUSCA GLOBAL (RF035) pode ser implementada via índices já criados.
-- PAGINAÇÃO (RF036) tratada em nível de aplicação.
-- SEGURANÇA DE SESSÃO (RF039) tratada em aplicação/framework (CI4 sessions).
-- ------------------------------------------------------------

-- Tabela opcional para tentativas de login detalhadas (RN002 auditoria)
CREATE TABLE IF NOT EXISTS cant_login_tentativa (
	id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
	usuario_id BIGINT UNSIGNED NULL,
	cpf_email_informado VARCHAR(150) NULL,
	sucesso TINYINT(1) NOT NULL,
	ip VARCHAR(45) NULL,
	user_agent VARCHAR(255) NULL,
	created_at TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
	INDEX idx_loginTent_usuario (usuario_id, created_at),
	CONSTRAINT fk_logintent_usuario FOREIGN KEY (usuario_id) REFERENCES cant_usuario(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- SEEDS BÁSICOS (Papéis principais)
-- ------------------------------------------------------------
INSERT INTO cant_papel (codigo, nome, descricao) VALUES
	('caixa','Caixa','Operador de PDV'),
	('supervisor','Supervisor','Acesso a relatórios e cadastros'),
	('gerente','Gerente','Gestão completa exceto técnico'),
	('informatica','Informática','Acesso total técnico'),
	('responsavel','Responsável','Portal do responsável')
ON DUPLICATE KEY UPDATE nome=VALUES(nome), descricao=VALUES(descricao);

-- Parâmetros iniciais (podem ser ajustados) RN044
INSERT INTO cant_parametro (chave, valor, descricao, escopo) VALUES
	('janela_cancelamento_minutos','30','Janela padrão para cancelamento de venda','operacao'),
	('peso_minimo_gramas','1','Peso mínimo permitido para produtos por peso','operacao'),
	('valor_minimo_recarga','5.00','Valor mínimo para recarga de saldo','financeiro'),
	('valor_maximo_recarga_diaria','500.00','Valor máximo de recarga por dia','financeiro'),
	('saldo_baixo_threshold','10.00','Limite para disparo de notificação de saldo baixo','notificacao'),
	('timeout_sessao_minutos','30','Tempo de inatividade para expirar sessão','seguranca'),
	('kpi_cache_minutos','5','Tempo de cache para KPIs','performance')
ON DUPLICATE KEY UPDATE valor=VALUES(valor), descricao=VALUES(descricao);

SET FOREIGN_KEY_CHECKS=1;

-- FIM DO SCRIPT
