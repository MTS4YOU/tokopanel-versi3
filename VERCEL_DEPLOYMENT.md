# Deployment ke Vercel

## Prerequisite
- GitHub repository sudah ter-setup
- Akun Vercel (https://vercel.com)
- MongoDB database sudah berjalan

## Step-by-Step Deployment

### 1. Push Code ke GitHub
```bash
git add -A
git commit -m "Siap untuk deployment ke Vercel"
git push origin main
```

### 2. Connect ke Vercel
1. Pergi ke https://vercel.com
2. Click "New Project"
3. Import repository dari GitHub (tokopanel-versi3)
4. Vercel akan auto-detect Next.js configuration

### 3. Setup Environment Variables di Vercel Dashboard

Di Vercel Dashboard, masukkan environment variables berikut:

```
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=tokopanel_admin
NEXTAUTH_URL=https://your-domain.vercel.app
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### 4. Deploy
1. Click "Deploy"
2. Vercel akan otomatis:
   - Install dependencies
   - Menjalankan build
   - Deploy ke production

### 5. Custom Domain (Optional)
1. Di Settings > Domains
2. Tambahkan domain custom
3. Configure DNS sesuai instruksi Vercel

## Konfigurasi File
- `vercel.json` - Konfigurasi Vercel deployment
- `.env.example` - Template environment variables
- `next.config.mjs` - Next.js configuration

## Troubleshooting

### Build Failed
- Pastikan MONGODB_URI benar
- Cek log di Vercel Dashboard
- Verifikasi semua environment variables tersetting

### Koneksi MongoDB Timeout
- Pastikan IP whitelist di MongoDB Atlas includes Vercel IPs
- Gunakan connection string yang stabil

### Admin Panel Error
- Cek NEXTAUTH_URL sudah sesuai dengan domain Vercel
- Clear browser cache dan refresh

## Monitoring

Setelah deployment sukses:
- Cek http://your-domain.vercel.app/admin
- Monitor logs di Vercel Dashboard
- Setup alerts untuk deployment errors

## Rollback

Jika ada issues:
1. Pergi ke Vercel Dashboard
2. Cari deployment sebelumnya yang sukses
3. Click "Promote to Production"

## Support

Untuk bantuan deployment lebih lanjut, hubungi tim support Vercel.
