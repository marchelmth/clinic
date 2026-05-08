<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Schedule extends Model
{
    protected $fillable = [
        'doctor_id',
        'date',
        'start_time',
        'end_time',
        'quota'
    ];

    protected $hidden = [
        'created_at',
        'updated_at'
    ];

    public function doctor()
    {
        return $this->belongsTo(Doctor::class);
    }
    public function reservations()
    {
        return $this->hasMany(Reservation::class);
    }
}
