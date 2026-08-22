<?php

namespace App\Models;

use App\Enums\LeadSource;
use App\Enums\LeadStatus;
use Database\Factories\LeadFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends Model
{
    /** @use HasFactory<LeadFactory> */
    use HasFactory;

    protected $fillable = [
        'name',
        'phone',
        'email',
        'source',
        'status',
        'agent_id',
        'converted_to_client_id',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'source' => LeadSource::class,
            'status' => LeadStatus::class,
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
     * @return BelongsTo<Client, $this>
     */
    public function convertedClient(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'converted_to_client_id');
    }
}
