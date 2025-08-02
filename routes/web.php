<?php

// web.php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\LoginController;

Route::get('/', function () {
    return view('users.home'); 
})->name('home');


// Rutas de usuarios
Route::get('/usuarios', [UsuarioController::class, 'index'])->name('usuarios.index');
Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');

// Rutas de login
Route::get('/login', function () {
    return view('auth.login');
})->name('login')->middleware('guest');

Route::post('/login', [LoginController::class, 'login'])->name('login.submit');

// Ruta protegida: dashboard
Route::get('/dashboard', function () {
    if (!session()->has('usuario')) {
        return redirect()->route('login')->with('error', 'Iniciá sesión primero');
    }

    return view('dashboard.dashboard');
})->name('dashboard');

// Logout
Route::get('/logout', function () {
    session()->forget('usuario');
    return redirect()->route('login')->with('error', 'Sesión cerrada');
})->name('logout');
