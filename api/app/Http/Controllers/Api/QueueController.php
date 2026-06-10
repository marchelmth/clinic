<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Queue;
use Illuminate\Http\Request;
use App\Http\Resources\QueueResource;
use App\Helpers\ApiResponse;
use Carbon\Carbon;

class QueueController extends Controller
{
    public function index(Queue $queue, Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return ApiResponse::error("Unauthorized", 401);
        }

        $query = Queue::with(['reservation.user', 'reservation.schedule.doctor'])
            ->whereHas('reservation', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            });

        if ($request->filled('status')) {
            $query->where('status', filter_var($request->status, FILTER_VALIDATE_BOOLEAN));
        }

        if ($request->filled('date')) {
            $query->whereHas('reservation.schedule', function ($q) use ($request) {
                $q->where('date', $request->date);
            });
        }

        return ApiResponse::success(
            "Queues retrieved successfully",
            $queue->get(),
            200
        );
    }

    public function show(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return ApiResponse::error("Unauthenticated", 401);
        }
        $queue = Queue::with(['reservation.user', 'reservation.schedule.doctor'])
            ->whereHas('reservation', function ($q) use ($user) {
                $q->where('user_id', $user->id);
            })
            ->where('status', '=', 0)
            ->whereDate('created_at', Carbon::today())
            ->first();

        if (!$queue) {
            return ApiResponse::error("Anda tidak memiliki antrean aktif hari ini", 404);
        }

        return ApiResponse::success(
            "Queue retrieved successfully",
            new QueueResource($queue),
            200
        );
    }
    // COMPLETE queue -- Admin Only --
    public function completeQueue($id)
    {
        $queue = Queue::findOrFail($id);
        $queue->status = 1;
        $queue->served_at = now();
        $queue->save();

        return ApiResponse::success(
            "Queue marked as completed",
            new QueueResource($queue),
            200
        );
    }

    public function newQueue()
    {
        $queue = Queue::with(['reservation.user', 'reservation.schedule.doctor'])
            ->whereDate('created_at', Carbon::today())
            ->orderBy('created_at', 'DESC')
            ->limit(3)
            ->get();

        return ApiResponse::success(
            "New queues retrieved successfully",
            QueueResource::collection($queue),
            200
        );
    }
}
