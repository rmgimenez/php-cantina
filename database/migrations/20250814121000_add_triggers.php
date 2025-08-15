<?php

use App\Migration;
use PDO;

class AddTriggers20250814121000 implements Migration
{
    public function getId(): string
    {
        return '20250814121000_add_triggers';
    }

    public function up(PDO $pdo): void
    {
        $pdo->exec("DROP TRIGGER IF EXISTS trg_movimento_saldo_ai");
        $pdo->exec(<<<SQL
CREATE TRIGGER trg_movimento_saldo_ai
AFTER INSERT ON cant_movimento_saldo
FOR EACH ROW
BEGIN
    IF NEW.tipo IN ('credito','ajuste') THEN
        UPDATE cant_aluno SET saldo_atual = saldo_atual + NEW.valor WHERE id = NEW.aluno_id;
    ELSEIF NEW.tipo = 'debito' THEN
        UPDATE cant_aluno SET saldo_atual = saldo_atual - NEW.valor WHERE id = NEW.aluno_id;
    END IF;
END
SQL);

        $pdo->exec("DROP TRIGGER IF EXISTS trg_estoque_mov_ai");
        $pdo->exec(<<<SQL
CREATE TRIGGER trg_estoque_mov_ai
AFTER INSERT ON cant_estoque_mov
FOR EACH ROW
BEGIN
    IF NEW.tipo = 'entrada' THEN
        UPDATE cant_produto SET estoque_atual = estoque_atual + NEW.quantidade WHERE id = NEW.produto_id AND controle_estoque = 1;
    ELSEIF NEW.tipo = 'saida' THEN
        UPDATE cant_produto SET estoque_atual = estoque_atual - NEW.quantidade WHERE id = NEW.produto_id AND controle_estoque = 1;
    END IF;
END
SQL);
    }
}
