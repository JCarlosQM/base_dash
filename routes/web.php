<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UsuarioController;
use App\Http\Controllers\LoginController;

Route::get('/', function () {
    return view('users.home'); 
})->name('home');

// ✅ Ruta que carga la vista Blade con la tabla y modals
Route::get('/usuarios', [UsuarioController::class, 'vista'])->name('usuarios.index');

// ✅ Ruta API que devuelve JSON (usada por JS)
Route::get('/api/usuarios', [UsuarioController::class, 'index'])->name('usuarios.api');

// Rutas CRUD
Route::post('/usuarios', [UsuarioController::class, 'store'])->name('usuarios.store');
Route::put('/usuarios/{id}', [UsuarioController::class, 'update'])->name('usuarios.update');
Route::delete('/usuarios/{id}', [UsuarioController::class, 'destroy'])->name('usuarios.destroy');

// Login
Route::get('/login', function () {
    return view('auth.login');
})->name('login')->middleware('guest');

Route::post('/login', [LoginController::class, 'login'])->name('login.submit');

// Dashboard
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
