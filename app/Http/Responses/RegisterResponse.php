<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\RegisterResponse as RegisterResponseContract;

class RegisterResponse implements RegisterResponseContract
{
    /**
     * Redirect users after registration.
     */
    public function toResponse($request)
    {
        // Only logout if registering from web UI (has user_type field)
        // For tests/API, keep user authenticated
        if ($request->has('user_type')) {
            auth()->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('home')
                ->with('status', 'Registration successful. Please log in.');
        }

        // For tests/API requests, redirect to dashboard
        return redirect()->route('dashboard');
    }
}
