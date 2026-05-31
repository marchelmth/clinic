<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Doctor;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Carbon\Carbon;

class DoctorController extends Controller
{
    public function index()
    {
        $daysMap = [
            'Senin' => 1,
            'Selasa' => 2,
            'Rabu' => 3,
            'Kamis' => 4,
            'Jumat' => 5,
            'Sabtu' => 6,
            'Minggu' => 7
        ];

        $todayNumber = Carbon::now()->dayOfWeekIso;

        $doctors = Doctor::with('schedules')->get()->filter(function ($doctor) use ($daysMap, $todayNumber) {
            $hasScheduleToday = false;

            foreach ($doctor->schedules as $schedule) {
                $range = explode(' - ', $schedule->date);

                if (count($range) === 2) {
                    $startDay = $daysMap[trim($range[0])] ?? 0;
                    $endDay = $daysMap[trim($range[1])] ?? 0;

                    if ($startDay > 0 && $endDay > 0 && $todayNumber >= $startDay && $todayNumber <= $endDay) {
                        $hasScheduleToday = true;
                        break;
                    }
                } elseif (count($range) === 1) {
                    $singleDay = $daysMap[trim($range[0])] ?? 0;
                    if ($singleDay === $todayNumber) {
                        $hasScheduleToday = true;
                        break;
                    }
                }
            }

            return $hasScheduleToday;
        })->values();

        if ($doctors->isEmpty()) {
            return ApiResponse::success("No doctors found for today", $doctors ,200);
        }

        return ApiResponse::success("Doctors retrieved successfully", $doctors, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'specialization' => 'nullable|string|max:255',
            'phone' => 'required|integer|min:9|unique:doctors,phone',
            'email' => 'required|email|unique:doctors,email',
            'room' => 'nullable|string|digits_between:1,3'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error("Validation failed", 422, $validator->errors());
        }

        $payload = $validator->validated();
        $doctor = Doctor::create($payload);

        if (!$doctor) {
            return ApiResponse::error("Failed to create doctor", 500);
        }

        if ($request->specialization === NULL) {
            $doctor->specialization = "Dokter Umum";
            $doctor->save();
        }

        return ApiResponse::success("Doctor created successfully", $doctor, 201);
    }

    public function show(Doctor $doctor)
    {
        if (!$doctor) {
            return ApiResponse::error("Doctor not found", 404);
        }
        return ApiResponse::success("Doctor retrieved successfully", $doctor, 200);
    }

    public function update(Request $request, Doctor $doctor)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'specialization' => 'string|max:255',
            'phone' => 'integer|min:9|unique:doctors,phone',
            'email' => 'email|unique:doctors,email',
            'schedule_id' => 'integer|exists:schedules,id',
            'room' => 'nullable|string|digits_between:1,3'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error("Validation failed", 422, $validator->errors());
        }

        $payload = $validator->validated();
        $doctor->update($payload);
        return ApiResponse::success("Doctor updated successfully", $doctor, 200);
    }

    public function destroy(Doctor $doctor)
    {
        $doctor->delete();
        if (!$doctor) {
            return ApiResponse::error("Failed to delete doctor", 500);
        }
        return ApiResponse::success("Doctor deleted successfully", $doctor->only('name'), 200);
    }
}
