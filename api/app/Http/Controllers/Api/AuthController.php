<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Helpers\ApiResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

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

            DB::commit();

            try {
                $user->sendEmailVerificationNotification();

                return ApiResponse::success('Registrasi berhasil, silakan cek email Anda untuk memverifikasi akun', [
                    'user' => $user->only('id', 'name', 'email', 'role')
                ]);
            } catch (\Exception $mailException) {
                Log::error('Failed sending verification email after registration', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $mailException->getMessage(),
                ]);

                return ApiResponse::success('Registrasi berhasil, tetapi email verifikasi gagal dikirim. Silakan coba kirim ulang dari menu verifikasi email.', [
                    'user' => $user->only('id', 'name', 'email', 'role')
                ]);
            }
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

    // UPDATE EMAIL
    public function updateEmail(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email|unique:users',
        ]);

        if ($validator->fails()) {
            return ApiResponse::error($validator->errors(), 400);
        }

        DB::beginTransaction();

        try {
            $user = User::where('email', $request->email)->first();

            $user->email = $request->email;

            $user->save();

            DB::commit();

            try {
                $user->sendEmailVerificationNotification();

                return ApiResponse::success('Update email berhasil, silakan cek email Anda untuk memverifikasi akun', [
                    'user' => $user->only('id', 'name', 'email', 'role')
                ]);
            } catch (\Exception $mailException) {
                Log::error('Failed sending verification email after update email', [
                    'user_id' => $user->id,
                    'email' => $user->email,
                    'error' => $mailException->getMessage(),
                ]);

                return ApiResponse::success('Update email berhasil, tetapi email verifikasi gagal dikirim. Silakan coba kirim ulang dari menu verifikasi email.', [
                    'user' => $user->only('email')
                ]);
            }
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
            return ApiResponse::error($validator->errors(), 400);
        }
        $user = User::where('email', $request->email)->first();

        if (!$user) {
            return ApiResponse::error("Akun belum terdaftar, Buat akun terlebih dahulu", 404);
        }

        if (!Hash::check($request->password, $user->password)) {
            return ApiResponse::error('Email atau Passsword salah', 401);
        }

        if ($user->email_verified_at === null) {
            return ApiResponse::error('Email harus diverifikasi terlebih dahulu', 403);
        }

        $token = $user->createToken('auth_token', ['*'], now()->addHours(12))->plainTextToken;

        return ApiResponse::success('Login Berhasil', [
            'token' => $token,
            'user' => $user->only('id', 'name', 'email', 'role')
        ]);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->tokens()->delete();

        return ApiResponse::success('Logout Berhasil');
    }
}
