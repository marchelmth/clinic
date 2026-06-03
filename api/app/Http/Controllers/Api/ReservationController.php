<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Schedule;
use App\Models\Queue;
use Illuminate\Http\Request;
use App\Http\Resources\ReservationResource;
use App\Helpers\ApiResponse;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class ReservationController extends Controller
{
    public function index(Request $request)
    {
        $query = Reservation::with(['user', 'schedule.doctor', 'queue']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('date', $request->date);
            });
        }

        $reservations = $query->paginate(5);

        return response()->json([
            'status' => 'success',
            'message' => 'Reservations retrieved successfully',
            'data' => ReservationResource::collection($reservations),
            'meta' => [
                'current_page' => $reservations->currentPage(),
                'last_page' => $reservations->lastPage(),
                'per_page' => $reservations->perPage(),
                'total' => $reservations->total(),
            ]
        ], 200);
    }

    // GET detail reservation
    public function show($id, Request $request)
    {
        $reservation = Reservation::with(['user', 'schedule.doctor', 'queue'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return new ReservationResource($reservation);
    }

    // CREATE reservation
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'schedule_id' => 'required|exists:schedules,id|integer',
            'keluhan' => 'nullable|string|max:255'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error($validator->errors(), 400);
        }

        $schedule = Schedule::findOrFail($request->schedule_id);

        // cek kuota
        // if ($schedule->reservations()
        //     ->whereIn('status', ['pending', 'approved'])
        //     ->count() >= $schedule->quota) {

        //     return response()->json([
        //         'message' => 'Kuota penuh'
        //     ], 400);
        // }

        // cek double booking
        $alreadyBooked = Reservation::where('user_id', $request->user()->id)
            ->where('schedule_id', $schedule->id)
            ->whereNotIn('status', ['rejected', 'cancelled'])
            ->get()
            ->filter(function ($reservation) {
                return !$reservation->is_expired;
            })
            ->isNotEmpty();

        if ($alreadyBooked) {
            return response()->json([
                'message' => 'Anda sudah booking jadwal ini'
            ], 400);
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'schedule_id' => $schedule->id,
            'status' => 'pending',
            'keluhan' => $request->keluhan
        ]);

        return ApiResponse::success(
            new ReservationResource($reservation),
            'Reservation berhasil dibuat',
            201
        );
    }

    // APPROVE (ADMIN ONLY - pakai middleware)
    public function approve(Request $request, $id)
    {
        $reservation = Reservation::with('schedule')->findOrFail($id);

        // if (in_array($reservation->status, ['approved', 'cancelled', 'pending'])) {
        //     return response()->json([
        //         'message' => 'Tidak bisa approve'
        //     ], 400);
        // }

        $schedule = $reservation->schedule()->with('doctor')->first();

        $poliName = $schedule->doctor->specialization;

        $policode = match (strtolower($poliName)) {
            'tulang' => 'TLNG',
            'umum' => 'UMUM',
            'gigi' => 'GIGI',
            'anak' => 'ANAK',
            'mata' => 'MATA',
            'telinga hidung tenggorokan (THT)' => 'THT',
            default => 'UMUM'
        };

        // if (
        //     $schedule->reservations()
        //     ->where('status', 'approved')
        //     // ->count() >= $schedule->quota
        // ) {

        //     return response()->json([
        //         'message' => 'Kuota penuh'
        //     ], 400);
        // }

        $reservation->update(['status' => 'approved']);

        $lastQueueNumber = Queue::where('poli_code', $policode)
            ->whereHas('reservation.schedule', function ($q) use ($schedule) {
                $q->where('date', $schedule->date);
            })
            ->max('queue_number');

        $nextNumber = ($lastQueueNumber ?? 0) + 1;

        $queueCode = $policode . str_pad($nextNumber, 3, '0', STR_PAD_LEFT);

        Queue::create([
            'reservation_id' => $reservation->id,
            'poli_code' => $policode,
            'queue_number' => $nextNumber,
            'queue_code' => $queueCode,
            'status' => false,
            'called_at' => Carbon::now()
        ]);

        return response()->json([
            'message' => 'Berhasil approve',
            'data' => new ReservationResource($reservation)
        ]);
    }

    // REJECT (ADMIN ONLY - pakai middleware)
    public function reject(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        if (in_array($reservation->status, ['rejected', 'cancelled'])) {
            return response()->json([
                'message' => 'Tidak bisa reject'
            ], 400);
        }

        $reservation->update(['status' => 'rejected']);

        return response()->json([
            'message' => 'Berhasil reject',
            'data' => new ReservationResource($reservation)
        ]);
    }

    // CANCEL (USER ONLY)
    public function cancel(Request $request, $id)
    {
        $reservation = Reservation::findOrFail($id);

        if ($reservation->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Bukan milik anda'
            ], 403);
        }

        if ($reservation->status !== 'pending') {
            return response()->json([
                'message' => 'Hanya bisa cancel status pending'
            ], 400);
        }

        $reservation->update(['status' => 'cancelled']);

        return response()->json([
            'message' => 'Berhasil cancel',
            'data' => new ReservationResource($reservation)
        ]);
    }

    // ADMIN: lihat semua reservation
    public function adminIndex(Request $request)
    {
        $query = Reservation::with(['user', 'schedule.doctor']);

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('date')) {
            $query->whereHas('schedule', function ($q) use ($request) {
                $q->where('date', $request->date);
            });
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        return ReservationResource::collection(
            $query->latest()->paginate(10)
        );
    }

    // ADMIN: statistik
    public function stats()
    {
        return response()->json([
            'total' => Reservation::count(),
            'pending' => Reservation::where('status', 'pending')->count(),
            'approved' => Reservation::where('status', 'approved')->count(),
            'rejected' => Reservation::where('status', 'rejected')->count(),
            'cancelled' => Reservation::where('status', 'cancelled')->count(),
            'today' => Reservation::whereDate('created_at', now())->count()
        ]);
    }
}
