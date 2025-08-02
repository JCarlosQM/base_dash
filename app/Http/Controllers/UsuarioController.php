<?php

namespace App\Http\Controllers;

use App\Services\UsuarioService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UsuarioController extends Controller
{
    protected $usuarioService;

    public function __construct(UsuarioService $usuarioService)
    {
        $this->usuarioService = $usuarioService;
    }

    public function index()
    {
        return response()->json($this->usuarioService->obtenerUsuarios());
    }

    public function store(Request $request)
    {
        $this->usuarioService->crearUsuario(
            $request->nombre,
            $request->email,
            $request->password
        );

        return response()->json(['mensaje' => 'Usuario creado correctamente']);
    }
}
