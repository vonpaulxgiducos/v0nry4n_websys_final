<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class LoadUserRelationships
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): mixed
    {
        if (Auth::check()) {
            $user = Auth::user();

            // Load relationships by accessing them to trigger lazy loading
            // This ensures the relationships are cached on the user instance
            if ($user) {
                // Simply accessing the relationships will trigger lazy loading
                // and cache them on the user instance
                $_ = $user->customer ?? null;
                $_ = $user->seller ?? null;
                $_ = $user->superAdmin ?? null;
            }
        }

        return $next($request);
    }
}
