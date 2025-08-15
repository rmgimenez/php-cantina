<?php

namespace App\Controllers;

use App\Models\UsuarioModel;
use App\Models\ResponsavelModel;
use App\Models\AuditoriaModel;
use CodeIgniter\HTTP\RedirectResponse;

class Auth extends BaseController
{
    protected $helpers = ['url', 'form'];

    public function loginForm()
    {
        if (session()->get('authUser') || session()->get('authResponsavel')) {
            return redirect()->to('/dashboard');
        }
        return view('auth/login');
    }

    public function loginResponsavelForm()
    {
        if (session()->get('authUser') || session()->get('authResponsavel')) {
            return redirect()->to('/dashboard');
        }
        return view('auth/login_responsavel');
    }

    public function login(): RedirectResponse
    {
        $session = session();
        $identifier = trim((string)$this->request->getPost('login'));
        $senha = (string)$this->request->getPost('senha');
        $ip = $this->request->getIPAddress();
        $userAgent = (string)$this->request->getUserAgent();

        // Validação básica
        if ($identifier === '' || $senha === '') {
            $session->setFlashdata('authError', 'Informe usuário e senha.');
            return redirect()->back()->withInput();
        }

        $usuarioModel = new UsuarioModel();
        $auditoriaModel = new AuditoriaModel();

        // Busca usuário
        $usuario = $usuarioModel->findByLoginIdentifier($identifier);

        if (!$usuario) {
            // Registra tentativa de login com identifier inválido
            $auditoriaModel->registrarLoginFalha(null, $identifier, $ip, $userAgent);
            $session->setFlashdata('authError', 'Credenciais inválidas.');
            return redirect()->back()->withInput();
        }

        // Verifica se usuário está bloqueado
        if ($usuarioModel->estaUsuarioBloqueado($usuario['id'])) {
            $auditoriaModel->registrarLoginFalha($usuario['id'], $identifier, $ip, $userAgent);
            $session->setFlashdata('authError', 'Usuário temporariamente bloqueado devido a tentativas excessivas.');
            return redirect()->back()->withInput();
        }

        // Verifica senha
        if (!password_verify($senha, $usuario['senha_hash'])) {
            $usuarioModel->incrementarTentativasLogin($usuario['id']);
            $auditoriaModel->registrarLoginFalha($usuario['id'], $identifier, $ip, $userAgent);
            $session->setFlashdata('authError', 'Credenciais inválidas.');
            return redirect()->back()->withInput();
        }

        // Login bem-sucedido
        $usuarioModel->zerarTentativasLogin($usuario['id']);
        $usuarioModel->atualizarUltimoAcesso($usuario['id'], $ip, $userAgent);
        $auditoriaModel->registrarLogin($usuario['id'], 'funcionario', $ip, $userAgent);

        $session->set('authUser', [
            'id' => $usuario['id'],
            'nome' => $usuario['nome'],
            'tipo' => $usuario['tipo'],
            'email' => $usuario['email'] ?? null,
        ]);

        return redirect()->to('/dashboard');
    }

    public function loginResponsavel(): RedirectResponse
    {
        $session = session();
        $cpf = trim((string)$this->request->getPost('cpf'));
        $senha = (string)$this->request->getPost('senha');
        $ip = $this->request->getIPAddress();
        $userAgent = (string)$this->request->getUserAgent();

        // Validação básica
        if ($cpf === '' || $senha === '') {
            $session->setFlashdata('authError', 'Informe CPF e senha.');
            return redirect()->back()->withInput();
        }

        $responsavelModel = new ResponsavelModel();
        $auditoriaModel = new AuditoriaModel();

        // Busca responsável
        $responsavel = $responsavelModel->findByLoginIdentifier($cpf);

        if (!$responsavel || !$responsavel['senha_hash']) {
            // Registra tentativa de login com CPF inválido ou sem senha cadastrada
            $auditoriaModel->registrarLoginFalha(null, $cpf, $ip, $userAgent);
            $session->setFlashdata('authError', 'CPF não encontrado ou senha não cadastrada.');
            return redirect()->back()->withInput();
        }

        // Verifica se responsável está bloqueado
        if ($responsavelModel->estaResponsavelBloqueado($responsavel['id'])) {
            $auditoriaModel->registrarLoginFalha($responsavel['id'], $cpf, $ip, $userAgent);
            $session->setFlashdata('authError', 'Acesso temporariamente bloqueado devido a tentativas excessivas.');
            return redirect()->back()->withInput();
        }

        // Verifica senha
        if (!password_verify($senha, $responsavel['senha_hash'])) {
            $responsavelModel->incrementarTentativasLogin($responsavel['id']);
            $auditoriaModel->registrarLoginFalha($responsavel['id'], $cpf, $ip, $userAgent);
            $session->setFlashdata('authError', 'Credenciais inválidas.');
            return redirect()->back()->withInput();
        }

        // Login bem-sucedido
        $responsavelModel->zerarTentativasLogin($responsavel['id']);
        $responsavelModel->atualizarUltimoAcesso($responsavel['id'], $ip, $userAgent);
        $auditoriaModel->registrarLogin($responsavel['id'], 'responsavel', $ip, $userAgent);

        $session->set('authResponsavel', [
            'id' => $responsavel['id'],
            'nome' => $responsavel['nome'],
            'cpf' => $responsavel['cpf'],
            'email' => $responsavel['email'] ?? null,
        ]);

        return redirect()->to('/portal');
    }

    public function logout(): RedirectResponse
    {
        $session = session();
        $authUser = $session->get('authUser');
        $authResponsavel = $session->get('authResponsavel');
        $ip = $this->request->getIPAddress();

        if ($authUser) {
            $auditoriaModel = new AuditoriaModel();
            $auditoriaModel->registrarLogout($authUser['id'], 'funcionario', $ip);
            $session->remove('authUser');
        }

        if ($authResponsavel) {
            $auditoriaModel = new AuditoriaModel();
            $auditoriaModel->registrarLogout($authResponsavel['id'], 'responsavel', $ip);
            $session->remove('authResponsavel');
        }

        return redirect()->to('/login');
    }
}
