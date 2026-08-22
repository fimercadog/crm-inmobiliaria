<?php

namespace App\Models;

use App\Enums\OpportunityStage;
use App\Enums\OpportunityStatus;
use Database\Factories\OpportunityFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Opportunity extends Model
{
    /** @use HasFactory<OpportunityFactory> */
    use HasFactory;

    protected $fillable = [
        'client_id',
        'property_id',
        'agent_id',
        'owner_id',
        'value',
        'stage',
        'status',
        'probability',
        'next_action',
        'estimated_close_date',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'stage' => OpportunityStage::class,
            'status' => OpportunityStatus::class,
            'value' => 'decimal:2',
            'estimated_close_date' => 'date',
            'closed_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        $syncStatus = function (Opportunity $opportunity): void {
            if (! $opportunity->stage instanceof OpportunityStage) {
                return;
            }

            $opportunity->status = $opportunity->stage->status();

            if ($opportunity->status === OpportunityStatus::Abierta) {
                $opportunity->closed_at = null;
            } elseif (! $opportunity->exists || $opportunity->isDirty('stage')) {
                $opportunity->closed_at = now();
            }
        };

        static::creating($syncStatus);
        static::updating($syncStatus);
    }

    /**
     * @return BelongsTo<Client, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    /**
     * @return BelongsTo<Property, $this>
     */
    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }

    /**
     * @return BelongsTo<Owner, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }
}
