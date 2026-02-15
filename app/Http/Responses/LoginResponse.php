<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LoginResponse as LoginResponseContract;

class LoginResponse implements LoginResponseContract
{
    /**
     * Redirect users after login based on role.
     */
    public function toResponse($request)
    {
        $user = $request->user();

        if ($user && $user->user_type === 'super_admin') {
            return redirect()->route('admin.dashboard');
        }

        if ($user && $user->user_type === 'seller') {
            return redirect()->route('seller.dashboard');
        }

        return redirect()->route('dashboard');
    }
}
