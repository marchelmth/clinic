<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Queue extends Model
{
    use HasApiTokens, HasFactory, Notifiable;
    
    protected $fillable = [
        'reservation_id',
        'queue_number',
        'status',
        'called_at',
        'served_at',
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public function reservation()
    {
        return $this->belongsTo(Reservation::class);
    }
}   