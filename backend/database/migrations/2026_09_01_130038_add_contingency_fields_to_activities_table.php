<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('activities', function (Blueprint $table): void {
            // Set by the client when a seguimiento is created while queued in
            // contingency mode. Lets the sync endpoint be idempotent: syncing
            // the same local transaction twice must never create a duplicate.
            $table->string('client_uuid')->nullable()->unique()->after('id');
            $table->boolean('synced_via_contingency')->default(false)->after('client_uuid');
        });
    }

    public function down(): void
    {
        Schema::table('activities', function (Blueprint $table): void {
            $table->dropColumn(['client_uuid', 'synced_via_contingency']);
        });
    }
};
