-- =============================================================================
-- SISTEMA DE CONTROLE FINANCEIRO - CONTAS A PAGAR E RECEBER
-- =============================================================================
-- Sistema integrado de gestão financeira para cantina escolar
-- Autor: Sistema de Cantina Escolar
-- Data: 24/08/2025
-- Versão: 1.0
--
-- DESCRIÇÃO:
-- Este módulo implementa um sistema completo de controle financeiro para
-- gerenciar contas a pagar e receber da cantina escolar, incluindo:
-- - Fornecedores e clientes
-- - Categorias de receitas e despesas
-- - Contas a pagar e receber
-- - Parcelas e formas de pagamento
-- - Conciliação bancária
-- - Relatórios gerenciais
-- - Controle de fluxo de caixa
--
-- CARACTERÍSTICAS:
-- - Stored procedures para todas as operações
-- - Triggers para automação de processos
-- - Views para consultas otimizadas
-- - Auditoria completa de operações
-- - Integração com sistema de vendas da cantina
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. TABELAS PRINCIPAIS
-- -----------------------------------------------------------------------------

-- Tabela de fornecedores
CREATE TABLE `cant_fornecedores` (
  `id` int NOT NULL AUTO_INCREMENT,
  `razao_social` varchar(255) NOT NULL,
  `nome_fantasia` varchar(255) DEFAULT NULL,
  `cnpj_cpf` varchar(18) NOT NULL,
  `tipo_pessoa` enum('fisica', 'juridica') NOT NULL DEFAULT 'juridica',
  `inscricao_estadual` varchar(20) DEFAULT NULL,
  `inscricao_municipal` varchar(20) DEFAULT NULL,
  `endereco` varchar(255) DEFAULT NULL,
  `numero` varchar(10) DEFAULT NULL,
  `complemento` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` char(2) DEFAULT NULL,
  `cep` varchar(9) DEFAULT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `celular` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `contato_responsavel` varchar(255) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cant_fornecedores_cnpj_cpf` (`cnpj_cpf`),
  KEY `idx_cant_fornecedores_razao_social` (`razao_social`),
  KEY `idx_cant_fornecedores_nome_fantasia` (`nome_fantasia`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Cadastro de fornecedores da cantina';

-- Tabela de categorias financeiras
CREATE TABLE `cant_categorias_financeiras` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `tipo` enum('receita', 'despesa') NOT NULL,
  `categoria_pai_id` int DEFAULT NULL COMMENT 'Para subcategorias',
  `codigo_contabil` varchar(20) DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_categorias_nome` (`nome`),
  KEY `idx_cant_categorias_tipo` (`tipo`),
  KEY `idx_cant_categorias_pai` (`categoria_pai_id`),
  CONSTRAINT `fk_cant_categorias_pai` FOREIGN KEY (`categoria_pai_id`) REFERENCES `cant_categorias_financeiras` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Categorias para classificação de receitas e despesas';

-- Tabela de formas de pagamento
CREATE TABLE `cant_formas_pagamento` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `descricao` text DEFAULT NULL,
  `tipo` enum('dinheiro', 'cartao_credito', 'cartao_debito', 'pix', 'transferencia', 'boleto', 'cheque', 'outros') NOT NULL,
  `taxa_percentual` decimal(5,2) DEFAULT 0.00 COMMENT 'Taxa cobrada em %',
  `taxa_fixa` decimal(10,2) DEFAULT 0.00 COMMENT 'Taxa fixa cobrada',
  `prazo_compensacao_dias` int DEFAULT 0 COMMENT 'Dias para compensação',
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_formas_pagamento_nome` (`nome`),
  KEY `idx_cant_formas_pagamento_tipo` (`tipo`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Formas de pagamento disponíveis';

-- Tabela de contas bancárias
CREATE TABLE `cant_contas_bancarias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `banco` varchar(100) NOT NULL,
  `agencia` varchar(10) NOT NULL,
  `conta` varchar(20) NOT NULL,
  `tipo_conta` enum('corrente', 'poupanca', 'aplicacao') NOT NULL DEFAULT 'corrente',
  `saldo_inicial` decimal(15,2) NOT NULL DEFAULT 0.00,
  `saldo_atual` decimal(15,2) NOT NULL DEFAULT 0.00,
  `data_saldo_inicial` date NOT NULL,
  `gerente` varchar(255) DEFAULT NULL,
  `telefone_banco` varchar(20) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `ativo` tinyint(1) NOT NULL DEFAULT 1,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_cant_contas_bancarias_unique` (`banco`, `agencia`, `conta`),
  KEY `idx_cant_contas_bancarias_nome` (`nome`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contas bancárias da cantina';

-- Tabela principal de contas a pagar
CREATE TABLE `cant_contas_pagar` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_documento` varchar(50) DEFAULT NULL,
  `fornecedor_id` int NOT NULL,
  `categoria_id` int NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `valor_total` decimal(15,2) NOT NULL,
  `data_emissao` date NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_pagamento` date DEFAULT NULL,
  `valor_pago` decimal(15,2) DEFAULT 0.00,
  `valor_desconto` decimal(15,2) DEFAULT 0.00,
  `valor_juros` decimal(15,2) DEFAULT 0.00,
  `valor_multa` decimal(15,2) DEFAULT 0.00,
  `status` enum('pendente', 'pago', 'vencido', 'cancelado') NOT NULL DEFAULT 'pendente',
  `forma_pagamento_id` int DEFAULT NULL,
  `conta_bancaria_id` int DEFAULT NULL,
  `numero_parcelas` int DEFAULT 1,
  `parcela_atual` int DEFAULT 1,
  `conta_pai_id` int DEFAULT NULL COMMENT 'Para ligação entre parcelas',
  `observacoes` text DEFAULT NULL,
  `funcionario_responsavel_id` int DEFAULT NULL,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_contas_pagar_fornecedor` (`fornecedor_id`),
  KEY `idx_cant_contas_pagar_categoria` (`categoria_id`),
  KEY `idx_cant_contas_pagar_vencimento` (`data_vencimento`),
  KEY `idx_cant_contas_pagar_status` (`status`),
  KEY `idx_cant_contas_pagar_documento` (`numero_documento`),
  KEY `idx_cant_contas_pagar_pai` (`conta_pai_id`),
  CONSTRAINT `fk_cant_contas_pagar_fornecedor` FOREIGN KEY (`fornecedor_id`) REFERENCES `cant_fornecedores` (`id`),
  CONSTRAINT `fk_cant_contas_pagar_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `cant_categorias_financeiras` (`id`),
  CONSTRAINT `fk_cant_contas_pagar_forma_pagamento` FOREIGN KEY (`forma_pagamento_id`) REFERENCES `cant_formas_pagamento` (`id`),
  CONSTRAINT `fk_cant_contas_pagar_conta_bancaria` FOREIGN KEY (`conta_bancaria_id`) REFERENCES `cant_contas_bancarias` (`id`),
  CONSTRAINT `fk_cant_contas_pagar_pai` FOREIGN KEY (`conta_pai_id`) REFERENCES `cant_contas_pagar` (`id`),
  CONSTRAINT `fk_cant_contas_pagar_funcionario` FOREIGN KEY (`funcionario_responsavel_id`) REFERENCES `cant_funcionarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contas a pagar da cantina';

-- Tabela principal de contas a receber
CREATE TABLE `cant_contas_receber` (
  `id` int NOT NULL AUTO_INCREMENT,
  `numero_documento` varchar(50) DEFAULT NULL,
  `tipo_cliente` enum('aluno', 'funcionario', 'outros') NOT NULL,
  `ra_aluno` int DEFAULT NULL,
  `codigo_funcionario` int DEFAULT NULL,
  `nome_cliente` varchar(255) DEFAULT NULL COMMENT 'Para clientes diversos',
  `categoria_id` int NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `valor_total` decimal(15,2) NOT NULL,
  `data_emissao` date NOT NULL,
  `data_vencimento` date NOT NULL,
  `data_recebimento` date DEFAULT NULL,
  `valor_recebido` decimal(15,2) DEFAULT 0.00,
  `valor_desconto` decimal(15,2) DEFAULT 0.00,
  `valor_juros` decimal(15,2) DEFAULT 0.00,
  `valor_multa` decimal(15,2) DEFAULT 0.00,
  `status` enum('pendente', 'recebido', 'vencido', 'cancelado') NOT NULL DEFAULT 'pendente',
  `forma_pagamento_id` int DEFAULT NULL,
  `conta_bancaria_id` int DEFAULT NULL,
  `numero_parcelas` int DEFAULT 1,
  `parcela_atual` int DEFAULT 1,
  `conta_pai_id` int DEFAULT NULL COMMENT 'Para ligação entre parcelas',
  `venda_id` int DEFAULT NULL COMMENT 'Ligação com venda da cantina',
  `observacoes` text DEFAULT NULL,
  `funcionario_responsavel_id` int DEFAULT NULL,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `data_atualizacao` timestamp DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_contas_receber_cliente_tipo` (`tipo_cliente`),
  KEY `idx_cant_contas_receber_ra_aluno` (`ra_aluno`),
  KEY `idx_cant_contas_receber_codigo_funcionario` (`codigo_funcionario`),
  KEY `idx_cant_contas_receber_categoria` (`categoria_id`),
  KEY `idx_cant_contas_receber_vencimento` (`data_vencimento`),
  KEY `idx_cant_contas_receber_status` (`status`),
  KEY `idx_cant_contas_receber_documento` (`numero_documento`),
  KEY `idx_cant_contas_receber_pai` (`conta_pai_id`),
  KEY `idx_cant_contas_receber_venda` (`venda_id`),
  CONSTRAINT `fk_cant_contas_receber_ra_aluno` FOREIGN KEY (`ra_aluno`) REFERENCES `cadastro_alunos` (`ra`),
  CONSTRAINT `fk_cant_contas_receber_codigo_funcionario` FOREIGN KEY (`codigo_funcionario`) REFERENCES `funcionarios` (`codigo`),
  CONSTRAINT `fk_cant_contas_receber_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `cant_categorias_financeiras` (`id`),
  CONSTRAINT `fk_cant_contas_receber_forma_pagamento` FOREIGN KEY (`forma_pagamento_id`) REFERENCES `cant_formas_pagamento` (`id`),
  CONSTRAINT `fk_cant_contas_receber_conta_bancaria` FOREIGN KEY (`conta_bancaria_id`) REFERENCES `cant_contas_bancarias` (`id`),
  CONSTRAINT `fk_cant_contas_receber_pai` FOREIGN KEY (`conta_pai_id`) REFERENCES `cant_contas_receber` (`id`),
  CONSTRAINT `fk_cant_contas_receber_venda` FOREIGN KEY (`venda_id`) REFERENCES `cant_vendas` (`id`),
  CONSTRAINT `fk_cant_contas_receber_funcionario` FOREIGN KEY (`funcionario_responsavel_id`) REFERENCES `cant_funcionarios` (`id`),
  CONSTRAINT `chk_cant_contas_receber_cliente` CHECK (
    (`tipo_cliente` = 'aluno' AND `ra_aluno` IS NOT NULL AND `codigo_funcionario` IS NULL AND `nome_cliente` IS NULL) OR
    (`tipo_cliente` = 'funcionario' AND `codigo_funcionario` IS NOT NULL AND `ra_aluno` IS NULL AND `nome_cliente` IS NULL) OR
    (`tipo_cliente` = 'outros' AND `nome_cliente` IS NOT NULL AND `ra_aluno` IS NULL AND `codigo_funcionario` IS NULL)
  )
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Contas a receber da cantina';

-- Tabela de movimentações bancárias
CREATE TABLE `cant_movimentacoes_bancarias` (
  `id` int NOT NULL AUTO_INCREMENT,
  `conta_bancaria_id` int NOT NULL,
  `tipo_movimentacao` enum('credito', 'debito') NOT NULL,
  `valor` decimal(15,2) NOT NULL,
  `data_movimentacao` date NOT NULL,
  `descricao` varchar(255) NOT NULL,
  `numero_documento` varchar(50) DEFAULT NULL,
  `categoria_id` int DEFAULT NULL,
  `conta_pagar_id` int DEFAULT NULL,
  `conta_receber_id` int DEFAULT NULL,
  `saldo_anterior` decimal(15,2) NOT NULL,
  `saldo_atual` decimal(15,2) NOT NULL,
  `conciliado` tinyint(1) NOT NULL DEFAULT 0,
  `data_conciliacao` date DEFAULT NULL,
  `funcionario_responsavel_id` int DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `data_criacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_cant_movimentacoes_conta` (`conta_bancaria_id`),
  KEY `idx_cant_movimentacoes_data` (`data_movimentacao`),
  KEY `idx_cant_movimentacoes_tipo` (`tipo_movimentacao`),
  KEY `idx_cant_movimentacoes_documento` (`numero_documento`),
  KEY `idx_cant_movimentacoes_categoria` (`categoria_id`),
  KEY `idx_cant_movimentacoes_conta_pagar` (`conta_pagar_id`),
  KEY `idx_cant_movimentacoes_conta_receber` (`conta_receber_id`),
  CONSTRAINT `fk_cant_movimentacoes_conta_bancaria` FOREIGN KEY (`conta_bancaria_id`) REFERENCES `cant_contas_bancarias` (`id`),
  CONSTRAINT `fk_cant_movimentacoes_categoria` FOREIGN KEY (`categoria_id`) REFERENCES `cant_categorias_financeiras` (`id`),
  CONSTRAINT `fk_cant_movimentacoes_conta_pagar` FOREIGN KEY (`conta_pagar_id`) REFERENCES `cant_contas_pagar` (`id`),
  CONSTRAINT `fk_cant_movimentacoes_conta_receber` FOREIGN KEY (`conta_receber_id`) REFERENCES `cant_contas_receber` (`id`),
  CONSTRAINT `fk_cant_movimentacoes_funcionario` FOREIGN KEY (`funcionario_responsavel_id`) REFERENCES `cant_funcionarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Movimentações das contas bancárias';

-- Tabela de auditoria financeira
CREATE TABLE `cant_auditoria_financeira` (
  `id` int NOT NULL AUTO_INCREMENT,
  `tabela` varchar(50) NOT NULL,
  `registro_id` int NOT NULL,
  `operacao` enum('INSERT', 'UPDATE', 'DELETE') NOT NULL,
  `dados_anteriores` json DEFAULT NULL,
  `dados_novos` json DEFAULT NULL,
  `funcionario_id` int DEFAULT NULL,
  `data_operacao` timestamp DEFAULT CURRENT_TIMESTAMP,
  `ip_usuario` varchar(45) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `idx_cant_auditoria_tabela` (`tabela`),
  KEY `idx_cant_auditoria_registro` (`registro_id`),
  KEY `idx_cant_auditoria_data` (`data_operacao`),
  KEY `idx_cant_auditoria_funcionario` (`funcionario_id`),
  CONSTRAINT `fk_cant_auditoria_funcionario` FOREIGN KEY (`funcionario_id`) REFERENCES `cant_funcionarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Auditoria de operações financeiras';

-- -----------------------------------------------------------------------------
-- 2. VIEWS PARA CONSULTAS OTIMIZADAS
-- -----------------------------------------------------------------------------

-- View de contas a pagar em aberto
CREATE VIEW `cant_view_contas_pagar_abertas` AS
SELECT
    cp.id,
    cp.numero_documento,
    f.razao_social as fornecedor,
    f.nome_fantasia,
    cat.nome as categoria,
    cp.descricao,
    cp.valor_total,
    cp.data_emissao,
    cp.data_vencimento,
    cp.status,
    DATEDIFF(CURDATE(), cp.data_vencimento) as dias_atraso,
    CASE
        WHEN cp.data_vencimento < CURDATE() THEN 'VENCIDA'
        WHEN DATEDIFF(cp.data_vencimento, CURDATE()) <= 7 THEN 'A VENCER'
        ELSE 'NO PRAZO'
    END as situacao,
    cp.observacoes
FROM cant_contas_pagar cp
INNER JOIN cant_fornecedores f ON cp.fornecedor_id = f.id
INNER JOIN cant_categorias_financeiras cat ON cp.categoria_id = cat.id
WHERE cp.status IN ('pendente', 'vencido')
ORDER BY cp.data_vencimento ASC;

-- View de contas a receber em aberto
CREATE VIEW `cant_view_contas_receber_abertas` AS
SELECT
    cr.id,
    cr.numero_documento,
    CASE
        WHEN cr.tipo_cliente = 'aluno' THEN a.nome
        WHEN cr.tipo_cliente = 'funcionario' THEN func.nome
        ELSE cr.nome_cliente
    END as cliente,
    cr.tipo_cliente,
    cat.nome as categoria,
    cr.descricao,
    cr.valor_total,
    cr.data_emissao,
    cr.data_vencimento,
    cr.status,
    DATEDIFF(CURDATE(), cr.data_vencimento) as dias_atraso,
    CASE
        WHEN cr.data_vencimento < CURDATE() THEN 'VENCIDA'
        WHEN DATEDIFF(cr.data_vencimento, CURDATE()) <= 7 THEN 'A VENCER'
        ELSE 'NO PRAZO'
    END as situacao,
    cr.observacoes
FROM cant_contas_receber cr
INNER JOIN cant_categorias_financeiras cat ON cr.categoria_id = cat.id
LEFT JOIN cadastro_alunos a ON cr.ra_aluno = a.ra
LEFT JOIN funcionarios func ON cr.codigo_funcionario = func.codigo
WHERE cr.status IN ('pendente', 'vencido')
ORDER BY cr.data_vencimento ASC;

-- View de fluxo de caixa diário
CREATE VIEW `cant_view_fluxo_caixa_diario` AS
SELECT
    data_movimentacao,
    SUM(CASE WHEN tipo_movimentacao = 'credito' THEN valor ELSE 0 END) as total_entradas,
    SUM(CASE WHEN tipo_movimentacao = 'debito' THEN valor ELSE 0 END) as total_saidas,
    SUM(CASE WHEN tipo_movimentacao = 'credito' THEN valor ELSE -valor END) as saldo_dia
FROM cant_movimentacoes_bancarias
GROUP BY data_movimentacao
ORDER BY data_movimentacao DESC;

-- View de resumo por categoria
CREATE VIEW `cant_view_resumo_categorias` AS
SELECT
    cat.id,
    cat.nome,
    cat.tipo,
    COALESCE(SUM(CASE WHEN cat.tipo = 'despesa' THEN cp.valor_total ELSE 0 END), 0) as total_pagar,
    COALESCE(SUM(CASE WHEN cat.tipo = 'receita' THEN cr.valor_total ELSE 0 END), 0) as total_receber,
    COALESCE(SUM(CASE WHEN cat.tipo = 'despesa' THEN cp.valor_pago ELSE 0 END), 0) as total_pago,
    COALESCE(SUM(CASE WHEN cat.tipo = 'receita' THEN cr.valor_recebido ELSE 0 END), 0) as total_recebido
FROM cant_categorias_financeiras cat
LEFT JOIN cant_contas_pagar cp ON cat.id = cp.categoria_id AND cat.tipo = 'despesa'
LEFT JOIN cant_contas_receber cr ON cat.id = cr.categoria_id AND cat.tipo = 'receita'
WHERE cat.ativo = 1
GROUP BY cat.id, cat.nome, cat.tipo
ORDER BY cat.tipo, cat.nome;

-- View de saldos bancários
CREATE VIEW `cant_view_saldos_bancarios` AS
SELECT
    cb.id,
    cb.nome,
    cb.banco,
    cb.agencia,
    cb.conta,
    cb.tipo_conta,
    cb.saldo_atual,
    COUNT(mb.id) as total_movimentacoes,
    MAX(mb.data_movimentacao) as ultima_movimentacao
FROM cant_contas_bancarias cb
LEFT JOIN cant_movimentacoes_bancarias mb ON cb.id = mb.conta_bancaria_id
WHERE cb.ativo = 1
GROUP BY cb.id, cb.nome, cb.banco, cb.agencia, cb.conta, cb.tipo_conta, cb.saldo_atual
ORDER BY cb.nome;

-- -----------------------------------------------------------------------------
-- 3. STORED PROCEDURES
-- -----------------------------------------------------------------------------

-- Procedure para criar conta a pagar
DELIMITER $$
CREATE PROCEDURE `sp_cant_criar_conta_pagar`(
    IN p_numero_documento VARCHAR(50),
    IN p_fornecedor_id INT,
    IN p_categoria_id INT,
    IN p_descricao VARCHAR(255),
    IN p_valor_total DECIMAL(15,2),
    IN p_data_emissao DATE,
    IN p_data_vencimento DATE,
    IN p_numero_parcelas INT,
    IN p_funcionario_id INT,
    IN p_observacoes TEXT,
    OUT p_conta_id INT,
    OUT p_mensagem VARCHAR(255)
)
BEGIN
    DECLARE v_erro_count INT DEFAULT 0;
    DECLARE v_conta_pai_id INT DEFAULT NULL;
    DECLARE v_contador INT DEFAULT 1;
    DECLARE v_valor_parcela DECIMAL(15,2);
    DECLARE v_data_venc_parcela DATE;

    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_mensagem = MESSAGE_TEXT;
        ROLLBACK;
        SET p_conta_id = 0;
    END;

    START TRANSACTION;

    -- Validações
    IF p_numero_parcelas <= 0 THEN
        SET p_mensagem = 'Número de parcelas deve ser maior que zero';
        SET p_conta_id = 0;
        ROLLBACK;
        LEAVE sp_label;
    END IF;

    IF p_valor_total <= 0 THEN
        SET p_mensagem = 'Valor total deve ser maior que zero';
        SET p_conta_id = 0;
        ROLLBACK;
        LEAVE sp_label;
    END IF;

    SET v_valor_parcela = p_valor_total / p_numero_parcelas;

    sp_label: BEGIN
        -- Criar parcelas
        WHILE v_contador <= p_numero_parcelas DO
            SET v_data_venc_parcela = DATE_ADD(p_data_vencimento, INTERVAL (v_contador - 1) MONTH);

            INSERT INTO cant_contas_pagar (
                numero_documento,
                fornecedor_id,
                categoria_id,
                descricao,
                valor_total,
                data_emissao,
                data_vencimento,
                numero_parcelas,
                parcela_atual,
                conta_pai_id,
                funcionario_responsavel_id,
                observacoes
            ) VALUES (
                CONCAT(p_numero_documento, IF(p_numero_parcelas > 1, CONCAT('/', v_contador), '')),
                p_fornecedor_id,
                p_categoria_id,
                CONCAT(p_descricao, IF(p_numero_parcelas > 1, CONCAT(' - Parcela ', v_contador, '/', p_numero_parcelas), '')),
                v_valor_parcela,
                p_data_emissao,
                v_data_venc_parcela,
                p_numero_parcelas,
                v_contador,
                v_conta_pai_id,
                p_funcionario_id,
                p_observacoes
            );

            -- Primeira parcela é a conta pai
            IF v_contador = 1 THEN
                SET v_conta_pai_id = LAST_INSERT_ID();
                SET p_conta_id = v_conta_pai_id;
            END IF;

            SET v_contador = v_contador + 1;
        END WHILE;

        SET p_mensagem = CONCAT('Conta a pagar criada com sucesso. ', p_numero_parcelas, ' parcela(s) gerada(s)');
        COMMIT;
    END;
END$$
DELIMITER ;

-- Procedure para pagar conta
DELIMITER $$
CREATE PROCEDURE `sp_cant_pagar_conta`(
    IN p_conta_pagar_id INT,
    IN p_valor_pago DECIMAL(15,2),
    IN p_data_pagamento DATE,
    IN p_forma_pagamento_id INT,
    IN p_conta_bancaria_id INT,
    IN p_valor_desconto DECIMAL(15,2),
    IN p_valor_juros DECIMAL(15,2),
    IN p_valor_multa DECIMAL(15,2),
    IN p_funcionario_id INT,
    IN p_observacoes TEXT,
    OUT p_sucesso BOOLEAN,
    OUT p_mensagem VARCHAR(255)
)
BEGIN
    DECLARE v_valor_total DECIMAL(15,2);
    DECLARE v_saldo_conta DECIMAL(15,2);
    DECLARE v_novo_saldo DECIMAL(15,2);
    DECLARE v_valor_final DECIMAL(15,2);

    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_mensagem = MESSAGE_TEXT;
        SET p_sucesso = FALSE;
        ROLLBACK;
    END;

    START TRANSACTION;

    -- Buscar dados da conta
    SELECT valor_total INTO v_valor_total
    FROM cant_contas_pagar
    WHERE id = p_conta_pagar_id AND status = 'pendente';

    IF v_valor_total IS NULL THEN
        SET p_mensagem = 'Conta não encontrada ou já foi paga';
        SET p_sucesso = FALSE;
        ROLLBACK;
        LEAVE sp_label;
    END IF;

    -- Calcular valor final
    SET v_valor_final = p_valor_pago + p_valor_desconto - p_valor_juros - p_valor_multa;

    -- Buscar saldo da conta bancária
    SELECT saldo_atual INTO v_saldo_conta
    FROM cant_contas_bancarias
    WHERE id = p_conta_bancaria_id;

    IF v_saldo_conta < p_valor_pago THEN
        SET p_mensagem = 'Saldo insuficiente na conta bancária';
        SET p_sucesso = FALSE;
        ROLLBACK;
        LEAVE sp_label;
    END IF;

    sp_label: BEGIN
        -- Atualizar conta a pagar
        UPDATE cant_contas_pagar SET
            data_pagamento = p_data_pagamento,
            valor_pago = p_valor_pago,
            valor_desconto = p_valor_desconto,
            valor_juros = p_valor_juros,
            valor_multa = p_valor_multa,
            status = 'pago',
            forma_pagamento_id = p_forma_pagamento_id,
            conta_bancaria_id = p_conta_bancaria_id,
            funcionario_responsavel_id = p_funcionario_id,
            observacoes = CONCAT(COALESCE(observacoes, ''), ' | ', COALESCE(p_observacoes, ''))
        WHERE id = p_conta_pagar_id;

        -- Atualizar saldo da conta bancária
        SET v_novo_saldo = v_saldo_conta - p_valor_pago;

        UPDATE cant_contas_bancarias SET
            saldo_atual = v_novo_saldo
        WHERE id = p_conta_bancaria_id;

        -- Registrar movimentação bancária
        INSERT INTO cant_movimentacoes_bancarias (
            conta_bancaria_id,
            tipo_movimentacao,
            valor,
            data_movimentacao,
            descricao,
            categoria_id,
            conta_pagar_id,
            saldo_anterior,
            saldo_atual,
            funcionario_responsavel_id,
            observacoes
        ) SELECT
            p_conta_bancaria_id,
            'debito',
            p_valor_pago,
            p_data_pagamento,
            CONCAT('Pagamento conta: ', cp.descricao),
            cp.categoria_id,
            p_conta_pagar_id,
            v_saldo_conta,
            v_novo_saldo,
            p_funcionario_id,
            p_observacoes
        FROM cant_contas_pagar cp
        WHERE cp.id = p_conta_pagar_id;

        SET p_mensagem = 'Pagamento realizado com sucesso';
        SET p_sucesso = TRUE;
        COMMIT;
    END;
END$$
DELIMITER ;

-- Procedure para criar conta a receber
DELIMITER $$
CREATE PROCEDURE `sp_cant_criar_conta_receber`(
    IN p_numero_documento VARCHAR(50),
    IN p_tipo_cliente ENUM('aluno', 'funcionario', 'outros'),
    IN p_ra_aluno INT,
    IN p_codigo_funcionario INT,
    IN p_nome_cliente VARCHAR(255),
    IN p_categoria_id INT,
    IN p_descricao VARCHAR(255),
    IN p_valor_total DECIMAL(15,2),
    IN p_data_emissao DATE,
    IN p_data_vencimento DATE,
    IN p_numero_parcelas INT,
    IN p_venda_id INT,
    IN p_funcionario_id INT,
    IN p_observacoes TEXT,
    OUT p_conta_id INT,
    OUT p_mensagem VARCHAR(255)
)
BEGIN
    DECLARE v_conta_pai_id INT DEFAULT NULL;
    DECLARE v_contador INT DEFAULT 1;
    DECLARE v_valor_parcela DECIMAL(15,2);
    DECLARE v_data_venc_parcela DATE;

    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_mensagem = MESSAGE_TEXT;
        ROLLBACK;
        SET p_conta_id = 0;
    END;

    START TRANSACTION;

    -- Validações
    IF p_numero_parcelas <= 0 THEN
        SET p_mensagem = 'Número de parcelas deve ser maior que zero';
        SET p_conta_id = 0;
        ROLLBACK;
        LEAVE sp_label;
    END IF;

    SET v_valor_parcela = p_valor_total / p_numero_parcelas;

    sp_label: BEGIN
        -- Criar parcelas
        WHILE v_contador <= p_numero_parcelas DO
            SET v_data_venc_parcela = DATE_ADD(p_data_vencimento, INTERVAL (v_contador - 1) MONTH);

            INSERT INTO cant_contas_receber (
                numero_documento,
                tipo_cliente,
                ra_aluno,
                codigo_funcionario,
                nome_cliente,
                categoria_id,
                descricao,
                valor_total,
                data_emissao,
                data_vencimento,
                numero_parcelas,
                parcela_atual,
                conta_pai_id,
                venda_id,
                funcionario_responsavel_id,
                observacoes
            ) VALUES (
                CONCAT(p_numero_documento, IF(p_numero_parcelas > 1, CONCAT('/', v_contador), '')),
                p_tipo_cliente,
                p_ra_aluno,
                p_codigo_funcionario,
                p_nome_cliente,
                p_categoria_id,
                CONCAT(p_descricao, IF(p_numero_parcelas > 1, CONCAT(' - Parcela ', v_contador, '/', p_numero_parcelas), '')),
                v_valor_parcela,
                p_data_emissao,
                v_data_venc_parcela,
                p_numero_parcelas,
                v_contador,
                v_conta_pai_id,
                p_venda_id,
                p_funcionario_id,
                p_observacoes
            );

            -- Primeira parcela é a conta pai
            IF v_contador = 1 THEN
                SET v_conta_pai_id = LAST_INSERT_ID();
                SET p_conta_id = v_conta_pai_id;
            END IF;

            SET v_contador = v_contador + 1;
        END WHILE;

        SET p_mensagem = CONCAT('Conta a receber criada com sucesso. ', p_numero_parcelas, ' parcela(s) gerada(s)');
        COMMIT;
    END;
END$$
DELIMITER ;

-- Procedure para receber conta
DELIMITER $$
CREATE PROCEDURE `sp_cant_receber_conta`(
    IN p_conta_receber_id INT,
    IN p_valor_recebido DECIMAL(15,2),
    IN p_data_recebimento DATE,
    IN p_forma_pagamento_id INT,
    IN p_conta_bancaria_id INT,
    IN p_valor_desconto DECIMAL(15,2),
    IN p_valor_juros DECIMAL(15,2),
    IN p_valor_multa DECIMAL(15,2),
    IN p_funcionario_id INT,
    IN p_observacoes TEXT,
    OUT p_sucesso BOOLEAN,
    OUT p_mensagem VARCHAR(255)
)
BEGIN
    DECLARE v_valor_total DECIMAL(15,2);
    DECLARE v_saldo_conta DECIMAL(15,2);
    DECLARE v_novo_saldo DECIMAL(15,2);

    DECLARE CONTINUE HANDLER FOR SQLEXCEPTION
    BEGIN
        GET DIAGNOSTICS CONDITION 1
            p_mensagem = MESSAGE_TEXT;
        SET p_sucesso = FALSE;
        ROLLBACK;
    END;

    START TRANSACTION;

    -- Buscar dados da conta
    SELECT valor_total INTO v_valor_total
    FROM cant_contas_receber
    WHERE id = p_conta_receber_id AND status = 'pendente';

    IF v_valor_total IS NULL THEN
        SET p_mensagem = 'Conta não encontrada ou já foi recebida';
        SET p_sucesso = FALSE;
        ROLLBACK;
        LEAVE sp_label;
    END IF;

    -- Buscar saldo da conta bancária
    SELECT saldo_atual INTO v_saldo_conta
    FROM cant_contas_bancarias
    WHERE id = p_conta_bancaria_id;

    sp_label: BEGIN
        -- Atualizar conta a receber
        UPDATE cant_contas_receber SET
            data_recebimento = p_data_recebimento,
            valor_recebido = p_valor_recebido,
            valor_desconto = p_valor_desconto,
            valor_juros = p_valor_juros,
            valor_multa = p_valor_multa,
            status = 'recebido',
            forma_pagamento_id = p_forma_pagamento_id,
            conta_bancaria_id = p_conta_bancaria_id,
            funcionario_responsavel_id = p_funcionario_id,
            observacoes = CONCAT(COALESCE(observacoes, ''), ' | ', COALESCE(p_observacoes, ''))
        WHERE id = p_conta_receber_id;

        -- Atualizar saldo da conta bancária
        SET v_novo_saldo = v_saldo_conta + p_valor_recebido;

        UPDATE cant_contas_bancarias SET
            saldo_atual = v_novo_saldo
        WHERE id = p_conta_bancaria_id;

        -- Registrar movimentação bancária
        INSERT INTO cant_movimentacoes_bancarias (
            conta_bancaria_id,
            tipo_movimentacao,
            valor,
            data_movimentacao,
            descricao,
            categoria_id,
            conta_receber_id,
            saldo_anterior,
            saldo_atual,
            funcionario_responsavel_id,
            observacoes
        ) SELECT
            p_conta_bancaria_id,
            'credito',
            p_valor_recebido,
            p_data_recebimento,
            CONCAT('Recebimento conta: ', cr.descricao),
            cr.categoria_id,
            p_conta_receber_id,
            v_saldo_conta,
            v_novo_saldo,
            p_funcionario_id,
            p_observacoes
        FROM cant_contas_receber cr
        WHERE cr.id = p_conta_receber_id;

        SET p_mensagem = 'Recebimento realizado com sucesso';
        SET p_sucesso = TRUE;
        COMMIT;
    END;
END$$
DELIMITER ;

-- Procedure para gerar relatório de fluxo de caixa
DELIMITER $$
CREATE PROCEDURE `sp_cant_relatorio_fluxo_caixa`(
    IN p_data_inicio DATE,
    IN p_data_fim DATE,
    IN p_conta_bancaria_id INT
)
BEGIN
    SELECT
        mb.data_movimentacao,
        mb.descricao,
        mb.numero_documento,
        cat.nome as categoria,
        mb.tipo_movimentacao,
        mb.valor,
        mb.saldo_anterior,
        mb.saldo_atual,
        cb.nome as conta_bancaria
    FROM cant_movimentacoes_bancarias mb
    INNER JOIN cant_contas_bancarias cb ON mb.conta_bancaria_id = cb.id
    LEFT JOIN cant_categorias_financeiras cat ON mb.categoria_id = cat.id
    WHERE mb.data_movimentacao BETWEEN p_data_inicio AND p_data_fim
      AND (p_conta_bancaria_id IS NULL OR mb.conta_bancaria_id = p_conta_bancaria_id)
    ORDER BY mb.data_movimentacao DESC, mb.id DESC;
END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 4. TRIGGERS PARA AUTOMAÇÃO
-- -----------------------------------------------------------------------------

-- Trigger para atualizar status de contas vencidas
DELIMITER $$
CREATE TRIGGER `tr_cant_contas_pagar_status_vencido`
BEFORE UPDATE ON `cant_contas_pagar`
FOR EACH ROW
BEGIN
    IF NEW.data_vencimento < CURDATE() AND NEW.status = 'pendente' THEN
        SET NEW.status = 'vencido';
    END IF;
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `tr_cant_contas_receber_status_vencido`
BEFORE UPDATE ON `cant_contas_receber`
FOR EACH ROW
BEGIN
    IF NEW.data_vencimento < CURDATE() AND NEW.status = 'pendente' THEN
        SET NEW.status = 'vencido';
    END IF;
END$$
DELIMITER ;

-- Trigger de auditoria para contas a pagar
DELIMITER $$
CREATE TRIGGER `tr_cant_auditoria_contas_pagar_insert`
AFTER INSERT ON `cant_contas_pagar`
FOR EACH ROW
BEGIN
    INSERT INTO cant_auditoria_financeira (
        tabela, registro_id, operacao, dados_novos, funcionario_id
    ) VALUES (
        'cant_contas_pagar',
        NEW.id,
        'INSERT',
        JSON_OBJECT(
            'fornecedor_id', NEW.fornecedor_id,
            'categoria_id', NEW.categoria_id,
            'valor_total', NEW.valor_total,
            'data_vencimento', NEW.data_vencimento,
            'status', NEW.status
        ),
        NEW.funcionario_responsavel_id
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `tr_cant_auditoria_contas_pagar_update`
AFTER UPDATE ON `cant_contas_pagar`
FOR EACH ROW
BEGIN
    INSERT INTO cant_auditoria_financeira (
        tabela, registro_id, operacao, dados_anteriores, dados_novos, funcionario_id
    ) VALUES (
        'cant_contas_pagar',
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'status', OLD.status,
            'valor_pago', OLD.valor_pago,
            'data_pagamento', OLD.data_pagamento
        ),
        JSON_OBJECT(
            'status', NEW.status,
            'valor_pago', NEW.valor_pago,
            'data_pagamento', NEW.data_pagamento
        ),
        NEW.funcionario_responsavel_id
    );
END$$
DELIMITER ;

-- Trigger de auditoria para contas a receber
DELIMITER $$
CREATE TRIGGER `tr_cant_auditoria_contas_receber_insert`
AFTER INSERT ON `cant_contas_receber`
FOR EACH ROW
BEGIN
    INSERT INTO cant_auditoria_financeira (
        tabela, registro_id, operacao, dados_novos, funcionario_id
    ) VALUES (
        'cant_contas_receber',
        NEW.id,
        'INSERT',
        JSON_OBJECT(
            'tipo_cliente', NEW.tipo_cliente,
            'categoria_id', NEW.categoria_id,
            'valor_total', NEW.valor_total,
            'data_vencimento', NEW.data_vencimento,
            'status', NEW.status
        ),
        NEW.funcionario_responsavel_id
    );
END$$
DELIMITER ;

DELIMITER $$
CREATE TRIGGER `tr_cant_auditoria_contas_receber_update`
AFTER UPDATE ON `cant_contas_receber`
FOR EACH ROW
BEGIN
    INSERT INTO cant_auditoria_financeira (
        tabela, registro_id, operacao, dados_anteriores, dados_novos, funcionario_id
    ) VALUES (
        'cant_contas_receber',
        NEW.id,
        'UPDATE',
        JSON_OBJECT(
            'status', OLD.status,
            'valor_recebido', OLD.valor_recebido,
            'data_recebimento', OLD.data_recebimento
        ),
        JSON_OBJECT(
            'status', NEW.status,
            'valor_recebido', NEW.valor_recebido,
            'data_recebimento', NEW.data_recebimento
        ),
        NEW.funcionario_responsavel_id
    );
END$$
DELIMITER ;

-- -----------------------------------------------------------------------------
-- 5. DADOS INICIAIS
-- -----------------------------------------------------------------------------

-- Categorias financeiras padrão
INSERT INTO `cant_categorias_financeiras` (`nome`, `descricao`, `tipo`) VALUES
-- Receitas
('Vendas da Cantina', 'Receitas das vendas de produtos', 'receita'),
('Recargas de Alunos', 'Recargas de crédito nas contas dos alunos', 'receita'),
('Venda de Pacotes', 'Venda de pacotes de alimentação', 'receita'),
('Receitas Diversas', 'Outras receitas da cantina', 'receita'),

-- Despesas
('Compra de Produtos', 'Compras de produtos para revenda', 'despesa'),
('Salários e Encargos', 'Pagamento de funcionários e encargos', 'despesa'),
('Aluguel e Condomínio', 'Gastos com locação e condomínio', 'despesa'),
('Energia Elétrica', 'Conta de energia elétrica', 'despesa'),
('Água e Esgoto', 'Conta de água e esgoto', 'despesa'),
('Telefone e Internet', 'Gastos com telecomunicações', 'despesa'),
('Material de Limpeza', 'Produtos de limpeza e higiene', 'despesa'),
('Manutenção e Reparos', 'Gastos com manutenção de equipamentos', 'despesa'),
('Impostos e Taxas', 'Impostos, taxas e contribuições', 'despesa'),
('Despesas Bancárias', 'Tarifas e taxas bancárias', 'despesa'),
('Despesas Diversas', 'Outras despesas operacionais', 'despesa');

-- Formas de pagamento padrão
INSERT INTO `cant_formas_pagamento` (`nome`, `descricao`, `tipo`, `taxa_percentual`, `taxa_fixa`, `prazo_compensacao_dias`) VALUES
('Dinheiro', 'Pagamento em espécie', 'dinheiro', 0.00, 0.00, 0),
('PIX', 'Transferência instantânea via PIX', 'pix', 0.00, 0.00, 0),
('Cartão de Débito', 'Pagamento com cartão de débito', 'cartao_debito', 2.50, 0.50, 1),
('Cartão de Crédito', 'Pagamento com cartão de crédito', 'cartao_credito', 3.50, 0.00, 30),
('Transferência Bancária', 'Transferência entre contas', 'transferencia', 0.00, 2.00, 1),
('Boleto Bancário', 'Pagamento via boleto', 'boleto', 0.00, 3.50, 2),
('Cheque', 'Pagamento com cheque', 'cheque', 0.00, 0.00, 2);

-- Conta bancária padrão
INSERT INTO `cant_contas_bancarias` (`nome`, `banco`, `agencia`, `conta`, `tipo_conta`, `saldo_inicial`, `saldo_atual`, `data_saldo_inicial`) VALUES
('Conta Corrente Principal', 'Banco do Brasil', '1234-5', '12345678-9', 'corrente', 10000.00, 10000.00, CURDATE()),
('Conta Poupança', 'Caixa Econômica', '5678-9', '87654321-0', 'poupanca', 5000.00, 5000.00, CURDATE());

-- Fornecedores exemplo
INSERT INTO `cant_fornecedores` (`razao_social`, `nome_fantasia`, `cnpj_cpf`, `tipo_pessoa`, `endereco`, `cidade`, `estado`, `telefone`, `email`) VALUES
('Distribuidora de Alimentos LTDA', 'Distribuidora Central', '12.345.678/0001-90', 'juridica', 'Rua das Flores, 123', 'São Paulo', 'SP', '(11) 3456-7890', 'vendas@distribuidora.com'),
('João Silva Fornecedor ME', 'Mercadinho do João', '98.765.432/0001-10', 'juridica', 'Av. Principal, 456', 'São Paulo', 'SP', '(11) 9876-5432', 'joao@mercadinho.com'),
('Maria Santos', 'Maria Doces', '123.456.789-00', 'fisica', 'Rua dos Doces, 789', 'São Paulo', 'SP', '(11) 9999-8888', 'maria@doces.com');

-- =============================================================================
-- FIM DO ARQUIVO
-- =============================================================================
