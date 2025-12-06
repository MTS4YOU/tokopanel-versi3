# Panduan Deployment Admin Panel

## Persyaratan

- Node.js 18+ atau lebih tinggi
- pnpm (atau npm/yarn)
- MongoDB database
- Environment variables yang dikonfigurasi

## Setup Lokal

### 1. Clone Repository

```bash
git clone https://github.com/MTS4YOU/tokopanel-versi3.git
cd tokopanel-versi3
```

### 2. Install Dependencies

```bash
pnpm install
# atau
npm install
```

### 3. Konfigurasi Environment Variables

Buat file `.env.local` di root directory:

```env
# MongoDB Configuration
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=tokopanel_admin

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 4. Jalankan Development Server

```bash
pnpm dev
# atau
npm run dev
```

Akses admin panel di: `http://localhost:3000/admin`

## Build untuk Production

```bash
pnpm build
# atau
npm run build
```

Hasil build akan tersimpan di folder `.next`

## Production Deployment

### Menggunakan Vercel

1. Push code ke GitHub
2. Pergi ke https://vercel.com
3. Import project dari repository
4. Set environment variables di Vercel dashboard:
   - `MONGODB_URI`
   - `MONGODB_DB_NAME`
   - `NEXTAUTH_URL` (URL production Anda)

5. Deploy dengan klik tombol Deploy

### Menggunakan Server Sendiri

1. Install Node.js 18+
2. Clone repository
3. Install dependencies: `pnpm install`
4. Build: `pnpm build`
5. Start server: `pnpm start`
6. Setup reverse proxy (nginx/apache) yang mengarah ke port 3000

## Fitur Admin Panel

### 📌 Pterodactyl Settings
- Domain Panel
- API Key
- Nests ID, Egg ID
- Location ID

### 📌 Aplikasi Settings
- Nama Host
- Link WhatsApp Group
- Minimal & Maksimal Fee
- Pengaturan Garansi

### 📌 Pembayaran Settings
- Payment Gateway API
- Email Configuration
- Telegram Bot

### 📌 Layanan Settings
- Media Sosial Links
- MongoDB Configuration

## API Endpoints

### GET /api/admin/settings
Mengambil semua pengaturan dari database

**Response:**
```json
{
  "_id": "app_config",
  "pterodactylConfig": { ... },
  "appConfig": { ... },
  "updatedAt": "2024-12-06T10:00:00.000Z"
}
```

### POST /api/admin/settings
Menyimpan/update pengaturan

**Request Body:**
```json
{
  "pterodactylConfig": { ... },
  "appConfig": { ... }
}
```

**Response:**
```json
{
  "success": true,
  "result": { "acknowledged": true, "modifiedCount": 1 }
}
```

## Error Handling

- Validasi environment variables di startup
- Error messages yang jelas untuk debugging
- Toast notifications untuk user feedback
- Unsaved changes warning

## Security Notes

- Jangan commit `.env.local` file
- Gunakan `.env.example` sebagai template
- Sensitive fields (API keys, passwords) menggunakan tipe input `password`
- Pastikan MongoDB URI aman dan credentials terlindungi

## Troubleshooting

### MongoDB Connection Error
```
MONGODB_URI environment variable is not defined
```
**Solusi:** Pastikan `.env.local` berisi `MONGODB_URI` yang valid

### Port 3000 Sudah Digunakan
**Solusi:** Gunakan port berbeda:
```bash
PORT=3001 pnpm dev
```

### Settings Tidak Tersimpan
- Periksa koneksi MongoDB
- Lihat browser console untuk error messages
- Pastikan MONGODB_URI benar

## Performance Tips

- Gunakan CDN untuk static assets
- Enable gzip compression di reverse proxy
- Setup caching strategy yang tepat
- Monitor database performance

## Support

Untuk pertanyaan atau issues, silakan buat issue di GitHub repository.
