<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use App\Models\Schedule;
use Illuminate\Http\Request;
use App\Http\Resources\ReservationResource;
use App\Helpers\ApiResponse;

class ReservationController extends Controller
{
    // GET semua reservation (punya user login + filter)
    public function index(Request $request)
    {
        $query = Reservation::with(['user', 'schedule.doctor'])
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

    // GET detail reservation
    public function show($id, Request $request)
    {
        $reservation = Reservation::with(['user', 'schedule.doctor'])
            ->where('user_id', $request->user()->id)
            ->findOrFail($id);

        return new ReservationResource($reservation);
    }

    // CREATE reservation
    public function store(Request $request)
    {
        $request->validate([
            'schedule_id' => 'required|exists:schedules,id|integer'
        ]);

        $schedule = Schedule::findOrFail($request->schedule_id);

        // cek kuota
        if ($schedule->reservations()
            ->whereIn('status', ['pending', 'approved'])
            ->count() >= $schedule->quota) {

            return response()->json([
                'message' => 'Kuota penuh'
            ], 400);
        }

        // cek double booking
        $alreadyBooked = Reservation::where('user_id', $request->user()->id)
            ->where('schedule_id', $schedule->id)
            ->exists();

        if ($alreadyBooked) {
            return response()->json([
                'message' => 'Anda sudah booking jadwal ini'
            ], 400);
        }

        $reservation = Reservation::create([
            'user_id' => $request->user()->id,
            'schedule_id' => $schedule->id,
            'status' => 'pending'
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

        if (in_array($reservation->status, ['approved', 'cancelled'])) {
            return response()->json([
                'message' => 'Tidak bisa approve'
            ], 400);
        }

        $schedule = $reservation->schedule;

        if ($schedule->reservations()
            ->where('status', 'approved')
            ->count() >= $schedule->quota) {

            return response()->json([
                'message' => 'Kuota penuh'
            ], 400);
        }

        $reservation->update(['status' => 'approved']);

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