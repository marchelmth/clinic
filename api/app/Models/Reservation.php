<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Carbon\Carbon;

class Reservation extends Model
{
    protected $fillable = [
        'user_id',
        'schedule_id',
        'keluhan',
        'status'
    ];

    protected $appends = ['is_expired'];

    public function getIsExpiredAttribute()
    {
        $today = Carbon::today('Asia/Makassar');
        $reservationDate = Carbon::parse($this->created_at);
        return $reservationDate->lt($today);
    }

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
