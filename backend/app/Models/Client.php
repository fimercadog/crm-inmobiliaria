<?php

namespace App\Models;

use App\Enums\ClientStatus;
use App\Enums\InterestType;
use App\Enums\PropertyType;
use Database\Factories\ClientFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    /** @use HasFactory<ClientFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'document',
        'phone',
        'whatsapp',
        'email',
        'interest_type',
        'budget_min',
        'budget_max',
        'interest_zones',
        'property_type_interest',
        'bedrooms_needed',
        'notes',
        'agent_id',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'interest_type' => InterestType::class,
            'property_type_interest' => PropertyType::class,
            'budget_min' => 'decimal:2',
            'budget_max' => 'decimal:2',
            'interest_zones' => 'array',
            'status' => ClientStatus::class,
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * @return HasMany<Lead, $this>
     */
    public function convertedLeads(): HasMany
    {
        return $this->hasMany(Lead::class, 'converted_to_client_id');
    }
}
