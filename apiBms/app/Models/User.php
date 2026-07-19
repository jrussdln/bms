<?php

namespace App\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    /** @use HasFactory<UserFactory> */
    use HasApiTokens, HasFactory, Notifiable;
    protected $table = 'userstbl';
    protected $primaryKey = 'nUserId'; // <-- add this
    public $timestamps = true;
    protected $fillable = [
        'nUserId',
        'strFName',
        'strMName',
        'strLName',
        'strEName',
        'strPhoneNumber',
        'strEmail',
        'strPassword',
        'cUserRole',
        'cCurrentStatus',
        'cAccountStatus',
        'strProfileImage',
        'dtLoggedIn',
        'dtLastSeen'
    ];
    protected $hidden = [
        'strPassword',
    ];

    // Computed full-name field so API responses/frontend keep working with `strName`
    protected $appends = ['strName'];

    public function getStrNameAttribute(): string
    {
        return trim(implode(' ', array_filter([
            $this->strFName,
            $this->strMName,
            $this->strLName,
        ])));
    }
    // Since you're using dtCreated/dtUpdated instead of Laravel's defaults
    const CREATED_AT = 'dtCreated';
    const UPDATED_AT = 'dtUpdated';
    const LOGGED_IN = 'dtloggedIn';
    const LAST_SEEN = 'dtLastSeen';
    protected function casts(): array
    {
        return [
            'strPassword' => 'hashed',
        ];
    }

    /**
     * Scope a query to only include users who are currently online.
     */
    public function scopeActiveNow($query)
    {
        return $query->where('cCurrentStatus', 'O');
    }

    /**
     * Scope a query to only include users whose account is enabled.
     */
    public function scopeEnabled($query)
    {
        return $query->where('cAccountStatus', 'A');
    }

    public function isActiveAccount(): bool
    {
        return $this->cAccountStatus === 'A';
    }

    public function isOnline(): bool
    {
        return $this->cCurrentStatus === 'O';
    }
}
