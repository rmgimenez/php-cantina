<?php

use App\Migration;
use PDO;

class AddProcedures20250814122000 implements Migration
{
    public function getId(): string
    {
        return '20250814122000_add_procedures';
    }

    public function up(PDO $pdo): void
    {
        // Procedure de geração/recalculo de fatura de funcionário
        $pdo->exec('DROP PROCEDURE IF EXISTS sp_gerar_fatura_funcionario');
        $pdo->exec(<<<SQL
CREATE PROCEDURE sp_gerar_fatura_funcionario(IN pFuncionarioId BIGINT, IN pMesRef CHAR(7))
BEGIN
    DECLARE vFaturaId BIGINT;
    SELECT id INTO vFaturaId FROM cant_fatura_func WHERE funcionario_id = pFuncionarioId AND mes_ref = pMesRef LIMIT 1;
    IF vFaturaId IS NULL THEN
        INSERT INTO cant_fatura_func(funcionario_id, mes_ref, total, status) VALUES(pFuncionarioId, pMesRef, 0.00, 'aberta');
        SET vFaturaId = LAST_INSERT_ID();
    ELSE
        DELETE FROM cant_fatura_func_item WHERE fatura_id = vFaturaId;
    END IF;

    INSERT INTO cant_fatura_func_item(fatura_id, venda_id, valor)
    SELECT vFaturaId, v.id, v.total_liquido
    FROM cant_venda v
    WHERE v.funcionario_id = pFuncionarioId
      AND v.status = 'ativa'
      AND DATE_FORMAT(v.created_at, '%Y-%m') = pMesRef;

    UPDATE cant_fatura_func f
    SET total = (SELECT IFNULL(SUM(valor),0) FROM cant_fatura_func_item WHERE fatura_id = vFaturaId)
    WHERE f.id = vFaturaId;
END
SQL);

        // Procedure de limpeza de logs de erro (> 180 dias) e auditoria opcional futura
        $pdo->exec('DROP PROCEDURE IF EXISTS sp_limpar_logs_antigos');
        $pdo->exec(<<<SQL
CREATE PROCEDURE sp_limpar_logs_antigos()
BEGIN
    DELETE FROM cant_log_erro WHERE created_at < (NOW() - INTERVAL 180 DAY);
END
SQL);
    }
}
