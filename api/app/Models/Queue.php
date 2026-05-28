<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Queue extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $fillable = [
        'id_reservation',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class, 'id');
    }
}   