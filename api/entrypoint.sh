#!/bin/bash

echo "Membersihkan cache..."
php artisan optimize:clear

echo "Running database migrations..."
php artisan migrate --force

echo "Starting Laravel server..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
