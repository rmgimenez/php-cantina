<?php

namespace App\Models;

use CodeIgniter\Model;

/**
 * Model para gerenciamento das contas dos alunos
 */
class ContaAlunoModel extends Model
{
    protected $table = 'cant_contas_alunos';
    protected $primaryKey = 'id';
    protected $useAutoIncrement = true;
    protected $returnType = 'array';
    protected $useSoftDeletes = false;
    protected $protectFields = true;
    protected $allowedFields = [
        'ra_aluno',
        'saldo',
        'limite_diario',
        'ativo'
    ];

    // Validação
    protected $validationRules = [
        'ra_aluno' => 'required|numeric|is_not_unique[cadastro_alunos.ra]',
        'saldo' => 'permit_empty|numeric',
        'limite_diario' => 'permit_empty|numeric|greater_than_equal_to[0]',
        'ativo' => 'permit_empty|in_list[0,1]'
    ];

    protected $validationMessages = [
        'ra_aluno' => [
            'required' => 'O RA do aluno é obrigatório',
            'numeric' => 'RA inválido',
            'is_not_unique' => 'Aluno não encontrado'
        ],
        'saldo' => [
            'numeric' => 'O saldo deve ser um valor numérico'
        ],
        'limite_diario' => [
            'numeric' => 'O limite diário deve ser um valor numérico',
            'greater_than_equal_to' => 'O limite diário deve ser maior ou igual a zero'
        ]
    ];

    // Timestamps automáticos
    protected $useTimestamps = true;
    protected $createdField = 'data_criacao';
    protected $updatedField = 'data_atualizacao';

    /**
     * Busca conta por RA do aluno
     *
     * @param int $raAluno
     * @return array|null
     */
    public function findByRaAluno(int $raAluno): ?array
    {
        return $this->where('ra_aluno', $raAluno)->first();
    }

    /**
     * Obtém saldo da conta do aluno
     *
     * @param int $raAluno
     * @return float
     */
    public function getSaldo(int $raAluno): float
    {
        $conta = $this->findByRaAluno($raAluno);
        return $conta ? (float) $conta['saldo'] : 0.0;
    }

    /**
     * Cria conta para o aluno se não existir
     *
     * @param int $raAluno
     * @return bool
     */
    public function criarContaSeNaoExistir(int $raAluno): bool
    {
        $conta = $this->findByRaAluno($raAluno);
        
        if (!$conta) {
            $data = [
                'ra_aluno' => $raAluno,
                'saldo' => 0.0,
                'ativo' => 1
            ];
            
            return $this->insert($data) !== false;
        }
        
        return true; // Já existe
    }

    /**
     * Adiciona crédito na conta do aluno
     *
     * @param int $raAluno
     * @param float $valor
     * @param int $funcionarioCantinaId
     * @param string $motivo
     * @return bool
     */
    public function addCredito(int $raAluno, float $valor, int $funcionarioCantinaId, string $motivo = 'Crédito adicionado'): bool
    {
        $db = \Config\Database::connect();
        $db->transStart();

        try {
            // Garantir que a conta existe
            if (!$this->criarContaSeNaoExistir($raAluno)) {
                throw new \RuntimeException('Erro ao criar conta do aluno');
            }

            // Atualizar saldo
            $builder = $db->table($this->table);
            $builder->where('ra_aluno', $raAluno);
            $builder->set('saldo', 'saldo + ' . $valor, false);
            $builder->set('data_atualizacao', 'NOW()', false);
            
            if (!$builder->update()) {
                throw new \RuntimeException('Erro ao atualizar saldo');
            }

            // Registrar movimentação
            $movimentacaoData = [
                'tipo_conta' => 'aluno',
                'ra_aluno' => $raAluno,
                'tipo_movimentacao' => 'credito',
                'valor' => $valor,
                'descricao' => $motivo,
                'funcionario_cantina_id' => $funcionarioCantinaId,
                'data_movimentacao' => date('Y-m-d H:i:s')
            ];

            $movimentacaoBuilder = $db->table('cant_movimentacoes');
            if (!$movimentacaoBuilder->insert($movimentacaoData)) {
                throw new \RuntimeException('Erro ao registrar movimentação');
            }

            $db->transComplete();

            if ($db->transStatus() === false) {
                throw new \RuntimeException('Erro na transação de crédito');
            }

            return true;

        } catch (\Exception $e) {
            $db->transRollback();
            throw $e;
        }
    }

