<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('opportunities', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('property_id')->nullable()->constrained('properties')->nullOnDelete();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('owner_id')->nullable()->constrained('owners')->nullOnDelete();
            $table->decimal('value', 14, 2)->nullable();
            $table->string('stage')->default('nuevo');
            $table->string('status')->default('abierta');
            $table->unsignedTinyInteger('probability')->nullable();
            $table->string('next_action')->nullable();
            $table->date('estimated_close_date')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();

            $table->index(['stage']);
            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('opportunities');
    }
};
