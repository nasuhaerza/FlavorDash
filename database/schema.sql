-- ============================================================
-- FlavorDash — Supabase Schema
-- Project: https://jtgkqknuxcedihvefoyc.supabase.co
--
-- CARA PAKAI:
-- 1. Buka Supabase Dashboard → SQL Editor
-- 2. Paste seluruh file ini → klik Run
-- 3. Semua tabel, policy, dan seed data akan dibuat otomatis
-- ============================================================


-- ── 1. Drop tabel lama (jika ada) ────────────────────────────
drop table if exists public.order_items cascade;
drop table if exists public.orders      cascade;
drop table if exists public.foods       cascade;


-- ── 2. Tabel Foods ───────────────────────────────────────────
create table public.foods (
  id           text         primary key,
  name         text         not null,
  description  text,
  price        integer      not null,
  category     text         check (category in ('main','snack','drink','dessert','healthy')),
  image        text,
  rating       numeric(3,1) default 4.0,
  review_count integer      default 0,
  prep_time    text,
  calories     integer,
  badge        text         check (badge in ('new','popular','healthy','spicy') or badge is null),
  tags         text[]       default '{}',
  is_favorite  boolean      default false,
  created_at   timestamptz  default now()
);


-- ── 3. Tabel Orders ──────────────────────────────────────────
create table public.orders (
  id           text        primary key,
  user_id      uuid        references auth.users(id) on delete cascade,
  status       text        default 'pending'
                           check (status in ('pending','processing','delivered','cancelled')),
  address      text,
  note         text,
  delivery_fee integer     default 5000,
  date         date        default current_date,
  restaurant   jsonb,
  created_at   timestamptz default now()
);


-- ── 4. Tabel Order Items ─────────────────────────────────────
create table public.order_items (
  id        bigserial  primary key,
  order_id  text       references public.orders(id) on delete cascade,
  food_id   text       references public.foods(id)  on delete set null,
  name      text       not null,
  qty       integer    not null check (qty > 0),
  price     integer    not null
);


-- ── 5. Row Level Security ────────────────────────────────────
alter table public.foods       enable row level security;
alter table public.orders      enable row level security;
alter table public.order_items enable row level security;

-- Foods: semua orang bisa baca (katalog publik)
create policy "public_read_foods"
  on public.foods for select using (true);

-- Orders: user hanya bisa akses pesanannya sendiri
create policy "user_select_own_orders"
  on public.orders for select
  using (auth.uid() = user_id);

create policy "user_insert_own_orders"
  on public.orders for insert
  with check (auth.uid() = user_id);

create policy "user_update_own_orders"
  on public.orders for update
  using (auth.uid() = user_id);

-- Order items: mengikuti hak akses orders
create policy "user_select_own_order_items"
  on public.order_items for select
  using (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );

create policy "user_insert_own_order_items"
  on public.order_items for insert
  with check (
    exists (
      select 1 from public.orders
      where orders.id = order_items.order_id
        and orders.user_id = auth.uid()
    )
  );


-- ── 6. Seed Data Foods (12 item) ─────────────────────────────
insert into public.foods
  (id, name, description, price, category, image, rating, review_count, prep_time, calories, badge, tags, is_favorite)
