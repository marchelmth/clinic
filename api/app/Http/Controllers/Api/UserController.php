<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Helpers\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        if ($users->isEmpty()) {
            return ApiResponse::error("No users found", 404);
        }
        return ApiResponse::success("Users retrieved successfully", $users, 200);
    }

    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'role' => 'in:admin,user',
            'password' => 'required|string|min:8'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error("Validation failed", 422, $validator->errors());
        }

        $payload = $validator->validated();
        $user = User::create($payload);

        if (!$user) {
            return ApiResponse::error("Failed to create user", 500);
        }

        $user->sendEmailVerificationNotification();

        return ApiResponse::success("User created successfully", $user, 201);
    }

    public function show(User $user)
    {
        if (!$user) {
            return ApiResponse::error("User not found", 404);
        }
        return ApiResponse::success("User retrieved successfully", $user, 200);
    }

    public function update(Request $request, User $user)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'string|max:255',
            'email' => 'email|unique:users,email',
            'role' => 'in:admin,user',
            'password' => 'string|min:8'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error("Validation failed", 422, $validator->errors());
        }

        $payload = $validator->validated();
        $user->update($payload);
        return ApiResponse::success("User updated successfully", $user, 200);
    }

    public function destroy(User $user)
    {
        $user->delete();
        if (!$user) {
            return ApiResponse::error("Failed to delete user", 500);
        }
        return ApiResponse::success("User deleted successfully", $user->only('name'), 200);
    }

    public function verifyEmail(Request $request)
    {
        $user = User::find($request->route('id'));

        if (!$user) {
            return ApiResponse::error('User not found', 404);
        }

        if (!hash_equals((string) $request->route('hash'), sha1($user->getEmailForVerification()))) {
            return ApiResponse::error('Invalid verification link', 403);
        }

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::success('Email already verified', [
                'user' => $user->only('id', 'name', 'email', 'role')
            ]);
        }

        if ($user->markEmailAsVerified()) {
            event(new Verified($user));
        }

        return ApiResponse::success('Email verified successfully', [
            'user' => $user->only('id', 'name', 'email', 'role')
        ]);
    }

    public function resendVerificationEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validation failed', 422, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::success('Email already verified');
        }

        $user->sendEmailVerificationNotification();

        return ApiResponse::success('Verification email sent');
    }

    public function verifyStatusVerificationEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|exists:users,email',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error('Validation failed', 422, $validator->errors());
        }

        $user = User::where('email', $request->email)->first();

        if ($user->hasVerifiedEmail()) {
            return ApiResponse::success('Email already verified', [
                'verified' => true,
            ]);
        }

        return ApiResponse::success('Email not verified yet', [
            'verified' => false,
        ]);
    }
}
