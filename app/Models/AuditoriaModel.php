<?php

namespace App\Models;

use CodeIgniter\Model;

class AuditoriaModel extends Model
{
    protected $table = 'cant_auditoria';
    protected $primaryKey = 'id';
    protected $returnType = 'array';
    protected $allowedFields = [
        'usuario_id',
        'acao',
        'entidade',
        'entidade_id',
        'dados_antes',
        'dados_depois',
        'ip',
        'user_agent',
        'created_at'
    ];
    protected $useTimestamps = false;

    /**
     * Registra uma ação de auditoria
     */
    public function registrarAcao(
        ?int $usuarioId,
        string $acao,
        ?string $entidade = null,
        ?int $entidadeId = null,
        ?array $dadosAntes = null,
        ?array $dadosDepois = null,
        ?string $ip = null,
        ?string $userAgent = null
    ): void {
        $this->insert([
            'usuario_id' => $usuarioId,
            'acao' => $acao,
            'entidade' => $entidade,
            'entidade_id' => $entidadeId,
            'dados_antes' => $dadosAntes ? json_encode($dadosAntes) : null,
            'dados_depois' => $dadosDepois ? json_encode($dadosDepois) : null,
            'ip' => $ip,
            'user_agent' => $userAgent,
            'created_at' => date('Y-m-d H:i:s')
        ]);
    }

    /**
     * Registra login bem-sucedido
     */
    public function registrarLogin(int $usuarioId, string $tipoUsuario, string $ip, string $userAgent): void
    {
        $this->registrarAcao(
            $usuarioId,
            'login_sucesso',
            $tipoUsuario === 'responsavel' ? 'responsavel' : 'usuario',
            $usuarioId,
            null,
            ['tipo' => $tipoUsuario],
            $ip,
            $userAgent
        );
    }

    /**
     * Registra tentativa de login falha
     */
    public function registrarLoginFalha(?int $usuarioId, string $identifier, string $ip, string $userAgent): void
    {
        $this->registrarAcao(
            $usuarioId,
            'login_falha',
            null,
            null,
            null,
            ['identifier' => $identifier],
            $ip,
            $userAgent
        );
    }

    /**
     * Registra logout
     */
    public function registrarLogout(int $usuarioId, string $tipoUsuario, string $ip): void
    {
        $this->registrarAcao(
            $usuarioId,
            'logout',
            $tipoUsuario === 'responsavel' ? 'responsavel' : 'usuario',
            $usuarioId,
            null,
            ['tipo' => $tipoUsuario],
            $ip
        );
    }
}
