<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Support\Facades\Hash;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'John Customer',
            'username' => 'john_customer',
            'email' => 'john_customer@music.test',
            'password' => Hash::make('password'),
            'user_type' => 'customer',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Mia Seller',
            'username' => 'mia_seller',
            'email' => 'mia_seller@music.test',
            'password' => Hash::make('password'),
            'user_type' => 'seller',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);

        User::factory()->create([
            'name' => 'Zoe Admin',
            'username' => 'zoe_admin',
            'email' => 'zoe_admin@music.test',
            'password' => Hash::make('password'),
            'user_type' => 'super_admin',
            'is_active' => true,
            'email_verified_at' => now(),
        ]);
    }
}
