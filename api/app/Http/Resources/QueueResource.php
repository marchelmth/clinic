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
                'doctor' => $this->doctor ? [
                    'id' => $this->doctor->id,
                    'name' => $this->doctor->name,
                    'specialization' => $this->doctor->specialization,
                ] : null,
            ] : null,
        ];
    }
}