values
  ('1',  'Nasi Goreng Spesial',
    'Nasi goreng dengan telur, ayam, sayur segar, dan bumbu rempah pilihan',
    25000, 'main',
    'https://images.unsplash.com/photo-1512058564366-18510be2db19?w=400&q=80',
    4.8, 234, '15 menit', 520, 'popular', array['pedas','nasi','ayam'], false),

  ('2',  'Mie Ayam Bakso',
    'Mie kenyal dengan ayam cincang, bakso sapi, dan kuah kaldu gurih',
    22000, 'main',
    'https://images.unsplash.com/photo-1569050467447-ce54b3bbc37d?w=400&q=80',
    4.6, 187, '12 menit', 480, 'new', array['mie','bakso','ayam'], true),

  ('3',  'Ayam Geprek Sambal',
    'Ayam crispy geprek dengan sambal bawang pedas nampol dan lalapan segar',
    28000, 'main',
    'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&q=80',
    4.9, 312, '18 menit', 650, 'popular', array['pedas','ayam','crispy'], false),

  ('4',  'Gado-Gado Jakarta',
    'Sayuran segar rebus dengan saus kacang kental, kerupuk, dan lontong',
    18000, 'healthy',
    'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
    4.5, 98, '10 menit', 320, 'healthy', array['vegetarian','kacang','sayur'], false),

  ('5',  'Pisang Goreng Crispy',
    'Pisang kepok goreng crispy dengan taburan gula halus dan keju parut',
    12000, 'snack',
    'https://images.unsplash.com/photo-1587132137056-bfbf0166836e?w=400&q=80',
    4.4, 156, '8 menit', 280, null, array['manis','goreng','pisang'], true),

  ('6',  'Es Teh Manis Jumbo',
    'Teh manis segar dengan es batu, pilihan teh premium',
    8000, 'drink',
    'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80',
    4.7, 421, '3 menit', 120, 'popular', array['dingin','manis','teh'], false),

  ('7',  'Es Alpukat Krim',
    'Alpukat segar blender dengan susu kental manis, es batu, dan sirup cokelat',
    18000, 'drink',
    'https://images.unsplash.com/photo-1623065422902-30a2d299bbe4?w=400&q=80',
    4.8, 178, '5 menit', 310, 'new', array['alpukat','dingin','susu'], false),

  ('8',  'Martabak Manis Spesial',
    'Martabak tebal lembut dengan isian cokelat, keju, dan kacang tanah',
    35000, 'dessert',
    'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80',
    4.9, 267, '20 menit', 720, 'popular', array['manis','cokelat','keju'], true),

  ('9',  'Soto Ayam Lamongan',
    'Soto ayam bening khas Lamongan dengan soun, telur, koya, dan sambal',
    20000, 'main',
    'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=400&q=80',
    4.7, 143, '10 menit', 380, null, array['soto','ayam','kuah'], false),

  ('10', 'Salad Bowl Sehat',
    'Campuran sayuran segar, quinoa, alpukat, tomat ceri dengan dressing lemon',
    32000, 'healthy',
    'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&q=80',
    4.6, 89, '7 menit', 290, 'healthy', array['vegetarian','sehat','segar'], false),

  ('11', 'Cireng Bumbu Rujak',
    'Cireng gurih renyah dengan cocolan bumbu rujak pedas asam segar',
    10000, 'snack',
    'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?w=400&q=80',
    4.3, 112, '8 menit', 240, null, array['cireng','pedas','goreng'], false),

  ('12', 'Es Krim Gelato Matcha',
    'Gelato premium rasa matcha Jepang dengan taburan red bean dan mochi',
    28000, 'dessert',
    'https://images.unsplash.com/photo-1615478503562-ec2d8aa0e24e?w=400&q=80',
    4.8, 198, '2 menit', 350, 'new', array['matcha','es krim','manis'], true)
on conflict (id) do update set
  name         = excluded.name,
  description  = excluded.description,
  price        = excluded.price,
  image        = excluded.image,
  rating       = excluded.rating,
  review_count = excluded.review_count,
  badge        = excluded.badge,
  tags         = excluded.tags;


-- ── 7. View untuk query pesanan lengkap ──────────────────────
create or replace view public.orders_with_items as
  select
    o.id,
    o.user_id,
    o.status,
    o.address,
    o.note,
    o.delivery_fee,
    o.date,
    o.restaurant,
    o.created_at,
    json_agg(
      json_build_object(
        'food_id', oi.food_id,
        'name',    oi.name,
        'qty',     oi.qty,
        'price',   oi.price
      )
    ) filter (where oi.id is not null) as items
  from public.orders o
  left join public.order_items oi on oi.order_id = o.id
  group by o.id, o.user_id, o.status, o.address, o.note,
           o.delivery_fee, o.date, o.restaurant, o.created_at;


-- ── Selesai ───────────────────────────────────────────────────
-- Tabel:  foods, orders, order_items
-- View:   orders_with_items
-- Policy: RLS aktif — user hanya bisa akses data miliknya
-- Seed:   12 item makanan
-- ─────────────────────────────────────────────────────────────
