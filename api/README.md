# Clinic API

Clinic API adalah backend Laravel untuk mengelola data dokter, jadwal, reservasi, dan autentikasi pengguna. Project ini sudah disiapkan dengan Docker Compose sehingga bisa dijalankan tanpa menginstall PHP dan MySQL langsung di komputer.

## Prasyarat

Pastikan sudah terinstall:

- Docker
- Docker Compose
- Git

Opsional jika ingin menjalankan asset frontend secara lokal:

- Node.js
- npm

## Menjalankan Project dengan Docker

### 1. Clone repository

```bash
git clone <url-repository>
cd clinic-api
```

Jika project sudah ada di komputer, cukup masuk ke folder project:

```bash
cd clinic-api
```

### 2. Buat file environment

```bash
cp .env.example .env
```

Ubah konfigurasi database di file `.env` menjadi:

```env
APP_NAME="Clinic API"
APP_URL=http://localhost:3000

DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=clinic
DB_USERNAME=root
DB_PASSWORD=root
```

### 3. Build dan jalankan container

```bash
docker compose up -d --build
```

Container yang akan berjalan:

- `clinic_app`: PHP-FPM dan Composer
- `clinic_nginx`: web server Nginx
- `clinic_db`: database MySQL
- `phpmyadmin`: database manager berbasis web

### 4. Install dependency Laravel

```bash
docker exec -it clinic_app composer install
```

### 5. Generate application key

```bash
docker exec -it clinic_app php artisan key:generate
```

### 6. Jalankan migration

```bash
docker exec -it clinic_app php artisan migrate
```

Jika ingin menjalankan ulang database dari awal:

```bash
docker exec -it clinic_app php artisan migrate:fresh
```

## Akses Aplikasi

Setelah semua langkah selesai, aplikasi bisa diakses di:

```text
http://localhost:3000
```

Endpoint API menggunakan prefix `/api`, contoh:

```text
http://localhost:3000/api/doctors
http://localhost:3000/api/schedules
http://localhost:3000/api/reservations
http://localhost:3000/api/register
http://localhost:3000/api/login
```

phpMyAdmin bisa diakses di:

```text
http://localhost:8080
```

Konfigurasi login phpMyAdmin:

```text
Server: db
Username: root
Password: root
Database: clinic
```

## Command yang Sering Dipakai

Melihat daftar container:

```bash
docker compose ps
```

Menjalankan server:

```bash
docker compose up -d
```

Menghentikan server:

```bash
docker compose down
```

Melihat log:

```bash
docker compose logs -f
```

Masuk ke container Laravel:

```bash
docker exec -it clinic_app bash
```

Menjalankan Artisan:

```bash
docker exec -it clinic_app php artisan <command>
```

Contoh:

```bash
docker exec -it clinic_app php artisan route:list
docker exec -it clinic_app php artisan migrate
docker exec -it clinic_app php artisan cache:clear
```

## Menjalankan Test

```bash
docker exec -it clinic_app php artisan test
```

## Build Asset Frontend

Jika project membutuhkan asset dari Vite, jalankan:

```bash
npm install
npm run build
```

Untuk mode development:

```bash
npm run dev
```

## Troubleshooting

Jika database belum terkoneksi, pastikan nilai `.env` sudah memakai `DB_HOST=db`, bukan `localhost`.

Jika dependency belum tersedia atau muncul error `vendor/autoload.php` tidak ditemukan, jalankan:

```bash
docker exec -it clinic_app composer install
```

Jika konfigurasi `.env` sudah diubah tetapi aplikasi masih membaca konfigurasi lama, jalankan:

```bash
docker exec -it clinic_app php artisan config:clear
docker exec -it clinic_app php artisan cache:clear
```

Jika port sudah digunakan, ubah mapping port di `docker-compose.yml`, misalnya `3000:80` atau `8080:80`.
