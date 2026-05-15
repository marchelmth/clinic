<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

use function Laravel\Prompts\error;

class AuthController extends Controller
{
    // REGISTER
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required',
            'email' => 'required|email|unique:users',
            'password' => 'required|min:6'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error($validator->errors(), 400);
        }

        DB::beginTransaction();

        try {
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'role' => 'user'
            ]);

            
            $user->sendEmailVerificationNotification();

            DB::commit();

            return ApiResponse::success('Registration successful. Please check your email to verify your account.', [
                'user' => $user->only('id', 'name', 'email', 'role')
            ]);

        } catch (\Exception $e) {
            DB::rollBack();

            $errorMessage = 'Terjadi kesalahan pada sistem, silakan coba beberapa saat lagi.';

            if (str_contains($e->getMessage(), 'mail') || str_contains($e->getMessage(), 'Connection')) {
                $errorMessage = 'Gagal mengirimkan email verifikasi. Silakan periksa kembali email Anda atau coba lagi nanti.';
            } elseif (str_contains($e->getMessage(), 'Database') || $e instanceof \Illuminate\Database\QueryException) {
                $errorMessage = 'Gagal menyimpan data pendaftaran ke server.';
            }

            return ApiResponse::error(mb_convert_encoding($errorMessage, 'UTF-8'), 500);
        }
    }

    // LOGIN
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required'
        ]);

        if ($validator->fails()) {
            return ApiResponse::error( $validator->errors(), 400);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return ApiResponse::error('Email or password is incorrect', 401);
        }

        if ($user->email_verified_at === null) {
            return ApiResponse::error('Email Must Be Verified', 403);
        }

        $token = $user->createToken('auth_token')->plainTextToken;

        return ApiResponse::success('Login Successfully', [
            'token' => $token,
            'user' => $user->only('id', 'name', 'email', 'role')
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return ApiResponse::success('Successfully logged out');
    }
}
