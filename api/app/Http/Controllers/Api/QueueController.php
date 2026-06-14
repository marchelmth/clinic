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
    public function index(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return ApiResponse::error("Unauthorized", 401);
        }

        $query = Queue::with(['reservation.user', 'reservation.schedule.doctor']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereHas('reservation.schedule', function ($q) use ($request) {
                $q->where('date', $request->date);
            });
        }

        $queue = $query->paginate(5);

        return response()->json([
            'status' => 'success',
            'message' => 'Queues retrieved successfully',
            'data' => QueueResource::collection($queue),
            'meta' => [
                'current_page' => $queue->currentPage(),
                'last_page' => $queue->lastPage(),
                'total' => $queue->total(),
                'per_page' => $queue->perPage(),
            ]
        ], 200);
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

    public function currentQueueCode()
    {
        $polis = Queue::whereDate('created_at', Carbon::today())
            ->select('poli_code')
            ->distinct()
            ->pluck('poli_code');

        $result = [];

        foreach ($polis as $poli) {
            $waitingCount = Queue::where('poli_code', $poli)
                ->where('status', 0)
                ->whereDate('created_at', Carbon::today())
                ->count();

            // Antrean yang sedang/terakhir dilayani
            $currentQueue = Queue::where('poli_code', $poli)
                ->whereDate('created_at', Carbon::today())
                ->where('status', 1)
                ->orderBy('updated_at', 'desc')
                ->first();

            // Jika belum ada yang dilayani, tampilkan antrean pertama hari ini
            if (!$currentQueue) {
                $currentQueue = Queue::where('poli_code', $poli)
                    ->whereDate('created_at', Carbon::today())
                    ->where('status', 0)
                    ->orderBy('queue_number', 'asc')
                    ->first();
            }

            $currentNumber = $currentQueue ? $currentQueue->queue_code : '-';

            // Mapping nama poli
            $namaPoli = match ($poli) {
                'TLNG' => 'Poli Tulang',
                'UMUM' => 'Poli Umum',
                'GIGI' => 'Poli Gigi',
                'ANAK' => 'Poli Anak',
                'MATA' => 'Poli Mata',
                'THT' => 'Poli THT',
                default => 'Poli ' . $poli
            };

            $result[] = [
                'name' => $namaPoli,
                'current_number' => $currentNumber,
                'waiting' => $waitingCount
            ];
        }

        return ApiResponse::success(
            "Current queues retrieved successfully",
            $result,
            200
        );
    }
}
