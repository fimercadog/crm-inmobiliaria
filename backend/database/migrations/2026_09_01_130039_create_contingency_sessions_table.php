<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // One row per activation cycle. Server-authoritative: every user's
        // browser reads this to know contingency is active and which
        // modules are enabled — the transaction queue itself stays local
        // (IndexedDB) per device, but "is contingency on" must be shared.
        Schema::create('contingency_sessions', function (Blueprint $table): void {
            $table->id();
            $table->json('enabled_modules');
            $table->foreignId('activated_by')->constrained('users');
            $table->timestamp('activated_at');
            $table->foreignId('deactivated_by')->nullable()->constrained('users');
            $table->timestamp('deactivated_at')->nullable();
            $table->enum('status', ['active', 'closed'])->default('active');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contingency_sessions');
    }
};
