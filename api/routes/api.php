<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\AuthController;

Route::apiResource('doctors', DoctorController::class);
Route::apiResource('schedules', ScheduleController::class);
Route::apiResource('reservations', ReservationController::class);
Route::get('/reservations', [ReservationController::class, 'index']);
Route::post('/reservations', [ReservationController::class, 'store']);
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);



Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

    // reservation (nanti pakai user login)
    Route::post('/reservations', [ReservationController::class, 'store']);
        Route::get('/reservations/{id}', [ReservationController::class, 'show']);
    Route::get('/reservations', [ReservationController::class, 'index']);
       //  tambahan baru
    Route::post('/reservations/{id}/approve', [ReservationController::class, 'approve']);
    Route::post('/reservations/{id}/reject', [ReservationController::class, 'reject']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);
    Route::get('/admin/reservations', [ReservationController::class, 'adminIndex']);
    Route::get('/admin/stats', [ReservationController::class, 'stats']);        

});