<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class UseRoleAuthContext
{
    /**
     * Scope auth/session cookies by role context so tabs can keep separate accounts.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $role = $this->resolveRoleContext($request);

        $guard = match ($role) {
            'seller' => 'seller_web',
            'super_admin' => 'admin_web',
            default => 'customer_web',
        };

        config([
            'auth.defaults.guard' => $guard,
            'fortify.guard' => $guard,
        ]);

        return $next($request);
    }

    private function resolveRoleContext(Request $request): string
    {
        if ($request->is('login') || $request->is('logout')) {
            $roleFromRequest = (string) $request->input('user_type', $request->query('user_type', ''));

            if (in_array($roleFromRequest, ['customer', 'seller', 'super_admin'], true)) {
                return $roleFromRequest;
            }

            $referrerPath = (string) parse_url((string) $request->headers->get('referer', ''), PHP_URL_PATH);

            if (str_starts_with($referrerPath, '/admin')) {
                return 'super_admin';
            }

            if (str_starts_with($referrerPath, '/seller')) {
                return 'seller';
            }

            if (
                $referrerPath === '/dashboard'
                || str_starts_with($referrerPath, '/customer')
                || str_starts_with($referrerPath, '/support')
            ) {
                return 'customer';
            }
        }

        if ($request->isMethod('post') && $request->is('login')) {
            $postedRole = (string) $request->input('user_type');

            if (in_array($postedRole, ['customer', 'seller', 'super_admin'], true)) {
                return $postedRole;
            }
        }

        if ($request->is('settings') || $request->is('settings/*')) {
            if (Auth::guard('admin_web')->check()) {
                return 'super_admin';
            }

            if (Auth::guard('seller_web')->check()) {
                return 'seller';
            }

            if (Auth::guard('customer_web')->check()) {
                return 'customer';
            }

            $referrerPath = (string) parse_url((string) $request->headers->get('referer', ''), PHP_URL_PATH);

            if (str_starts_with($referrerPath, '/admin')) {
                return 'super_admin';
            }

            if (str_starts_with($referrerPath, '/seller')) {
                return 'seller';
            }

            return 'customer';
        }

        if ($request->is('admin') || $request->is('admin/*')) {
            return 'super_admin';
        }

        if ($request->is('seller') || $request->is('seller/*')) {
            return 'seller';
        }

        if (
            $request->is('dashboard')
            || $request->is('customer/*')
            || $request->is('support/*')
        ) {
            return 'customer';
        }

        return 'customer';
    }
}
