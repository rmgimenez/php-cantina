<?php

namespace App\Controllers;

/**
 * Controlador simples para endpoints de saúde / base da API
 */
class Health extends BaseApiController
{
    /**
     * GET /api/health
     */
    public function index()
    {
        $data = [
            'service' => 'API da Cantina Escolar',
            'status' => 'ok',
            'timestamp' => date('Y-m-d H:i:s'),
        ];

        return $this->respondSuccess($data, 'API da Cantina Escolar funcionando', 200);
    }
}
