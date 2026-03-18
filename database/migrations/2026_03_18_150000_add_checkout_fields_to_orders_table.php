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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('recipient_name', 150)->nullable()->after('total_amount');
            $table->string('recipient_phone', 30)->nullable()->after('recipient_name');
            $table->text('delivery_address')->nullable()->after('recipient_phone');
            $table->string('courier', 100)->nullable()->after('delivery_address');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn(['recipient_name', 'recipient_phone', 'delivery_address', 'courier']);
        });
    }
};
