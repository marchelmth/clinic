<?php

namespace App\Providers;

use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        VerifyEmail::toMailUsing(function ($notifiable, string $url) {
            $parts = parse_url($url);
            $path = $parts['path'] ?? '';
            $query = isset($parts['query']) ? '?' . $parts['query'] : '';
            $env = env('APP_ENV');

            if ($env === "development") {
                $frontendUrl = rtrim("http://localhost:5173", '/');
            } else {
                $frontendUrl = rtrim(env('FRONTEND_URL'), '/');
            }

            if (preg_match('#/email/verify/([^/]+)/([^/]+)#', $path, $matches)) {
                $url = "{$frontendUrl}/verify-email/{$matches[1]}/{$matches[2]}{$query}";
            }

            return (new MailMessage)
                ->subject('Verify Your Email Address')
                ->line('Klik tombol di bawah untuk memverifikasi email akun Klinik Sehat Anda.')
                ->action('Verify Email Address', $url)
                ->line('Jika Anda tidak membuat akun ini, abaikan email ini.');
        });
    }
}