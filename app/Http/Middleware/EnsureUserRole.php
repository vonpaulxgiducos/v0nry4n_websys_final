<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserRole
{
    /**
     * Ensure the authenticated user has one of the allowed roles.
     */
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if (! $user) {
            return $next($request);
        }

        if (in_array($user->user_type, $roles, true)) {
            return $next($request);
        }

        if ($request->expectsJson()) {
            return response()->json([
                'message' => 'Your session is currently active for a different role.',
            ], 409);
        }

        return $this->redirectForRole($user->user_type)
            ->with('status', 'Session switched to '.$this->readableRole($user->user_type).'.');
    }

    private function redirectForRole(?string $role): RedirectResponse
    {
        return match ($role) {
            'super_admin' => redirect()->route('admin.dashboard'),
            'seller' => redirect()->route('seller.dashboard'),
            'customer' => redirect()->route('dashboard'),
            default => redirect()->route('home'),
        };
    }

    private function readableRole(?string $role): string
    {
        return match ($role) {
            'super_admin' => 'Super Admin',
            'seller' => 'Seller',
            'customer' => 'Customer',
            default => 'current account role',
        };
    }
}
