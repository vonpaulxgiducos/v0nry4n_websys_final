<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that's loaded on the first page visit.
     *
     * @see https://inertiajs.com/server-side-setup#root-template
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determines the current asset version.
     *
     * @see https://inertiajs.com/asset-versioning
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @see https://inertiajs.com/shared-data
     *
     * @return array<string, mixed>
     */
    public function share(Request $request): array
    {
        $user = $request->user()?->loadMissing(['customer', 'seller', 'superAdmin']);

        return [
            ...parent::share($request),
            'name' => config('app.name'),
            'csrf_token' => csrf_token(),
            'auth' => [
                'user' => $request->user(),
            ],
            'profileData' => $user ? [
                'username' => $user->username,
                'email' => $user->email,
                'name' => $user->name,
                'customer_name' => $user->customer
                    ? trim($user->customer->first_name.' '.$user->customer->last_name)
                    : $user->name,
                'owner_name' => $user->seller?->owner_name,
                'business_name' => $user->seller?->business_name,
                'phone' => $user->seller?->phone
                    ?? $user->customer?->phone
                    ?? $user->superAdmin?->phone,
                'address' => $user->seller?->address
                    ?? $user->customer?->address,
            ] : null,
            'userType' => $user?->user_type,
            'sidebarOpen' => ! $request->hasCookie('sidebar_state') || $request->cookie('sidebar_state') === 'true',
        ];
    }
}
