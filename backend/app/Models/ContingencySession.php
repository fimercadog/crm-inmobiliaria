<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContingencySession extends Model
{
    protected $fillable = [
        'enabled_modules',
        'activated_by',
        'activated_at',
        'deactivated_by',
        'deactivated_at',
        'status',
    ];

    protected function casts(): array
    {
        return [
            'enabled_modules' => 'array',
            'activated_at' => 'datetime',
            'deactivated_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function activatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'activated_by');
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function deactivatedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'deactivated_by');
    }

    /**
     * @return HasMany<ContingencyEvent, $this>
     */
    public function events(): HasMany
    {
        return $this->hasMany(ContingencyEvent::class);
    }
}
