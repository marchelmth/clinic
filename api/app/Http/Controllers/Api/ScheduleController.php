<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class ScheduleController extends Controller
{
    public function index()
    {   
        $schedules = Schedule::with('doctor')->get();
        if ($schedules->isEmpty()) {
            return ApiResponse::error("No schedules found", 404);
        }
        return ApiResponse::success("Schedules retrieved successfully", $schedules, 200);
    }

    public function store(Request $request)
    {   
        Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'day' => 'required|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ])->validate();
        $schedule = Schedule::create($request->all());
        return ApiResponse::success("Schedule created successfully", $schedule, 201);
    }

    public function show(Schedule $schedule)
    {
        return Schedule::with('doctor')->findOrFail($schedule->id);
    }

    public function update(Request $request, Schedule $schedule)
    {
        Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
        ])->validate();

        if (!validator()) {
            return ApiResponse::error("Validation failed", 422);
        }

        $schedule->update($request->all());
        return ApiResponse::success("Schedule updated successfully", $schedule, 200);
    }
}
