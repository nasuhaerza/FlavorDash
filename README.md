# 🍽️ FlavorDash

Aplikasi mobile katalog makanan modern dibangun dengan **React Native (Expo SDK 54)** menggunakan **Expo Router**, **Context API**, **Axios**, **JWT Authentication**, **Camera**, dan **Maps**.

---

## 🚀 Cara Menjalankan

### Prasyarat
- Node.js ≥ 18
- npm atau yarn
- [Expo Go](https://expo.dev/go) di perangkat Android/iOS

### Instalasi

```bash
git clone https://github.com/username/flavordash.git
cd flavordash
npm install
```

### Jalankan dengan Expo Go

```bash
npx expo start
```

Scan QR code menggunakan aplikasi **Expo Go** di perangkat Anda.

> **Catatan:** Aplikasi ini dirancang untuk berjalan langsung di Expo Go **tanpa konfigurasi tambahan**. Semua fitur native (Camera, Maps) kompatibel dengan Expo Go SDK 54.

---

## 📁 Struktur Folder

```
flavordash/
├── app/                        # Expo Router — semua screen
│   ├── (auth)/                 # Grup autentikasi (tidak ada tab bar)
│   │   ├── _layout.js          # Auth layout + redirect jika sudah login
│   │   ├── login.js            # Halaman Login
│   │   └── register.js         # Halaman Registrasi
│   ├── (tabs)/                 # Grup tab utama (bottom navigation)
│   │   ├── _layout.js          # Tab layout + route protection
│   │   ├── home.js             # Beranda — banner, rekomendasi, populer
│   │   ├── catalog.js          # Katalog — FlatList + search + filter
│   │   ├── orders.js           # Riwayat pesanan
│   │   └── profile.js          # Profil pengguna
│   ├── food/[id].js            # Detail makanan (dynamic route)
│   ├── orders/[id].js          # Detail pesanan (protected + camera + maps)
│   ├── cart/index.js           # Keranjang belanja (modal)
│   ├── camera/index.js         # 📷 Kamera bukti pesanan
│   ├── maps/index.js           # 🗺️ Peta lokasi restoran
│   ├── _layout.js              # Root layout + providers
│   └── index.js                # Entry redirect
│
├── components/
│   ├── cards/
│   │   ├── FoodCard.js         # Kartu makanan (Flexbox horizontal)
│   │   ├── FoodCardFeatured.js # Kartu rekomendasi (vertikal)
│   │   └── OrderCard.js        # Kartu ringkasan pesanan
│   ├── layout/
│   │   ├── Header.js           # Header reusable dengan back button
│   │   └── CategoryFilter.js   # Filter kategori horizontal scroll
│   └── ui/
│       ├── Badge.js            # Badge label (New, Popular, dll)
│       ├── Button.js           # Tombol reusable (4 varian)
│       ├── EmptyState.js       # Tampilan kosong / error
│       ├── InputField.js       # Input dengan label, icon, validasi
│       └── LoadingSpinner.js   # Loading overlay
│
├── contexts/
│   ├── AuthContext.js          # JWT auth state — token, user, login, logout
│   └── CartContext.js          # Keranjang belanja state
│
├── hooks/
│   ├── useFoodCatalog.js       # Fetch katalog via Axios + loading/error/refresh
│   └── useCamera.js            # Kamera — permission, capture, preview
│
├── services/
│   ├── apiService.js           # Axios instance + JWT interceptor
│   ├── authService.js          # Mock API login/logout
│   └── foodService.js          # Fetch katalog, search, detail
│
├── constants/
│   ├── Colors.js               # Palet warna aplikasi
│   └── mockData.js             # Data dummy makanan, user, pesanan
│
├── utils/
│   ├── formatters.js           # Format harga, tanggal, kalkulasi
│   ├── jwtHelper.js            # Generate, decode, validasi JWT
│   └── polyfills.js            # Buffer polyfill untuk React Native
│
└── assets/images/              # Ikon dan splash screen
```

---

## 📦 Dependencies Utama

| Package | Versi | Fungsi |
|---------|-------|--------|
| `expo` | ~54.0.33 | Expo SDK |
| `expo-router` | ~6.0.23 | File-based navigation |
| `axios` | ^1.x | HTTP client untuk API |
| `@react-native-async-storage/async-storage` | 2.2.0 | Simpan token JWT |
| `expo-camera` | latest | Kamera untuk bukti pesanan |
| `react-native-maps` | 1.20.1 | Peta lokasi restoran |
| `expo-location` | ~19.0.8 | Lokasi GPS pengguna |
| `react-native-gesture-handler` | ~2.28.0 | Gesture support |
| `react-native-safe-area-context` | ~5.6.0 | Safe area insets |
| `@expo/vector-icons` | ^14.0.4 | Ionicons & icon pack |
| `buffer` | ^6.0.3 | Polyfill untuk JWT encoding |

---

## 🔐 JWT Authentication

### Cara Kerja

```
Login → Mock API → JWT Token → AsyncStorage → Auth Context
                                                    ↓
                                    Semua screen bisa cek isAuthenticated
```

1. User login dengan email + password
2. `authService.loginUser()` memverifikasi credentials dari `MOCK_USERS`
3. JWT token di-generate dengan payload `{ sub, name, email, avatar, exp }`
4. Token disimpan di `AsyncStorage` dengan key `@flavordash_token`
5. `AuthContext` menyediakan `isAuthenticated`, `user`, `login`, `logout`
6. Setiap request Axios otomatis menyertakan `Authorization: Bearer <token>`

### Struktur JWT

```
Header.Payload.Signature
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9
.eyJzdWIiOiJ1c3JfMDAxIiwibmFtZSI6IlVzZXIiLCJleHAiOjE3MjA0MzIwMDB9
.signature
```

### Route Protection

- **`/(tabs)/_layout.js`** — redirect ke login jika `!isAuthenticated`
- **`/orders/[id]`** — cek token valid, tampilkan alert jika expired
- **`/(auth)/_layout.js`** — redirect ke home jika sudah login

---

## 🔑 Akun Login Dummy

| Role | Email | Password |
|------|-------|----------|
| User | `user@flavordash.com` | `password123` |
| Admin | `admin@flavordash.com` | `admin123` |

---

## 📷 Fitur Camera

### Implementasi

File: `app/camera/index.js` + `hooks/useCamera.js`

**Flow penggunaan:**

```
Detail Pesanan → Tap "Foto Bukti" → Request Permission
                                          ↓
                                   Permission Granted?
                                   ├── Ya → Buka CameraView
                                   └── Tidak → Tampilkan UI izin
                                          ↓
                               Tap Shutter → takePictureAsync()
                                          ↓
                               Preview Foto → "Gunakan" / "Ulangi"
```

**Permission handling:**
- iOS: `NSCameraUsageDescription` di `app.json`
- Android: `CAMERA` permission di `app.json`
- UI fallback jika permission ditolak dengan tombol request ulang

---

## 🗺️ Fitur Maps

### Implementasi

File: `app/maps/index.js`

**Fitur:**
- Tampilkan peta dengan `react-native-maps`
- Marker lokasi restoran FlavorDash (3 cabang)
- Marker tujuan pengiriman (dari params pesanan)
- Callout popup berisi nama & alamat restoran
- Legend warna marker
- Koordinat default: Monas, Jakarta Pusat (-6.1754, 106.8272)

**Cara membuka dari pesanan:**
```
Detail Pesanan → Tap "Lihat Peta" → router.push('/maps', { lat, lng, name, address })
```

**Koordinat Restoran:**
| Cabang | Koordinat |
|--------|-----------|
| Kitchen Pusat | -6.1754, 106.8272 |
| Cabang Selatan | -6.2088, 106.8456 |
| Cabang Barat | -6.1945, 106.7891 |

---

## 🌐 Konfigurasi Mock API

Aplikasi menggunakan **Mock API** berbasis data lokal dengan simulasi network delay.

### Base URL
```
https://jsonplaceholder.typicode.com  (untuk health check)
```

### Flow Axios
```
useFoodCatalog() → foodService.fetchFoodCatalog()
    ↓
    Simulasi delay 500ms
    ↓
    Return FOOD_ITEMS dari mockData.js
    ↓
    Jika gagal → fallback ke data lokal
```

### Mengganti ke API Real

Edit `services/apiService.js`:
```js
export const BASE_URL = 'https://api.flavordash.com/v1';
```

Edit `services/foodService.js`:
```js
// Ganti fungsi fetchFoodCatalog:
const response = await api.get('/foods', { signal });
return { data: response.data, total: response.data.length, source: 'api' };
```

---

## 📱 Fitur Responsif

- Menggunakan `flex`, `%`, `aspectRatio` — tidak ada pixel tetap
- `Dimensions.get('window')` untuk lebar dinamis
- `SafeAreaView` / `useSafeAreaInsets` untuk notch & navigation bar
- `Platform.OS` untuk perbedaan iOS/Android
- Banner width: `width - 32` (selalu muat di semua layar)
- FoodCard image: `width: '32%'` dengan `aspectRatio: 0.85`

---

## 🏗️ Arsitektur

```
┌─────────────────────────────────────┐
│          Expo Router (app/)          │  ← Navigasi + Screens
├─────────────────────────────────────┤
│     Context API (AuthContext,        │  ← Global State
│     CartContext)                     │
├─────────────────────────────────────┤
│     Custom Hooks (useFoodCatalog,    │  ← Business Logic
│     useCamera)                       │
├─────────────────────────────────────┤
│     Services (apiService,            │  ← Data Layer (Axios)
│     foodService, authService)        │
├─────────────────────────────────────┤
│     Constants + Utils                │  ← Shared Helpers
└─────────────────────────────────────┘
```

---

## 🔄 Pull-to-Refresh

Tersedia di:
- **Home** (`app/(tabs)/home.js`) — `RefreshControl` di ScrollView
- **Catalog** (`app/(tabs)/catalog.js`) — `onRefresh` di FlatList

Kedua menggunakan `useFoodCatalog().refresh()` yang:
1. Abort request sebelumnya
2. Set `refreshing: true`
3. Re-fetch data
4. Handle error dengan fallback lokal

---

## 🛠️ Git Setup

```bash
git init
git add .
git commit -m "feat: initial FlavorDash app with Camera, Maps, JWT, Axios"
git remote add origin https://github.com/username/flavordash.git
git push -u origin main
```

### .gitignore sudah mencakup:
- `node_modules/`
- `.expo/`
- `*.log`
- `.env`

---

## 📋 Changelog

### v1.0.0
- ✅ Katalog makanan dengan FlatList responsif
- ✅ JWT Authentication (stateless, AsyncStorage)
- ✅ Route Protection (Expo Router)
- ✅ Camera — foto bukti penerimaan pesanan
- ✅ Maps — peta lokasi restoran
- ✅ Axios + custom hook useFoodCatalog
- ✅ Pull-to-refresh + search + filter kategori
- ✅ Cart management (Context API)
- ✅ Clean Architecture + reusable components

---

*FlavorDash — Pesan makanan favoritmu, kapanpun! 🍽️*
