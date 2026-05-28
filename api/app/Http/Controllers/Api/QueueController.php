<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use Illuminate\Http\Request;
use App\Http\Resources\ReservationResource;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;

class QueueController extends Controller
{
    public function index(Request $request)
    {
        $query = Queue::with(['user', 'schedule.doctor'])
            ->where('user_id', $request->user()->id);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('date', $request->date);
            });
        }

        return ReservationResource::collection(
            $query->paginate(5)
        );
    }
}