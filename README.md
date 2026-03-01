# Avtojon — Transport/Logistika Boshqaruv Tizimi

Transport va logistika kompaniyalari uchun SaaS platforma. Haydovchilar, mashinalar va reyslarni boshqarish, moliyaviy hisob-kitob va real-vaqt GPS kuzatish.

## Tech Stack

- **Backend**: Node.js 20+ / Express.js
- **ORM**: Prisma (PostgreSQL)
- **Cache/Realtime**: Redis + Socket.io
- **Auth**: JWT (access 15min + refresh 7d)
- **Frontend**: React 18 + Vite + Tailwind CSS + Zustand

## O'rnatish

### 1. PostgreSQL + Redis (Docker)

```bash
docker-compose up -d
```

### 2. Server

```bash
cd server
npm install
cp .env.example .env
# .env faylida DATABASE_URL ni to'ldiring
npx prisma generate
npx prisma db push
npm run seed        # SuperAdmin yaratish
npm run dev
```

Server `http://localhost:5000` da ishlaydi.

### 3. Client

```bash
cd client
npm install
npm run dev
```

Client `http://localhost:5173` da ishlaydi.

## Default Login

```
SuperAdmin:
  username: superadmin
  password: SuperAdmin@2024!
```

## Foydalanuvchi rollari

| Rol | Kirish | Imkoniyatlar |
|-----|--------|--------------|
| SuperAdmin | /super-admin | Platformani boshqarish, biznesmenlar CRUD |
| Biznesmen | /dashboard | Haydovchilar, mashinalar, reyslar, moliya |
| Haydovchi | /driver | O'z reyslarini ko'rish, xarajat qo'shish |

## API

Server `http://localhost:5000/api` da:

- `POST /auth/login` — Barcha rollar uchun login
- `GET /auth/me` — Joriy foydalanuvchi
- `POST /auth/refresh` — Token yangilash
- `/api/drivers` — Haydovchilar
- `/api/vehicles` — Mashinalar
- `/api/flights` — Reyslar
- `/api/super-admin` — SuperAdmin panel

## Muhit o'zgaruvchilari

`.env.example` faylini ko'ring.
