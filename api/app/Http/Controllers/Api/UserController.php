<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Helpers\ApiResponse;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

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

    public function profile(Request $request)
    {
        $user = $request->user();
        if (!$user) {
            return ApiResponse::error("User tidak terautentikasi", 401);
        }
        return ApiResponse::success("Data User", $user, 200);
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

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            Log::error('Failed sending verification email after user creation', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            return ApiResponse::success('User created successfully, but verification email failed to send', $user, 201);
        }

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
            'email' => [
                'email',
                Rule::unique('users')->ignore($user->id),
            ],
            'password' => 'nullable|string|min:8',
            'role' => 'nullable|string|in:admin,user'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error("Validation failed", 422, $validator->errors());
        }

        $payload = $validator->validated();

        if ($request->filled('password')) {
            $payload['password'] = Hash::make($payload['password']);
        } else {
            unset($payload['password']);
        }

        if ($request->filled('email') && $payload['email'] !== $user->email) {
            $user->email_verified_at = null;
            try {
                $user->sendEmailVerificationNotification();
            } catch (\Exception $e) {
                Log::error('Failed sending verification email after email update', [
                    'user_id' => $user->id,
                    'email' => $payload['email'],
                    'error' => $e->getMessage(),
                ]);
            }
        }

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
            return ApiResponse::success('Email Berhasil diverifikasi', [
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

        try {
            $user->sendEmailVerificationNotification();
        } catch (\Exception $e) {
            Log::error('Failed resending verification email', [
                'user_id' => $user->id,
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);

            return ApiResponse::error('Gagal mengirim ulang email verifikasi. Periksa konfigurasi email server.', 500);
        }

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
