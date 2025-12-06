# 🚀 Deployment Checklist - Tokopanel V3

Panduan lengkap untuk melakukan deployment aplikasi Tokopanel V3 dengan sukses.

---

## ✅ Pre-Deployment Verification

### 1. Build Status
```bash
pnpm install
pnpm build
pnpm type-check
```
**Status:** ✅ Verified - Build succeeds, TypeScript clean, app ready

### 2. Production Build Output
```
Route (app)                                 Size  First Load JS    
├ ○ /                                    8.91 kB         177 kB
├ ○ /_not-found                            973 B         102 kB
├ ○ /admin                               15.6 kB         125 kB
├ ƒ /api/admin/backup                      147 B         101 kB
├ ƒ /api/admin/logs                        147 B         101 kB
├ ƒ /api/admin/settings                    147 B         101 kB
├ ƒ /api/stats                             147 B         101 kB
├ ○ /garansi                                4 kB         170 kB
├ ƒ /garansi/[id]                        6.33 kB         152 kB
├ ○ /history                             6.17 kB         160 kB
└ ƒ /invoice/[id]                        11.2 kB         168 kB
```

---

## 📋 Environment Variables Configuration

### Required Variables
Semua variable di bawah **WAJIB** dikonfigurasi sebelum deployment:

```env
# MongoDB (REQUIRED)
MONGODB_URI=mongodb+srv://user:password@cluster.mongodb.net/?retryWrites=true&w=majority
MONGODB_DB_NAME=tokopanel_admin

# Next.js
NODE_ENV=production
```

### Optional Variables (fallback ke hardcoded values di data/config.ts)
Jika tidak diset, aplikasi akan menggunakan konfigurasi yang ada di database atau fallback dari `data/config.ts`:

```env
# Pterodactyl Panel Configuration
PTERODACTYL_DOMAIN=https://your-panel.com
PTERODACTYL_API_KEY=ptla_xxxxxxxxxxxx

# Email/SMTP Configuration
EMAIL_HOST=mail.example.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
EMAIL_FROM=Tukang Panel <your-email@gmail.com>

# Payment Gateway (Sakurupiah)
PAYMENT_API_ID=ID-xxxxxxxx
PAYMENT_API_KEY=KEY-xxxxxxxx

# Telegram Bot
TELEGRAM_BOT_TOKEN=123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11
TELEGRAM_OWNER_ID=7015524549
```

---

## 🔐 Security Checklist

- [ ] **Sensitive Data**: Pastikan API keys, passwords, dan secrets ada di environment variables, **BUKAN** di dalam source code atau hardcoded values di `data/config.ts`.
  
- [ ] **Database**: Gunakan MongoDB Atlas dengan strong password dan IP whitelist yang ketat.

- [ ] **Email Credentials**: Gunakan "App Passwords" (bukan password Gmail biasa) jika menggunakan Gmail SMTP.

- [ ] **Pterodactyl API Key**: Generate baru API key di panel Pterodactyl Anda, jangan hardcode di repo.

- [ ] **Telegram Bot Token**: Pastikan token rahasia dan jangan expose di public repo.

- [ ] **.env.local**: File `.env.local` (jika ada) harus di `.gitignore` dan **TIDAK** di-commit ke Git.

---

## 🌍 Deployment Platforms

### Option 1: Vercel (Recommended)

#### Setup:
1. Fork/push repository ke GitHub
2. Buka https://vercel.com dan login dengan GitHub
3. Click "New Project" → Import repository Anda
4. Di **Environment Variables**, isi semua required vars dari `.env.example`:
   ```
   MONGODB_URI = mongodb+srv://...
   MONGODB_DB_NAME = tokopanel_admin
   NODE_ENV = production
   ```
5. Click "Deploy"

#### Post-Deployment:
```bash
# Verify deployment
curl https://your-app.vercel.app/

# Check logs in Vercel dashboard
# Settings → Environment Variables (dapat diupdate tanpa redeploy)
```

---

### Option 2: Docker (Self-hosted)

#### Dockerfile (create if not exists):
```dockerfile
FROM node:20-alpine

WORKDIR /app

# Copy files
COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

COPY . .

# Build
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

#### Build & Run:
```bash
docker build -t tokopanel-v3 .
docker run -e MONGODB_URI="mongodb+srv://..." -e MONGODB_DB_NAME="tokopanel_admin" -p 3000:3000 tokopanel-v3
```

---

### Option 3: Railway / Render / Fly.io

1. Connect Git repository
2. Add environment variables via platform UI
3. Deploy → Automatic builds & deploys on push

---

## 🔄 Post-Deployment Steps

1. **Health Check**:
   ```bash
   curl https://your-domain.com/
   # Should return 200 OK with HTML
   ```

2. **Admin Panel Access**:
   - Buka https://your-domain.com/admin
   - Login dan test settings save/load

3. **Create Test Transaction**:
   - Buka https://your-domain.com/
   - Buat dummy transaction untuk test invoice generation

4. **Monitor Logs**:
   - Vercel: Dashboard → Logs
   - Self-hosted: `docker logs <container_id>`

---

## 🐛 Troubleshooting

### Build Failed: "Module not found"
```bash
pnpm install
pnpm build
```

### MongoDB Connection Error
- [ ] Pastikan `MONGODB_URI` benar
- [ ] Check IP whitelist di MongoDB Atlas
- [ ] Verifikasi database credentials

### Email Not Sending
- [ ] Test SMTP dengan `pnpm test:email` (atau manual test via admin panel)
- [ ] Pastikan app password (bukan password Gmail biasa)
- [ ] Check firewall/port 587 open

### Pterodactyl API Error
- [ ] Verify `PTERODACTYL_API_KEY` di panel settings
- [ ] Check `PTERODACTYL_DOMAIN` URL
- [ ] Confirm Nests ID & Egg ID

---

## 📊 Application Info

- **Name**: Tokopanel V3
- **Version**: 1.0.0
- **Node.js**: ≥18 (recommended ≥20)
- **Package Manager**: pnpm
- **Framework**: Next.js 15.2.4
- **Database**: MongoDB

---

## 🎯 Summary

| Task | Status | Notes |
|------|--------|-------|
| Code Build | ✅ Pass | Compiled successfully |
| Type Check | ✅ Pass | No TypeScript errors |
| Dependencies | ✅ Locked | pnpm-lock.yaml committed |
| Security | ⚠️ Check | Ensure env vars set before deploy |
| Documentation | ✅ Done | This checklist + .env.example |

---

**Last Updated**: December 6, 2025  
**Ready for Production**: ✅ YES

Deploy dengan percaya diri! 🚀
