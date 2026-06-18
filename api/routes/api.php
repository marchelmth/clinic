<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\DoctorController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ReservationController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\Api\QueueController;

Route::apiResource('users', UserController::class);
Route::get('/doctors/all', [DoctorController::class, 'GetAllDoctors']);
Route::apiResource('doctors', DoctorController::class);
Route::apiResource('schedules', ScheduleController::class);
Route::post('/register', [AuthController::class, 'register']);
Route::put('/update-email', [AuthController::class, 'updateEmail']);
Route::post('/email/verification-notification', [UserController::class, 'resendVerificationEmail']);
Route::get('/email/verify/{id}/{hash}', [UserController::class, 'verifyEmail'])
    ->middleware('signed')
    ->name('verification.verify');
Route::get('/email/verify-status', [UserController::class, 'verifyStatusVerificationEmail']);
Route::post('/login', [AuthController::class, 'login'])->name('login');

Route::get('/stats', [ReservationController::class, 'basicStats']);
Route::get('/new-queue', [QueueController::class, 'newQueue']);

Route::middleware('auth:sanctum')->group(function () {

    Route::get('/current-queue', [QueueController::class, 'currentQueueCode']);
    Route::get('/queues', [QueueController::class, 'show']);
    Route::get('/queue', [QueueController::class, 'index']);
    Route::get('/user', [UserController::class, 'profile']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/reservations', [ReservationController::class, 'getAllReservations']);
    Route::get('/reservation', [ReservationController::class, 'index']);
    Route::post('/reservations', [ReservationController::class, 'store']);
    Route::get('/reservation/user', [ReservationController::class, 'show']);
    Route::post('/reservations/{id}/cancel', [ReservationController::class, 'cancel']);

    Route::middleware('admin')->group(function () {
        Route::get('/admin/stats', [ReservationController::class, 'stats']);
        Route::post('/reservations/{id}/approve', [ReservationController::class, 'approve']);
        Route::post('/reservations/{id}/reject', [ReservationController::class, 'reject']);
        Route::get('/admin/reservations', [ReservationController::class, 'adminIndex']);
        Route::put('/queues/{id}/complete', [QueueController::class, 'completeQueue']);
        Route::delete('/schedule/{id}', [ScheduleController::class, 'destroy']);
    });
});
