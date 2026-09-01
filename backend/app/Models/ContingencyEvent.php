<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContingencyEvent extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'contingency_session_id',
        'type',
        'user_id',
        'payload',
        'created_at',
    ];

    protected function casts(): array
    {
        return [
            'payload' => 'array',
            'created_at' => 'datetime',
        ];
    }

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * @return BelongsTo<ContingencySession, $this>
     */
    public function session(): BelongsTo
    {
        return $this->belongsTo(ContingencySession::class, 'contingency_session_id');
    }
}
