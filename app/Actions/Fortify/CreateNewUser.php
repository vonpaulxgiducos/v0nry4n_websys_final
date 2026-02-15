<?php

namespace App\Actions\Fortify;

use App\Concerns\PasswordValidationRules;
use App\Concerns\ProfileValidationRules;
use App\Models\Customer;
use App\Models\Seller;
use App\Models\SuperAdmin;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Laravel\Fortify\Contracts\CreatesNewUsers;

class CreateNewUser implements CreatesNewUsers
{
    use PasswordValidationRules, ProfileValidationRules;

    /**
     * Validate and create a newly registered user.
     *
     * @param  array<string, string>  $input
     */
    public function create(array $input): User
    {
        $rules = [
            'username' => ['required', 'string', 'max:50', Rule::unique(User::class, 'username')],
            'email' => $this->emailRules(),
            'user_type' => ['required', Rule::in(['customer', 'seller', 'super_admin'])],
            'password' => $this->passwordRules(),
        ];

        switch ($input['user_type'] ?? null) {
            case 'customer':
                $rules = array_merge($rules, [
                    'first_name' => ['required', 'string', 'max:50'],
                    'last_name' => ['required', 'string', 'max:50'],
                    'phone' => ['nullable', 'string', 'max:20'],
                    'address' => ['nullable', 'string'],
                    'city' => ['nullable', 'string', 'max:100'],
                    'province' => ['nullable', 'string', 'max:100'],
                    'postal_code' => ['nullable', 'string', 'max:10'],
                ]);
                break;
            case 'seller':
                $rules = array_merge($rules, [
                    'business_name' => ['required', 'string', 'max:100'],
                    'owner_name' => ['required', 'string', 'max:100'],
                    'phone' => ['required', 'string', 'max:20'],
                    'address' => ['required', 'string'],
                ]);
                break;
            case 'super_admin':
                $rules = array_merge($rules, [
                    'first_name' => ['required', 'string', 'max:50'],
                    'last_name' => ['required', 'string', 'max:50'],
                    'phone' => ['nullable', 'string', 'max:20'],
                ]);
                break;
        }

        Validator::make($input, $rules)->validate();

        return DB::transaction(function () use ($input) {
            $displayName = match ($input['user_type']) {
                'seller' => $input['owner_name'],
                default => trim($input['first_name'].' '.$input['last_name']),
            };

            $user = User::create([
                'name' => $displayName,
                'username' => $input['username'],
                'email' => $input['email'],
                'password' => $input['password'],
                'user_type' => $input['user_type'],
                'is_active' => true,
            ]);

            if ($input['user_type'] === 'customer') {
                Customer::create([
                    'user_id' => $user->id,
                    'first_name' => $input['first_name'],
                    'last_name' => $input['last_name'],
                    'phone' => $input['phone'] ?? null,
                    'address' => $input['address'] ?? null,
                    'city' => $input['city'] ?? null,
                    'province' => $input['province'] ?? null,
                    'postal_code' => $input['postal_code'] ?? null,
                ]);
            }

            if ($input['user_type'] === 'seller') {
                Seller::create([
                    'user_id' => $user->id,
                    'business_name' => $input['business_name'],
                    'owner_name' => $input['owner_name'],
                    'phone' => $input['phone'],
                    'email' => $input['email'],
                    'address' => $input['address'],
                    'is_approved' => false,
                ]);
            }

            if ($input['user_type'] === 'super_admin') {
                SuperAdmin::create([
                    'user_id' => $user->id,
                    'first_name' => $input['first_name'],
                    'last_name' => $input['last_name'],
                    'phone' => $input['phone'] ?? null,
                    'email' => $input['email'],
                ]);
            }

            return $user;
        });
    }
}
