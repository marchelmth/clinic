#!/bin/bash

echo "Menjalankan database migrations..."
php artisan migrate --force

echo "Memulai server Laravel..."
exec php artisan serve --host=0.0.0.0 --port=${PORT:-8000}
