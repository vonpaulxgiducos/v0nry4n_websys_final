<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Str;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('super_admins', function (Blueprint $table) {
            $table->string('registration_passkey', 64)->nullable()->unique()->after('email');
        });

        $admins = DB::table('super_admins')
            ->select('admin_id')
            ->whereNull('registration_passkey')
            ->get();

        foreach ($admins as $admin) {
            do {
                $passkey = Str::upper(Str::random(24));
            } while (DB::table('super_admins')->where('registration_passkey', $passkey)->exists());

            DB::table('super_admins')
                ->where('admin_id', $admin->admin_id)
                ->update(['registration_passkey' => $passkey]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('super_admins', function (Blueprint $table) {
            $table->dropUnique(['registration_passkey']);
            $table->dropColumn('registration_passkey');
        });
    }
};
