<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QueueResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'reservation_id' => $this->reservation_id,
            'poli_code' => $this->poli_code,
            'queue_number' => $this->queue_number,
            'queue_code' => $this->queue_code,
            'status' => (bool) $this->status,
            'called_at' => $this->called_at,
            'served_at' => $this->served_at,

            'user' => ($this->reservation && $this->reservation->user) ? [
                'id' => $this->reservation->user->id,
                'name' => $this->reservation->user->name,
                'email' => $this->reservation->user->email,
            ] : null,

            'schedule' => ($this->reservation && $this->reservation->schedule) ? [
                'id' => $this->reservation->schedule->id,
                'date' => $this->reservation->schedule->date,
                'start_time' => $this->reservation->schedule->start_time,
                'end_time' => $this->reservation->schedule->end_time,
                'quota' => $this->reservation->schedule->quota,
                'doctor' => ($this->reservation->schedule->doctor) ? [
                    'id' => $this->reservation->schedule->doctor->id,
                    'name' => $this->reservation->schedule->doctor->name,
                    'specialization' => $this->reservation->schedule->doctor->specialization,
                ] : null,
            ] : null,
        ];
    }
}
