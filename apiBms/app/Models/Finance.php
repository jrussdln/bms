<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Finance extends Model
{
    use HasFactory;

    protected $table = 'financetbl';
    public $timestamps = false;
    protected $primaryKey = 'nRecordsId';

    protected $fillable = [
        'nUserId',
        'strTitle',
        'cCategory',
        'cType',
        'dAmount',
        'strNote',
        'dtOccur',
    ];

    protected $casts = [
        'dAmount' => 'decimal:2',
        'dtOccur' => 'date',
    ];

    public function getRouteKeyName()
    {
        return 'nRecordsId';
    }

    public function user()
    {
        return $this->belongsTo(User::class, 'nUserId', 'nUserId');
    }
}