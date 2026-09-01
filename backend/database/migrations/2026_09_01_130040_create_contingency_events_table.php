<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Single append-only audit log for every contingency-related event
        // (activated, deactivated, synced, discarded). One flexible table
        // instead of a separate audit table per event type — evidence is
        // never deleted, only ever inserted.
        Schema::create('contingency_events', function (Blueprint $table): void {
            $table->id();
            $table->foreignId('contingency_session_id')->nullable()->constrained('contingency_sessions');
            $table->string('type'); // activated | deactivated | synced | discarded
            $table->foreignId('user_id')->constrained('users');
            $table->json('payload')->nullable();
            $table->timestamp('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contingency_events');
    }
};
