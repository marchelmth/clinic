#!/bin/bash

echo "Menjalankan database migrations..."
php artisan migrate --force

exec apache2-foreground
