<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->string('shipment_status', 30)->nullable()->after('order_status');
        });

        DB::table('orders')
            ->where('order_status', 'shipped')
            ->whereNull('shipment_status')
            ->update(['shipment_status' => 'shipped_dispatched']);

        DB::table('orders')
            ->where('order_status', 'delivered')
            ->whereNull('shipment_status')
            ->update(['shipment_status' => 'delivered']);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('shipment_status');
        });
    }
};
