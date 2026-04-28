<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileDeleteRequest;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Show the user's profile settings page.
     */
    public function edit(Request $request): Response
    {
        $user = $request->user()->loadMissing(['customer', 'seller', 'superAdmin']);

        $profileData = [
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
            'registration_passkey' => $user->superAdmin?->registration_passkey,
        ];

        return Inertia::render('settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
            'profileData' => $profileData,
            'userType' => $user->user_type,
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function update(ProfileUpdateRequest $request): RedirectResponse
    {
        $user = $request->user()->loadMissing(['customer', 'seller', 'superAdmin']);
        $validated = $request->validated();

        DB::transaction(function () use ($user, $validated) {
            $previousEmail = $user->email;

            $user->username = $validated['username'];
            $user->email = $validated['email'];

            if ($user->user_type === 'customer') {
                $customerName = trim($validated['customer_name']);
                [$firstName, $lastName] = $this->splitName($customerName);

                $user->name = $customerName;

                $user->customer()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'phone' => $validated['phone'] ?: null,
                        'address' => $validated['address'] ?: null,
                    ],
                );
            }

            if ($user->user_type === 'seller') {
                $user->name = $validated['owner_name'];

                $user->seller()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'owner_name' => $validated['owner_name'],
                        'business_name' => $validated['business_name'],
                        'phone' => $validated['phone'],
                        'address' => $validated['address'],
                        'email' => $validated['email'],
                    ],
                );
            }

            if ($user->user_type === 'super_admin') {
                [$firstName, $lastName] = $this->splitName($validated['name']);
                $user->name = $validated['name'];

                $user->superAdmin()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'first_name' => $firstName,
                        'last_name' => $lastName,
                        'phone' => $validated['phone'] ?: null,
                        'email' => $validated['email'],
                        'registration_passkey' => $validated['registration_passkey'],
                    ],
                );
            }

            if ($previousEmail !== $validated['email']) {
                $user->email_verified_at = null;
            }

            $user->save();
        });

        return redirect()->route(match ($user->user_type) {
            'seller' => 'seller.dashboard',
            'super_admin' => 'admin.dashboard',
            default => 'dashboard',
        }, ['section' => 'settings']);
    }

    /**
     * @return array{0: string, 1: string}
     */
    private function splitName(string $value): array
    {
        $trimmed = trim(preg_replace('/\s+/', ' ', $value) ?? $value);
        $parts = explode(' ', $trimmed, 2);

        $firstName = $parts[0] ?? '';
        $lastName = $parts[1] ?? $firstName;

        return [$firstName, $lastName];
    }

    /**
     * Delete the user's account.
     */
    public function destroy(ProfileDeleteRequest $request): RedirectResponse
    {
        $user = $request->user();

        Auth::logout();

        DB::transaction(function () use ($user) {
            // Clean up related records before deleting user
            if ($user->user_type === 'seller') {
                // Delete related seller data
                \App\Models\Product::where('seller_id', $user->seller?->seller_id)->delete();
                \App\Models\Shipment::where('seller_id', $user->seller?->seller_id)->delete();
                \App\Models\Order::where('seller_id', $user->seller?->seller_id)->delete();
                $user->seller()->delete();
            } elseif ($user->user_type === 'customer') {
                // Delete related customer data
                \App\Models\CartItem::where('customer_id', $user->customer?->customer_id)->delete();
                \App\Models\Order::where('customer_id', $user->customer?->customer_id)->delete();
                $user->customer()->delete();
            } elseif ($user->user_type === 'super_admin') {
                // Just delete the admin profile
                $user->superAdmin()->delete();
            }

            // Delete user
            $user->delete();
        });

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }
}
