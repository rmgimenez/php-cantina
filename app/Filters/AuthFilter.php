<?php

namespace App\Filters;

use CodeIgniter\Filters\FilterInterface;
use CodeIgniter\HTTP\RequestInterface;
use CodeIgniter\HTTP\ResponseInterface;

class AuthFilter implements FilterInterface
{
    public function before(RequestInterface $request, $arguments = null)
    {
        $authUser = session()->get('authUser');
        $authResponsavel = session()->get('authResponsavel');

        // Se não há nenhum usuário autenticado, redireciona para login
        if (!$authUser && !$authResponsavel) {
            return redirect()->to('/login');
        }

        // Se há argumentos, verifica permissões específicas
        if ($arguments) {
            // Se requer tipo específico de usuário
            if (in_array('funcionario', $arguments) && !$authUser) {
                return redirect()->to('/login');
            }

            if (in_array('responsavel', $arguments) && !$authResponsavel) {
                return redirect()->to('/login/responsavel');
            }

            // Se requer papel específico de funcionário
            if ($authUser) {
                $papelRequerido = array_intersect(['caixa', 'supervisor', 'gerente', 'informatica'], $arguments);
                if (!empty($papelRequerido) && !in_array($authUser['tipo'], $papelRequerido)) {
                    return redirect()->to('/dashboard')->with('error', 'Acesso negado.');
                }
            }
        }
    }

    public function after(RequestInterface $request, ResponseInterface $response, $arguments = null) {}
}
