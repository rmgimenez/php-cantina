<?php

namespace App\Models;

use CodeIgniter\Model;

class ResponsavelModel extends Model
{
    protected $table = 'cant_responsaveis';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = [
        'aps_id',
        'nome',
        'cpf',
        'email',
        'telefone',
        'senha_hash',
        'status',
        'tentativas_login',
        'bloqueado_ate',
        'ultimo_acesso',
        'ip_ultimo_acesso'
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    /**
     * Busca responsável por CPF (apenas ativos e não bloqueados)
     */
    public function findByLoginIdentifier(string $cpf): ?array
    {
        return $this->where('status', 'ativo')
            ->where('cpf', $cpf)
            ->groupStart()
            ->where('bloqueado_ate IS NULL')
            ->orWhere('bloqueado_ate <', date('Y-m-d H:i:s'))
            ->groupEnd()
            ->first();
    }

    /**
     * Incrementa tentativas de login falho
     */
    public function incrementarTentativasLogin(int $responsavelId): void
    {
        $responsavel = $this->find($responsavelId);
        if (!$responsavel) return;

        $tentativas = (int)$responsavel['tentativas_login'] + 1;
        $bloqueadoAte = null;

        // Bloqueia por 15 minutos após 5 tentativas (RN002)
        if ($tentativas >= 5) {
            $bloqueadoAte = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        }

        $this->update($responsavelId, [
            'tentativas_login' => $tentativas,
            'bloqueado_ate' => $bloqueadoAte
        ]);
    }

    /**
     * Zera tentativas de login após sucesso
     */
    public function zerarTentativasLogin(int $responsavelId): void
    {
        $this->update($responsavelId, [
            'tentativas_login' => 0,
            'bloqueado_ate' => null
        ]);
    }

    /**
     * Atualiza dados de último acesso
     */
    public function atualizarUltimoAcesso(int $responsavelId, string $ip, string $userAgent): void
    {
        $this->update($responsavelId, [
            'ultimo_acesso' => date('Y-m-d H:i:s'),
            'ip_ultimo_acesso' => $ip
        ]);
    }

    /**
     * Verifica se responsável está bloqueado
     */
    public function estaResponsavelBloqueado(int $responsavelId): bool
    {
        $responsavel = $this->find($responsavelId);
        if (!$responsavel || !$responsavel['bloqueado_ate']) {
            return false;
        }

        return strtotime($responsavel['bloqueado_ate']) > time();
    }
}