    /**
     * Obtém histórico de movimentações do aluno
     *
     * @param int $raAluno
     * @param int $limite
     * @param int $offset
     * @return array
     */
    public function getHistorico(int $raAluno, int $limite = 50, int $offset = 0): array
    {
        $db = \Config\Database::connect();
        
        $builder = $db->table('cant_movimentacoes m');
        $builder->select('m.*, fc.nome as funcionario_nome, v.numero_venda')
                ->join('cant_funcionarios fc', 'm.funcionario_cantina_id = fc.id', 'left')
                ->join('cant_vendas v', 'm.venda_id = v.id', 'left')
                ->where('m.tipo_conta', 'aluno')
                ->where('m.ra_aluno', $raAluno)
                ->orderBy('m.data_movimentacao', 'DESC')
                ->limit($limite, $offset);

        return $builder->get()->getResultArray();
    }

    /**
     * Obtém dados completos da conta (saldo + histórico recente)
     *
     * @param int $raAluno
     * @return array
     */
    public function getContaCompleta(int $raAluno): array
    {
        // Buscar dados da conta
        $conta = $this->findByRaAluno($raAluno);
        
        if (!$conta) {
            // Criar conta se não existir
            $this->criarContaSeNaoExistir($raAluno);
            $conta = $this->findByRaAluno($raAluno);
        }

        // Buscar histórico recente (últimas 10 movimentações)
        $historico = $this->getHistorico($raAluno, 10);

        return [
            'conta' => $conta,
            'historico_recente' => $historico
        ];
    }

    /**
     * Verifica se aluno tem saldo suficiente
     *
     * @param int $raAluno
     * @param float $valor
     * @return bool
     */
    public function temSaldoSuficiente(int $raAluno, float $valor): bool
    {
        $saldo = $this->getSaldo($raAluno);
        return $saldo >= $valor;
    }

    /**
     * Verifica se aluno está dentro do limite diário
     *
     * @param int $raAluno
     * @param float $valor
     * @return bool
     */
    public function dentroLimiteDiario(int $raAluno, float $valor): bool
    {
        $conta = $this->findByRaAluno($raAluno);
        
        if (!$conta || !$conta['limite_diario']) {
            return true; // Sem limite definido
        }

        // Calcular consumo do dia
        $db = \Config\Database::connect();
        $builder = $db->table('cant_movimentacoes');
        $builder->selectSum('valor')
                ->where('tipo_conta', 'aluno')
                ->where('ra_aluno', $raAluno)
                ->where('tipo_movimentacao', 'debito')
                ->where('DATE(data_movimentacao)', date('Y-m-d'));

        $result = $builder->get()->getRow();
        $consumoHoje = $result->valor ?? 0;

        return ($consumoHoje + $valor) <= $conta['limite_diario'];
    }

    /**
     * Define limite diário para o aluno
     *
     * @param int $raAluno
     * @param float|null $limite
     * @return bool
     */
    public function setLimiteDiario(int $raAluno, ?float $limite): bool
    {
        // Garantir que a conta existe
        if (!$this->criarContaSeNaoExistir($raAluno)) {
            return false;
        }

        return $this->where('ra_aluno', $raAluno)->set(['limite_diario' => $limite])->update();
    }

    /**
     * Ativa/desativa conta do aluno
     *
     * @param int $raAluno
     * @param bool $ativo
     * @return bool
     */
    public function setAtivo(int $raAluno, bool $ativo): bool
    {
        return $this->where('ra_aluno', $raAluno)->set(['ativo' => $ativo ? 1 : 0])->update();
    }

    /**
     * Obtém estatísticas da conta
     *
     * @param int $raAluno
     * @return array
     */
    public function getEstatisticas(int $raAluno): array
    {
        $db = \Config\Database::connect();
        
        // Total de créditos
        $builder = $db->table('cant_movimentacoes');
        $builder->selectSum('valor', 'total_creditos')
                ->where('tipo_conta', 'aluno')
                ->where('ra_aluno', $raAluno)
                ->where('tipo_movimentacao', 'credito');
        $creditos = $builder->get()->getRow();

        // Total de débitos
        $builder = $db->table('cant_movimentacoes');
        $builder->selectSum('valor', 'total_debitos')
                ->where('tipo_conta', 'aluno')
                ->where('ra_aluno', $raAluno)
                ->where('tipo_movimentacao', 'debito');
        $debitos = $builder->get()->getRow();

        // Consumo do mês atual
        $builder = $db->table('cant_movimentacoes');
        $builder->selectSum('valor', 'consumo_mes')
                ->where('tipo_conta', 'aluno')
                ->where('ra_aluno', $raAluno)
                ->where('tipo_movimentacao', 'debito')
                ->where('MONTH(data_movimentacao)', date('m'))
                ->where('YEAR(data_movimentacao)', date('Y'));
        $consumoMes = $builder->get()->getRow();

        return [
            'total_creditos' => (float) ($creditos->total_creditos ?? 0),
            'total_debitos' => (float) ($debitos->total_debitos ?? 0),
            'consumo_mes_atual' => (float) ($consumoMes->consumo_mes ?? 0),
            'saldo_atual' => $this->getSaldo($raAluno)
        ];
    }
}