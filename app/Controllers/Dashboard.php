<?php

namespace App\Controllers;

class Dashboard extends BaseController
{
    protected $helpers = ['url'];

    public function index()
    {
        $user = session()->get('authUser');
        if (!$user) {
            return redirect()->to('/login');
        }
        return view('dashboard/index', ['user' => $user]);
    }
}
