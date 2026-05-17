<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Mail;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Artisan::command('send-mail', function () {
    $to = (string) env('MAIL_TEST_TO', 'marchelmanullang1@gmail.com');

    Mail::raw('Congrats for sending test email with Mailtrap!', function ($message) use ($to) {
        $message->to($to)
            ->subject('You are awesome!');
    });

    $this->info("Test email sent via mailer [" . config('mail.default') . "] to {$to}");

    return self::SUCCESS;
})->purpose('Send test email via configured Laravel mailer');
