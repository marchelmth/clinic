<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReservationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'status' => $this->status,
            'created_at' => $this->created_at,

            'user' => $this->user ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null,

            'schedule' => $this->schedule ? [
                'id' => $this->schedule->id,
                'date' => $this->schedule->date,
                'start_time' => $this->schedule->start_time,
                'end_time' => $this->schedule->end_time,
                'quota' => $this->schedule->quota,

                'doctor' => $this->schedule->doctor ? [
                    'id' => $this->schedule->doctor->id,
                    'name' => $this->schedule->doctor->name,
                    'specialization' => $this->schedule->doctor->specialization,
                ] : null

            ] : null
        ];
    }
}