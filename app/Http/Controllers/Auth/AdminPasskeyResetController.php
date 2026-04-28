<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AdminPasskeyResetController extends Controller
{
    public function create(Request $request): Response
    {
        return Inertia::render('auth/admin-passkey-reset', [
            'status' => $request->session()->get('status'),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'login' => ['required', 'string'],
            'passkey' => ['required', 'string', 'size:24'],
            'password' => ['required', 'string', 'confirmed', 'min:8'],
        ]);

        $user = User::query()
            ->where('user_type', 'super_admin')
            ->where(function ($query) use ($validated) {
                $query->where('email', $validated['login'])
                    ->orWhere('username', $validated['login']);
            })
            ->where('is_active', true)
            ->with('superAdmin')
            ->first();

        if (! $user || ! $user->superAdmin || $user->superAdmin->registration_passkey !== $validated['passkey']) {
            throw ValidationException::withMessages([
                'passkey' => 'Invalid admin account or passkey.',
            ]);
        }

        $user->forceFill([
            'password' => Hash::make($validated['password']),
            'remember_token' => null,
        ])->save();

        return redirect()->route('login')->with('status', 'Password reset successful. Please log in.');
    }
}
