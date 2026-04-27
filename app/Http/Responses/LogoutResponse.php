<?php

namespace App\Http\Responses;

use Laravel\Fortify\Contracts\LogoutResponse as LogoutResponseContract;

class LogoutResponse implements LogoutResponseContract
{
    /**
     * Redirect users to login page after logout.
     */
    public function toResponse($request)
    {
        return $request->wantsJson()
            ? response()->noContent()
            : redirect()->route('login');
    }
}
