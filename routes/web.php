<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Laravel\Fortify\Features;
use App\Models\User;

Route::get('/', function () {
    return Inertia::render('welcome', [
        'canRegister' => Features::enabled(Features::registration()),
        'status' => session('status'),
    ]);
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('seller/dashboard', function () {
        return Inertia::render('seller/dashboard');
    })->name('seller.dashboard');

    Route::get('admin/dashboard', function () {
        if (auth()->user()?->user_type !== 'super_admin') {
            abort(403);
        }

        return Inertia::render('admin/dashboard');
    })->name('admin.dashboard');

    Route::get('admin/users', function () {
        return Inertia::render('admin/users/index', [
            'users' => User::query()
                ->select('id', 'username', 'name', 'email', 'user_type', 'is_active', 'created_at')
                ->orderByDesc('created_at')
                ->get(),
        ]);
    })->name('admin.users.index');
});

require __DIR__.'/settings.php';
