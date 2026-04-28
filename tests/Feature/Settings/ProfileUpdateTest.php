<?php

use App\Models\Customer;
use App\Models\Seller;
use App\Models\SuperAdmin;
use App\Models\User;

test('profile page is displayed', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->get(route('profile.edit'));

    $response->assertOk();
});

test('customer profile information can be updated', function () {
    $user = User::factory()->create();

    Customer::create([
        'user_id' => $user->id,
        'first_name' => 'Old',
        'last_name' => 'Customer',
        'phone' => '0900 000 0000',
        'address' => 'Old Address',
        'city' => 'Old City',
        'province' => 'Old Province',
        'postal_code' => '1000',
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'username' => 'testcustomer',
            'email' => 'test@example.com',
            'first_name' => 'Test',
            'last_name' => 'Customer',
            'phone' => '0917 123 4567',
            'address' => '123 Main Street',
            'city' => 'Manila',
            'province' => 'Metro Manila',
            'postal_code' => '1000',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test Customer');
    expect($user->username)->toBe('testcustomer');
    expect($user->email)->toBe('test@example.com');
    expect($user->email_verified_at)->toBeNull();

    $customer = Customer::where('user_id', $user->id)->first();

    expect($customer?->first_name)->toBe('Test');
    expect($customer?->last_name)->toBe('Customer');
    expect($customer?->city)->toBe('Manila');
});

test('seller profile information can be updated', function () {
    $user = User::factory()->create();

    $user->forceFill(['user_type' => 'seller'])->save();

    Seller::create([
        'user_id' => $user->id,
        'business_name' => 'Old Store',
        'owner_name' => 'Old Owner',
        'phone' => '0900 000 0000',
        'address' => 'Old Address',
        'email' => $user->email,
        'is_approved' => false,
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'username' => 'testseller',
            'email' => 'seller@example.com',
            'business_name' => 'Test Store',
            'owner_name' => 'Test Owner',
            'phone' => '0918 765 4321',
            'address' => '456 Market Street',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test Owner');
    expect($user->username)->toBe('testseller');
    expect($user->email)->toBe('seller@example.com');

    $seller = Seller::where('user_id', $user->id)->first();

    expect($seller?->business_name)->toBe('Test Store');
    expect($seller?->owner_name)->toBe('Test Owner');
    expect($seller?->phone)->toBe('0918 765 4321');
});

test('admin profile information can be updated', function () {
    $user = User::factory()->create();

    $user->forceFill(['user_type' => 'super_admin'])->save();

    SuperAdmin::create([
        'user_id' => $user->id,
        'first_name' => 'Old',
        'last_name' => 'Admin',
        'phone' => null,
    ]);

    $response = $this
        ->actingAs($user)
        ->patch(route('profile.update'), [
            'username' => 'testadmin',
            'email' => 'admin@example.com',
            'first_name' => 'Test',
            'last_name' => 'Admin',
            'phone' => '0919 555 1212',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('profile.edit'));

    $user->refresh();

    expect($user->name)->toBe('Test Admin');
    expect($user->username)->toBe('testadmin');
    expect($user->email)->toBe('admin@example.com');

    $admin = SuperAdmin::where('user_id', $user->id)->first();

    expect($admin?->first_name)->toBe('Test');
    expect($admin?->last_name)->toBe('Admin');
    expect($admin?->phone)->toBe('0919 555 1212');
});

test('user can delete their account', function () {
    $user = User::factory()->create();

    $response = $this
        ->actingAs($user)
        ->delete(route('profile.destroy'), [
            'password' => 'password',
        ]);

    $response
        ->assertSessionHasNoErrors()
        ->assertRedirect(route('home'));

    $this->assertGuest();
    expect($user->fresh())->toBeNull();
});
