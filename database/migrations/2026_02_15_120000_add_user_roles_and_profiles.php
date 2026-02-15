<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('username', 50)->unique()->after('id');
            $table->enum('user_type', ['customer', 'seller', 'super_admin'])->after('email');
            $table->boolean('is_active')->default(true)->after('user_type');
        });

        Schema::create('customers', function (Blueprint $table) {
            $table->id('customer_id');
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('phone', 20)->nullable();
            $table->text('address')->nullable();
            $table->string('city', 100)->nullable();
            $table->string('province', 100)->nullable();
            $table->string('postal_code', 10)->nullable();
            $table->timestamps();
        });

        Schema::create('sellers', function (Blueprint $table) {
            $table->id('seller_id');
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('business_name', 100);
            $table->string('owner_name', 100);
            $table->string('phone', 20);
            $table->string('email', 100);
            $table->text('address');
            $table->boolean('is_approved')->default(false);
            $table->timestamp('approval_date')->nullable();
            $table->timestamps();
        });

        Schema::create('super_admins', function (Blueprint $table) {
            $table->id('admin_id');
            $table->foreignId('user_id')->unique()->constrained('users')->cascadeOnDelete();
            $table->string('first_name', 50);
            $table->string('last_name', 50);
            $table->string('phone', 20)->nullable();
            $table->string('email', 100);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('super_admins');
        Schema::dropIfExists('sellers');
        Schema::dropIfExists('customers');

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['username', 'user_type', 'is_active']);
        });
    }
};
