<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Doctor extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'specialization',
        'phone',
        'email',
        'status',
        'schedule_id',
        'room'
    ];

    protected $hidden = [
        'created_at',
        'updated_at',
    ];

    public function schedules()
    {
        return $this->hasMany(Schedule::class);
    }
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
