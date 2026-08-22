<?php

namespace App\Models;

use App\Enums\ListingType;
use App\Enums\PropertyStatus;
use App\Enums\PropertyType;
use Database\Factories\PropertyFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Property extends Model
{
    /** @use HasFactory<PropertyFactory> */
    use HasFactory;

    protected $fillable = [
        'code',
        'title',
        'description',
        'property_type',
        'listing_type',
        'status',
        'owner_id',
        'agent_id',
        'city',
        'zone',
        'address',
        'price',
        'admin_fee',
        'stratum',
        'bedrooms',
        'bathrooms',
        'parking_spots',
        'built_area',
        'private_area',
        'year_built',
        'features',
        'notes',
        'published_at',
    ];

    protected function casts(): array
    {
        return [
            'property_type' => PropertyType::class,
            'listing_type' => ListingType::class,
            'status' => PropertyStatus::class,
            'price' => 'decimal:2',
            'admin_fee' => 'decimal:2',
            'built_area' => 'decimal:2',
            'private_area' => 'decimal:2',
            'features' => 'array',
            'published_at' => 'date',
        ];
    }

    protected static function booted(): void
    {
        // Not concurrency-safe (max()+1 race under simultaneous writes); acceptable for the current single-writer SQLite setup.
        static::creating(function (Property $property): void {
            if (! $property->code) {
                $property->code = 'PROP-'.str_pad((string) (static::max('id') + 1), 5, '0', STR_PAD_LEFT);
            }
        });
    }

    /**
     * @return BelongsTo<Owner, $this>
     */
    public function owner(): BelongsTo
    {
        return $this->belongsTo(Owner::class);
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function agent(): BelongsTo
    {
        return $this->belongsTo(User::class, 'agent_id');
    }
}
