# 🍽️ FlavorDash

Aplikasi mobile katalog makanan modern dibangun dengan **React Native (Expo SDK 54)** menggunakan **Expo Router**, **Context API**, **Axios**, **JWT Authentication**, **Supabase**, **Camera**, dan **Maps**.

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js ≥ 18
- npm atau yarn
- [Expo Go](https://expo.dev/go) di perangkat Android/iOS

### Instalasi & Jalankan

```bash
git clone https://github.com/username/flavordash.git
cd flavordash
npm install
npx expo start
```

Scan QR code dengan **Expo Go**. Aplikasi langsung berjalan menggunakan data mock — **tidak perlu konfigurasi Supabase**.

---

## 🗄️ Integrasi Supabase (Opsional)

### Setup

1. Daftar di [supabase.com](https://supabase.com) → buat project baru
2. Salin **Project URL** dan **anon key** dari `Settings → API`

```bash
cp .env.example .env
# Edit .env:
# EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
```

3. Buka **Supabase → SQL Editor**, paste `database/schema.sql`, klik **Run**
4. Restart: `npx expo start --clear`

### Perilaku Fallback

| Kondisi | Data |
|---------|------|
| `.env` belum diisi | Mock lokal (`mockData.js`) — berjalan langsung |
| Supabase dikonfigurasi + online | Data real dari Supabase |
| Supabase dikonfigurasi + offline | Fallback otomatis ke data lokal |

### Arsitektur Supabase

```
services/
├── supabase.js              ← Supabase client
├── supabaseAuthService.js   ← Login/Register/Logout
└── supabaseFoodService.js   ← CRUD foods & orders

contexts/AuthContext.js      ← onAuthStateChange + persist session
hooks/useFoodCatalog.js      ← Fetch foods dari Supabase
hooks/useOrders.js           ← Fetch orders dari Supabase
database/schema.sql          ← SQL migration siap pakai
```

### Tabel Database

```
foods       — katalog makanan (12 item seed data)
orders      — pesanan per user
order_items — item dalam setiap pesanan
```

---

## 📁 Struktur Folder

```
flavordash/
├── app/
│   ├── (auth)/login.js        # Login
│   ├── (auth)/register.js     # Register
│   ├── (tabs)/home.js         # Beranda
│   ├── (tabs)/catalog.js      # Katalog + search + filter
│   ├── (tabs)/orders.js       # Riwayat pesanan (Supabase)
│   ├── (tabs)/profile.js      # Profil + ganti avatar kamera
│   ├── food/[id].js           # Detail makanan
│   ├── orders/[id].js         # Detail pesanan + Camera + Maps
│   ├── camera/index.js        # 📷 Kamera bukti pesanan
│   ├── maps/index.js          # 🗺️ Peta lokasi restoran
│   └── cart/index.js          # Keranjang belanja
│
├── components/
│   ├── cards/                 # FoodCard, FoodCardFeatured, OrderCard
│   ├── layout/                # Header, CategoryFilter
│   └── ui/                   # Badge, Button, EmptyState, InputField,
│                              # LoadingSpinner, ProtectedRoute
│
├── contexts/
│   ├── AuthContext.js         # JWT + Supabase Auth state
│   └── CartContext.js         # Keranjang belanja
│
├── hooks/
│   ├── useFoodCatalog.js      # Fetch katalog (Supabase/mock)
│   ├── useOrders.js           # Fetch pesanan (Supabase/mock)
│   ├── useCamera.js           # Camera permission + capture
│   ├── useLocation.js         # GPS via expo-location
│   ├── useDebounce.js         # Delay search input
│   └── useNotification.js    # Toast in-app
│
├── services/
│   ├── supabase.js            # Supabase client
│   ├── supabaseAuthService.js # Auth service
│   ├── supabaseFoodService.js # Food & Order service
│   ├── apiService.js          # Axios instance
│   └── foodService.js         # Legacy mock service
│
├── constants/
│   ├── Colors.js              # Palet warna
│   ├── mockData.js            # Data dummy fallback
│   └── api.js                 # Konfigurasi API
│
├── database/
│   └── schema.sql             # SQL migration Supabase
│
└── utils/
    ├── formatters.js          # Format harga, tanggal
    ├── jwtHelper.js           # JWT encode/decode/validate
    └── polyfills.js           # Buffer + URL polyfill
```

---

## 📦 Dependencies

| Package | Fungsi |
|---------|--------|
| `expo ~54` | Expo SDK |
| `expo-router ~6` | File-based navigation |
| `@supabase/supabase-js` | Database & Auth |
| `react-native-url-polyfill` | Polyfill URL untuk Supabase |
| `axios` | HTTP client |
| `@react-native-async-storage/async-storage` | Persist token |
| `expo-camera` | Kamera bukti pesanan |
| `react-native-maps` | Peta lokasi restoran |
| `expo-location` | GPS pengguna |
| `@expo/vector-icons` | Ionicons |

---

## 🔐 JWT Authentication

### Dua Mode

**Mode Mock (default — tanpa Supabase):**
- Login → `authService.signIn()` → validasi dari `MOCK_USERS`
- Token di-generate lokal, disimpan di `AsyncStorage`
- Token berlaku 2 jam

**Mode Supabase:**
- Login → `supabase.auth.signInWithPassword()`
- Session di-manage otomatis oleh Supabase SDK
- `onAuthStateChange` listener untuk refresh token

### Akun Login Dummy

| Email | Password | Mode |
|-------|----------|------|
| `user@flavordash.com` | `password123` | Mock & Supabase |
| `admin@flavordash.com` | `admin123` | Mock saja |

---

## 📷 Fitur Camera

- **Screen**: `app/camera/index.js`
- **Hook**: `hooks/useCamera.js`
- **Permission**: request otomatis sebelum kamera terbuka
- **Flow**: Detail Pesanan → Tap "Foto Bukti" → Kamera → Preview → Konfirmasi
- **Profile**: tap avatar untuk ganti foto via kamera (in-screen camera)

---

## 🗺️ Fitur Maps

- **Screen**: `app/maps/index.js`
- **Hook**: `hooks/useLocation.js`
- **Markers**: lokasi restoran FlavorDash (3 cabang Jakarta)
- **FAB**: tombol "Lokasi Saya" via `expo-location`
- **Callout**: popup nama & alamat restoran
- **Flow**: Detail Pesanan → Tap "Lihat Peta" → Maps dengan marker tujuan

---

## 🔄 Pull-to-Refresh

- **Home**: `RefreshControl` di ScrollView
- **Catalog**: `onRefresh` di FlatList
- **Orders**: `onRefresh` di FlatList
- Semua menggunakan hook `refresh()` yang abort request sebelumnya

---

## 📋 Changelog

### v2.0.0 — Supabase Integration
- ✅ Supabase Auth (email/password)
- ✅ Supabase Database (foods, orders, order_items)
- ✅ Row Level Security
- ✅ Fallback otomatis ke mock data
- ✅ `onAuthStateChange` untuk session management

### v1.0.0 — Initial Release
- ✅ Katalog makanan dengan FlatList responsif
- ✅ JWT Authentication stateless
- ✅ Camera — foto bukti penerimaan pesanan
- ✅ Maps — peta lokasi restoran
- ✅ Axios + custom hook useFoodCatalog
- ✅ Pull-to-refresh + search debounce + filter
- ✅ Cart management (Context API)

---

*FlavorDash — Pesan makanan favoritmu, kapanpun! 🍽️*
