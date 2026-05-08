<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'schedule_id',
        'status'
    ];

    // relasi ke schedule
    public function schedule()
    {
        return $this->belongsTo(Schedule::class);
    }

    // relasi ke user
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
