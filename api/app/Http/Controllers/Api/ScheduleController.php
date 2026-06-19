<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Schedule;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Resources\ScheduleResource;

class ScheduleController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        if (!$user) {
            return ApiResponse::error("Unauthorized", 401);
        }

        $query = Schedule::with(['doctor']);

        $schedules = $query->paginate(5);

        return response()->json([
            'status' => 'success',
            'message' => 'Schedules retrieved successfully',
            'data' => ScheduleResource::collection($schedules),
            'meta' => [
                'current_page' => $schedules->currentPage(),
                'last_page' => $schedules->lastPage(),
                'total' => $schedules->total(),
                'per_page' => $schedules->perPage(),
            ]
        ], 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'required|exists:doctors,id',
            'date' => 'required|string',
            'start_time' => 'required|date_format:H:i',
            'end_time' => 'required|date_format:H:i|after:start_time',
            'quota' => 'required|integer|min:1',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error($validator->errors()->first(), 422);
        }

        $schedule = Schedule::create($request->all());
        return ApiResponse::success("Schedule created successfully", $schedule, 201);
    }

    public function show(Schedule $schedule)
    {
        return Schedule::with('doctor')->findOrFail($schedule->id);
    }

    public function update(Request $request, Schedule $schedule)
    {
        $validator = Validator::make($request->all(), [
            'doctor_id' => 'exists:doctors,id',
            'date' => 'string',
            'start_time' => 'date_format:H:i',
            'end_time' => 'date_format:H:i|after:start_time',
            'quota' => 'integer|min:1',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error($validator->errors()->first(), 422);
        }

        $schedule->update($request->all());
        return ApiResponse::success("Schedule updated successfully", $schedule, 200);
    }

    public function destroy($id)
    {
        $schedule = Schedule::find($id);

        if (!$schedule) {
            return ApiResponse::error("Schedule not found", 404);
        }

        $schedule->delete();

        return ApiResponse::success("Schedule deleted successfully", $schedule->only('date'), 200);
    }
}
