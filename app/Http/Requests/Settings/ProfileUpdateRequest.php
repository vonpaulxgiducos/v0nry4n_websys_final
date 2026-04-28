<?php

namespace App\Http\Requests\Settings;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ProfileUpdateRequest extends FormRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        $user = $this->user();
        $userId = $user->id;

        $rules = [
            'username' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'username')->ignore($userId),
            ],
            'email' => [
                'required',
                'string',
                'email',
                'max:255',
                Rule::unique('users', 'email')->ignore($userId),
            ],
        ];

        if ($user->user_type === 'seller') {
            return array_merge($rules, [
                'owner_name' => ['required', 'string', 'max:100'],
                'business_name' => ['required', 'string', 'max:100'],
                'phone' => ['required', 'string', 'max:20'],
                'address' => ['required', 'string'],
            ]);
        }

        if ($user->user_type === 'customer') {
            return array_merge($rules, [
                'customer_name' => ['required', 'string', 'max:100'],
                'phone' => ['nullable', 'string', 'max:20'],
                'address' => ['nullable', 'string'],
            ]);
        }

        return array_merge($rules, [
            'name' => ['required', 'string', 'max:100'],
            'phone' => ['nullable', 'string', 'max:20'],
            'registration_passkey' => [
                'required',
                'string',
                'size:24',
                Rule::unique('super_admins', 'registration_passkey')->ignore($user->superAdmin?->admin_id, 'admin_id'),
            ],
        ]);
    }
}
