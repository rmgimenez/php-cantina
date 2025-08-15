<?php

namespace App\Models;

use CodeIgniter\Model;

class UsuarioModel extends Model
{
    protected $table = 'cant_usuarios';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = [
        'nome',
        'email',
        'cpf',
        'senha_hash',
        'tipo',
        'status',
        'ultimo_acesso',
        'tentativas_login',
        'bloqueado_ate',
        'ip_ultimo_acesso',
        'user_agent'
    ];
    protected $useTimestamps = true;
    protected $createdField = 'created_at';
    protected $updatedField = 'updated_at';

    /**
     * Busca usuário por email ou CPF (apenas ativos e não bloqueados)
     */
    public function findByLoginIdentifier(string $identifier): ?array
    {
        return $this->where('status', 'ativo')
            ->groupStart()
            ->where('bloqueado_ate IS NULL')
            ->orWhere('bloqueado_ate <', date('Y-m-d H:i:s'))
            ->groupEnd()
            ->groupStart()
            ->where('email', $identifier)
            ->orWhere('cpf', $identifier)
            ->groupEnd()
            ->first();
    }

    /**
     * Incrementa tentativas de login falho
     */
    public function incrementarTentativasLogin(int $usuarioId): void
    {
        $usuario = $this->find($usuarioId);
        if (!$usuario) return;

        $tentativas = (int)$usuario['tentativas_login'] + 1;
        $bloqueadoAte = null;

        // Bloqueia por 15 minutos após 5 tentativas (RN002)
        if ($tentativas >= 5) {
            $bloqueadoAte = date('Y-m-d H:i:s', strtotime('+15 minutes'));
        }

        $this->update($usuarioId, [
            'tentativas_login' => $tentativas,
            'bloqueado_ate' => $bloqueadoAte
        ]);
    }

    /**
     * Zera tentativas de login após sucesso
     */
    public function zerarTentativasLogin(int $usuarioId): void
    {
        $this->update($usuarioId, [
            'tentativas_login' => 0,
            'bloqueado_ate' => null
        ]);
    }

    /**
     * Atualiza dados de último acesso
     */
    public function atualizarUltimoAcesso(int $usuarioId, string $ip, string $userAgent): void
    {
        $this->update($usuarioId, [
            'ultimo_acesso' => date('Y-m-d H:i:s'),
            'ip_ultimo_acesso' => $ip,
            'user_agent' => $userAgent
        ]);
    }

    /**
     * Verifica se usuário está bloqueado
     */
    public function estaUsuarioBloqueado(int $usuarioId): bool
    {
        $usuario = $this->find($usuarioId);
        if (!$usuario || !$usuario['bloqueado_ate']) {
            return false;
        }

        return strtotime($usuario['bloqueado_ate']) > time();
    }
}
