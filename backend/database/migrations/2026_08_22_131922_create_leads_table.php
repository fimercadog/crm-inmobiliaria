<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('leads', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('phone')->nullable();
            $table->string('email')->nullable();
            $table->string('source');
            $table->string('status')->default('nuevo');
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('converted_to_client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['status']);
            $table->index(['source']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('leads');
    }
};
