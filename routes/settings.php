<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use App\Http\Controllers\Settings\TwoFactorAuthenticationController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::middleware(['auth'])->group(function () {
    Route::get('settings', function (Request $request) {
        $dashboardRoute = match ($request->user()?->user_type) {
            'seller' => 'seller.dashboard',
            'super_admin' => 'admin.dashboard',
            default => 'dashboard',
        };

        return redirect()->route($dashboardRoute, ['section' => 'settings']);
    });

    Route::get('settings/profile', function (Request $request) {
        $dashboardRoute = match ($request->user()?->user_type) {
            'seller' => 'seller.dashboard',
            'super_admin' => 'admin.dashboard',
            default => 'dashboard',
        };

        return redirect()->route($dashboardRoute, ['section' => 'settings']);
    })->name('profile.edit');
    Route::patch('settings/profile', [ProfileController::class, 'update'])->name('profile.update');
});

Route::middleware(['auth'])->group(function () {
    Route::delete('settings/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::get('settings/password', [PasswordController::class, 'edit'])->name('user-password.edit');

    Route::put('settings/password', [PasswordController::class, 'update'])
        ->middleware('throttle:20,1')
        ->name('user-password.update');

    Route::get('settings/appearance', function () {
        return Inertia::render('settings/appearance');
    })->name('appearance.edit');

    Route::get('settings/two-factor', [TwoFactorAuthenticationController::class, 'show'])
        ->name('two-factor.show');
});
