<?php

namespace App\Controllers;

class Portal extends BaseController
{
    protected $helpers = ['url'];

    public function index()
    {
        $responsavel = session()->get('authResponsavel');
        if (!$responsavel) {
            return redirect()->to('/login/responsavel');
        }

        return view('portal/index', ['responsavel' => $responsavel]);
    }
}
