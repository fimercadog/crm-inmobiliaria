<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('document')->nullable();
            $table->string('phone')->nullable();
            $table->string('whatsapp')->nullable();
            $table->string('email')->nullable();
            $table->string('interest_type')->nullable();
            $table->decimal('budget_min', 14, 2)->nullable();
            $table->decimal('budget_max', 14, 2)->nullable();
            $table->json('interest_zones')->nullable();
            $table->string('property_type_interest')->nullable();
            $table->unsignedSmallInteger('bedrooms_needed')->nullable();
            $table->text('notes')->nullable();
            $table->foreignId('agent_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('status')->default('activo');
            $table->timestamps();

            $table->index(['status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('clients');
    }
};
