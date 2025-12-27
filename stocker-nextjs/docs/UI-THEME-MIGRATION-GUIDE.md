# Stocker UI Theme Migration Guide

## CRM Modülü UI Tema Standardı

Bu rehber, CRM modülünde uygulanan modern Enterprise-grade UI temasını diğer modüllere uygulamak için detaylı bir kılavuz sağlar.

---

## 1. Tasarım Felsefesi

### 1.1 İlham Kaynakları
CRM modülü aşağıdaki modern SaaS uygulamalarından ilham alır:
- **Linear** - Minimal, monokrom, temiz
- **Stripe Dashboard** - Profesyonel, veri odaklı
- **Vercel** - Modern, beyaz-gri-siyah
- **Raycast** - İnce border'lar, subtle shadow'lar

### 1.2 Temel Prensipler
| Prensip | Açıklama |
|---------|----------|
| **Monokrom Renk Paleti** | Slate tonları (slate-50 → slate-900) temel renk skalası |
| **Minimal Accent** | Renk sadece ikonlarda ve duruma göre (emerald, amber, blue) |
| **Beyaz Kartlar** | `bg-white` arka plan, `border-slate-200` ince border |
| **Subtle Shadows** | Hover durumunda `hover:shadow-sm`, kalıcı shadow yok |
| **Temiz Tipografi** | `text-slate-900` başlıklar, `text-slate-500` açıklamalar |

---

## 2. Renk Sistemi

### 2.1 Birincil Renkler (Zorunlu)

```css
/* Arka Planlar */
bg-slate-50      /* Sayfa arka planı */
bg-white         /* Kart arka planı */
bg-slate-100     /* İkon arka planı, secondary areas */

/* Metin */
text-slate-900   /* Ana başlıklar, değerler */
text-slate-700   /* İkincil başlıklar */
text-slate-600   /* Gövde metni */
text-slate-500   /* Açıklamalar, label'lar */
text-slate-400   /* Placeholder, devre dışı */

/* Border'lar */
border-slate-200 /* Kart border'ları */
border-slate-300 /* Hover border'ları */
border-slate-100 /* İç bölücüler (divider) */
```

### 2.2 Durum Renkleri (Sadece Gösterge)

```css
/* Pozitif/Başarı */
bg-emerald-500   /* Küçük durum noktası (w-2 h-2) */
text-emerald-600 /* Pozitif değerler */

/* Uyarı */
bg-amber-500     /* Uyarı noktası */
text-amber-600   /* Uyarı değerleri */

/* Mavi/Bilgi */
bg-blue-500      /* Bilgi noktası */
text-blue-600    /* Link tarzı değerler */

/* Hata/Kritik - Minimal kullanım */
text-red-600     /* Sadece kritik hatalar */
```

### 2.3 Buton Renkleri

```css
/* Birincil Buton */
bg-slate-900 text-white hover:bg-slate-800

/* İkincil Buton */
bg-white text-slate-700 border-slate-300 hover:bg-slate-50

/* Ghost Buton */
text-slate-600 hover:bg-slate-100

/* Danger Buton */
bg-red-600 text-white hover:bg-red-700
```

---

## 3. Bileşen Standartları

### 3.1 PageContainer (Sayfa Kabı)

```tsx
import { PageContainer } from '@/components/patterns';

<PageContainer maxWidth="7xl">
  {/* Sayfa içeriği */}
</PageContainer>
```

**CSS Eşdeğeri:**
```css
.page-container {
  @apply min-h-screen bg-slate-50 px-6 py-8 max-w-7xl mx-auto;
}
```

### 3.2 Sayfa Başlığı

```tsx
// Modern CRM tarzı başlık
<div className="mb-8">
  <div className="flex items-center justify-between">
    <div>
      <h1 className="text-2xl font-semibold text-slate-900">Sayfa Başlığı</h1>
      <p className="text-sm text-slate-500">Sayfa açıklaması</p>
    </div>
    <Link href="/module/new">
      <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
        <PlusIcon className="w-4 h-4" />
        Yeni Ekle
      </button>
    </Link>
  </div>
</div>
```

### 3.3 KPI/Stat Kartları

#### Navigasyon + KPI Kart Deseni (CRM Ana Sayfa)

```tsx
<Link href="/module/items">
  <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
    {/* Üst Kısım: İkon + Ok */}
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
        <ItemIcon className="w-4 h-4 text-slate-500" />
      </div>
      <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
    </div>

    {/* Değer */}
    <div className="text-2xl font-semibold text-slate-900 mb-1">
      {value.toLocaleString('tr-TR')}
    </div>

    {/* Etiket */}
    <div className="text-sm text-slate-500">{label}</div>
  </div>
</Link>
```

#### Metrik Kartı (Durum Göstergeli)

```tsx
<div className="bg-white border border-slate-200 rounded-xl p-5">
  {/* Durum Noktası + Etiket */}
  <div className="flex items-center gap-2 mb-3">
    <div className="w-2 h-2 rounded-full bg-emerald-500" />
    <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
      Aktif
    </span>
  </div>

  {/* Değer */}
  <div className="text-2xl font-semibold text-slate-900">
    {value.toLocaleString('tr-TR')}
  </div>

  {/* Açıklama */}
  <div className="text-sm text-slate-500">Aktif Müşteri</div>
</div>
```

### 3.4 Kart Bileşeni

#### Temel Kart

```tsx
<div className="bg-white border border-slate-200 rounded-lg">
  {/* Kart içeriği */}
</div>
```

#### Başlıklı Kart

```tsx
<div className="bg-white border border-slate-200 rounded-lg">
  {/* Başlık */}
  <div className="flex items-center justify-between p-4 border-b border-slate-100">
    <h2 className="text-sm font-medium text-slate-900">Kart Başlığı</h2>
    <Link href="/see-all" className="text-xs text-slate-500 hover:text-slate-700">
      Tümünü gör →
    </Link>
  </div>

  {/* İçerik */}
  <div className="p-4">
    {/* İçerik */}
  </div>
</div>
```

#### Animasyonlu Kart (Framer Motion)

```tsx
import { motion } from 'framer-motion';

<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3, delay: index * 0.1 }}
>
  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
    {/* İçerik */}
  </div>
</motion.div>
```

### 3.5 Tablo Stilleri

```tsx
// Ant Design Table için CRM stili
<Table
  columns={columns}
  dataSource={data}
  className="enterprise-table"
/>

// enterprise-table CSS class'ı:
// [&_.ant-table-thead_th]:!bg-slate-50
// [&_.ant-table-thead_th]:!text-slate-500
// [&_.ant-table-thead_th]:!font-medium
// [&_.ant-table-thead_th]:!text-xs
```

**Kolon Render Örnekleri:**

```tsx
// Metin + Alt Metin
{
  title: 'Ürün',
  dataIndex: 'name',
  render: (text, record) => (
    <div>
      <div className="text-sm font-medium text-slate-900">{text}</div>
      <div className="text-xs text-slate-500">{record.code}</div>
    </div>
  ),
}

// Durum Badge
{
  title: 'Durum',
  dataIndex: 'status',
  render: (status) => {
    const variants = {
      Active: { bg: 'bg-slate-900', text: 'text-white', label: 'Aktif' },
      Inactive: { bg: 'bg-slate-100', text: 'text-slate-500', label: 'Pasif' },
    };
    const v = variants[status] || variants.Inactive;
    return (
      <span className={`px-2 py-0.5 text-xs rounded-full ${v.bg} ${v.text}`}>
        {v.label}
      </span>
    );
  },
}

// Tarih
{
  title: 'Tarih',
  dataIndex: 'date',
  render: (date) => (
    <span className="text-sm text-slate-600">{formatDate(date)}</span>
  ),
}
```

### 3.6 Empty State

```tsx
<div className="text-center py-10">
  <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center mx-auto mb-3">
    <EmptyIcon className="w-4 h-4 text-slate-300" />
  </div>
  <h3 className="text-sm font-medium text-slate-600 mb-1">Veri bulunamadı</h3>
  <p className="text-xs text-slate-400 mb-4">
    Henüz kayıt eklenmemiş
  </p>
  <Link href="/module/new">
    <button className="px-3 py-1.5 text-xs font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
      Yeni Ekle
    </button>
  </Link>
</div>
```

### 3.7 Loading State

```tsx
import { Spin } from 'antd';

<div className="flex items-center justify-center py-12">
  <Spin />
</div>
```

### 3.8 List Item

```tsx
<div className="flex items-center justify-between py-3 hover:bg-slate-50 -mx-4 px-4 cursor-pointer transition-colors">
  <div className="flex items-center gap-3">
    {/* İkon */}
    <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
      <ItemIcon className="w-4 h-4 text-slate-500" />
    </div>

    {/* Bilgi */}
    <div>
      <div className="text-sm font-medium text-slate-900">{title}</div>
      <div className="text-xs text-slate-500">{subtitle}</div>
    </div>
  </div>

  {/* Değer */}
  <div className="text-right">
    <div className="text-sm font-semibold text-slate-900">{value}</div>
    <div className="text-xs text-slate-500">{secondaryValue}</div>
  </div>
</div>
```

---

## 4. İkon Kullanımı

### 4.1 İkon Kütüphanesi
**Heroicons** (@heroicons/react) kullanın. Ant Design ikonlarını **KULLANMAYIN**.

```tsx
import {
  PlusIcon,
  ChevronRightIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  // ... diğerleri
} from '@heroicons/react/24/outline';
```

### 4.2 İkon Boyutları

| Kullanım | Boyut Class |
|----------|-------------|
| Buton içi | `w-4 h-4` |
| Kart ikonu | `w-4 h-4` veya `w-5 h-5` |
| Büyük başlık ikonu | `w-5 h-5` veya `w-6 h-6` |
| Empty state | `w-4 h-4` |

### 4.3 İkon Container

```tsx
// Küçük (KPI kart)
<div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
  <Icon className="w-4 h-4 text-slate-500" />
</div>

// Büyük (Liste başlığı)
<div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center">
  <Icon className="w-5 h-5 text-slate-600" />
</div>

// Küçük (List item)
<div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
  <Icon className="w-4 h-4 text-slate-500" />
</div>
```

---

## 5. Grid Sistemleri

### 5.1 Dashboard Grid (12 Kolon)

```tsx
<div className="grid grid-cols-12 gap-6">
  {/* 4 KPI Kartı - Her biri 3 kolon */}
  <div className="col-span-3">...</div>
  <div className="col-span-3">...</div>
  <div className="col-span-3">...</div>
  <div className="col-span-3">...</div>

  {/* Geniş Grafik - 8 kolon */}
  <div className="col-span-8">...</div>

  {/* Dar Grafik - 4 kolon */}
  <div className="col-span-4">...</div>

  {/* Tam Genişlik */}
  <div className="col-span-12">...</div>
</div>
```

### 5.2 Responsive Grid

```tsx
// 2-4 Kolon Grid (KPI'lar için)
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
  {items.map(item => (
    <KPICard key={item.id} {...item} />
  ))}
</div>

// 1-2 Kolon Grid (Büyük kartlar için)
<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
  <LargeCard />
  <LargeCard />
</div>
```

---

## 6. Spacing Sistemi

### 6.1 Sayfa Spacing

```tsx
// Sayfa container
<div className="px-6 py-8">

// Section arası
<div className="mb-8">

// Kart arası
<div className="gap-6">

// İç padding
<div className="p-5">  // Küçük kart
<div className="p-6">  // Büyük kart
```

### 6.2 İç Spacing

```tsx
// Başlık + İçerik arası
<div className="mb-3">   // Küçük
<div className="mb-4">   // Normal
<div className="mb-5">   // Büyük

// Flex gap
<div className="gap-2">  // Buton içi
<div className="gap-3">  // List item
<div className="gap-4">  // Kart başlık
```

---

## 7. Tipografi

### 7.1 Font Boyutları

| Kullanım | Class |
|----------|-------|
| Sayfa başlığı | `text-2xl font-semibold` |
| Kart başlığı | `text-sm font-medium` |
| KPI değeri | `text-2xl font-semibold` |
| Gövde metin | `text-sm` |
| Açıklama | `text-xs text-slate-500` |
| Label (uppercase) | `text-xs font-medium uppercase tracking-wide` |

### 7.2 Örnek Kullanımlar

```tsx
// Sayfa Başlığı
<h1 className="text-2xl font-semibold text-slate-900">Dashboard</h1>

// Alt başlık
<p className="text-sm text-slate-500">Açıklama metni</p>

// Kart başlığı
<h2 className="text-sm font-medium text-slate-900">Kart Başlığı</h2>

// Büyük değer
<div className="text-2xl font-semibold text-slate-900">1,234</div>

// Label
<span className="text-xs font-medium text-slate-500 uppercase tracking-wide">
  Durum
</span>
```

---

## 8. Grafik Stilleri (Recharts)

### 8.1 Renk Paleti

```tsx
// Monokrom palet
const MONOCHROME_COLORS = [
  '#1e293b', // slate-800
  '#334155', // slate-700
  '#475569', // slate-600
  '#64748b', // slate-500
  '#94a3b8', // slate-400
  '#cbd5e1', // slate-300
  '#e2e8f0', // slate-200
  '#f1f5f9', // slate-100
];
```

### 8.2 Area Chart

```tsx
<ResponsiveContainer width="100%" height={280}>
  <AreaChart data={data}>
    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
    <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} />
    <YAxis stroke="#94a3b8" fontSize={12} />
    <RechartsTooltip content={<CustomTooltip />} />
    <Legend />
    <Area
      type="monotone"
      dataKey="value"
      stroke="#1e293b"
      fill="#1e293b"
      fillOpacity={0.7}
    />
  </AreaChart>
</ResponsiveContainer>
```

### 8.3 Pie Chart

```tsx
<ResponsiveContainer width="100%" height={200}>
  <PieChart>
    <Pie
      data={data}
      cx="50%"
      cy="50%"
      innerRadius={50}
      outerRadius={80}
      paddingAngle={2}
      dataKey="value"
    >
      {data.map((entry, index) => (
        <Cell key={index} fill={MONOCHROME_COLORS[index]} />
      ))}
    </Pie>
    <RechartsTooltip />
  </PieChart>
</ResponsiveContainer>
```

### 8.4 Custom Tooltip

```tsx
const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
        <p className="font-medium text-slate-900 mb-1">{label}</p>
        {payload.map((entry, index) => (
          <p key={index} className="text-sm text-slate-600">
            {entry.name}: {entry.value.toLocaleString('tr-TR')}
          </p>
        ))}
      </div>
    );
  }
  return null;
};
```

---

## 9. Geçiş Animasyonları

### 9.1 Standart Transitions

```tsx
// Hover renk değişimi
className="transition-colors"

// Tüm özellikler
className="transition-all"

// Özel duration
className="transition-all duration-200"
className="transition-all duration-300"
```

### 9.2 Hover Efektleri

```tsx
// Kart hover
className="hover:border-slate-300 hover:shadow-sm transition-all"

// Buton hover
className="hover:bg-slate-800 transition-colors"

// Link hover
className="hover:text-slate-700 transition-colors"

// İkon hover (group ile)
className="group-hover:text-slate-500 transition-colors"
```

---

## 10. Kullanılacak Bileşenler

### 10.1 Import Yolları

```tsx
// Layout Patterns
import {
  PageContainer,
  ListPageHeader,
  Section,
  PageLoading,
  EmptyState
} from '@/components/patterns';

// Primitives - Display
import {
  Card,
  CardHeader,
  CardBody,
  StatCard,
  Badge
} from '@/components/primitives/display';

// Primitives - Buttons
import { Button } from '@/components/primitives/buttons';

// Primitives - Form
import { Input, Select } from '@/components/primitives';

// Primitives - Feedback
import { Spinner, Alert } from '@/components/primitives/feedback';

// Icons (Heroicons ONLY)
import { PlusIcon, ... } from '@heroicons/react/24/outline';
```

### 10.2 CRM-Specific Components

```tsx
// Animasyonlu kart
import { AnimatedCard } from '@/components/crm/shared/AnimatedCard';

// Dashboard bileşenleri
import {
  SalesFunnel,
  TopCustomers,
  TodaysActivities,
  OverdueTasks
} from '@/components/crm/dashboard';
```

---

## 11. Migration Checklist

Her modül için aşağıdaki adımları takip edin:

### Sayfa Yapısı
- [ ] `PageContainer` kullanımına geç
- [ ] Sayfa başlığını CRM formatına güncelle
- [ ] `bg-slate-50` sayfa arka planı
- [ ] Spacing sistemini uygula (mb-8, gap-6)

### Kartlar
- [ ] `bg-white border border-slate-200 rounded-xl` kullan
- [ ] Hover efekti ekle: `hover:border-slate-300 hover:shadow-sm`
- [ ] Padding: `p-5` veya `p-6`

### Renkler
- [ ] Ant Design renklerini Slate tonlarına çevir
- [ ] Durum renklerini minimal tut (emerald, amber, blue sadece gösterge)
- [ ] Metin renklerini standartlaştır

### Butonlar
- [ ] Primary: `bg-slate-900 text-white`
- [ ] Heroicons kullan
- [ ] Buton boyutları: `text-sm`, `px-4 py-2`

### Tablolar
- [ ] enterprise-table class'ını ekle
- [ ] Kolon render'larını güncelle
- [ ] Durum badge'lerini slate tonlarına çevir

### İkonlar
- [ ] Ant Design ikonlarını Heroicons ile değiştir
- [ ] İkon container'larını standartlaştır
- [ ] `w-4 h-4` veya `w-5 h-5` boyutları

### Grafikler
- [ ] MONOCHROME_COLORS paletini kullan
- [ ] CartesianGrid: `stroke="#e2e8f0"`
- [ ] Axis: `stroke="#94a3b8" fontSize={12}`

---

## 12. Detay Sayfası Yapısı

Detay sayfaları kayıt bilgilerini görüntülemek için kullanılır. İki kolonlu layout ile sol tarafta ana bilgiler, sağ tarafta meta bilgiler gösterilir.

### 12.1 Temel Detay Sayfası Yapısı

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { PageContainer } from '@/components/patterns';
import {
  ArrowLeftIcon,
  PencilIcon,
  TrashIcon,
  CalendarIcon,
  UserIcon,
} from '@heroicons/react/24/outline';

export default function DetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<DataType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  if (loading) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </PageContainer>
    );
  }

  if (!data) {
    return (
      <PageContainer maxWidth="5xl">
        <div className="text-center py-12">
          <p className="text-slate-500">Kayıt bulunamadı</p>
          <Link href="/module" className="text-sm text-slate-900 hover:underline mt-2 inline-block">
            ← Listeye Dön
          </Link>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="5xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/module"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Listeye Dön
        </Link>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">{data.name}</h1>
            <p className="text-sm text-slate-500 mt-1">{data.description}</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/module/${params.id}/edit`}>
              <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors">
                <PencilIcon className="w-4 h-4" />
                Düzenle
              </button>
            </Link>
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-slate-300 rounded-md hover:bg-red-50 transition-colors"
            >
              <TrashIcon className="w-4 h-4" />
              Sil
            </button>
          </div>
        </div>
      </div>

      {/* İki Kolonlu Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol Kolon - Ana Bilgiler (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Genel Bilgiler Kartı */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="text-sm font-medium text-slate-900">Genel Bilgiler</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                <InfoItem label="Alan 1" value={data.field1} />
                <InfoItem label="Alan 2" value={data.field2} />
                <InfoItem label="Alan 3" value={data.field3} />
                <InfoItem label="Alan 4" value={data.field4} />
              </dl>
            </div>
          </div>

          {/* İlişkili Veriler Kartı */}
          <div className="bg-white border border-slate-200 rounded-xl">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-medium text-slate-900">İlişkili Kayıtlar</h2>
              <span className="text-xs text-slate-500">{relatedItems.length} kayıt</span>
            </div>
            <div className="divide-y divide-slate-100">
              {relatedItems.map((item) => (
                <div key={item.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-slate-900">{item.name}</p>
                      <p className="text-xs text-slate-500">{item.subtitle}</p>
                    </div>
                    <span className="text-sm text-slate-600">{item.value}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sağ Kolon - Meta Bilgiler (1/3) */}
        <div className="space-y-6">
          {/* Durum Kartı */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Durum</h3>
            <StatusBadge status={data.status} />
          </div>

          {/* Tarih Bilgileri Kartı */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Tarihler</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Oluşturulma</p>
                  <p className="text-sm text-slate-900">{formatDate(data.createdAt)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <CalendarIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Güncelleme</p>
                  <p className="text-sm text-slate-900">{formatDate(data.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Oluşturan/Güncelleyen Kartı */}
          <div className="bg-white border border-slate-200 rounded-xl p-6">
            <h3 className="text-sm font-medium text-slate-900 mb-4">Kayıt Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                  <UserIcon className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs text-slate-500">Oluşturan</p>
                  <p className="text-sm text-slate-900">{data.createdBy || '-'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}

// Yardımcı Bileşenler
const InfoItem = ({ label, value }: { label: string; value: string | number | null }) => (
  <div>
    <dt className="text-xs text-slate-500 mb-1">{label}</dt>
    <dd className="text-sm text-slate-900">{value || '-'}</dd>
  </div>
);

const StatusBadge = ({ status }: { status: string }) => {
  const variants: Record<string, { bg: string; text: string; label: string }> = {
    Active: { bg: 'bg-emerald-100', text: 'text-emerald-700', label: 'Aktif' },
    Inactive: { bg: 'bg-slate-100', text: 'text-slate-600', label: 'Pasif' },
    Pending: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Beklemede' },
  };
  const v = variants[status] || variants.Inactive;
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${v.bg} ${v.text}`}>
      {v.label}
    </span>
  );
};
```

### 12.2 Detay Sayfası Layout Varyasyonları

#### Tek Kolonlu Layout (Basit Kayıtlar)
```tsx
<div className="max-w-3xl">
  <div className="bg-white border border-slate-200 rounded-xl">
    {/* Tek kart içinde tüm bilgiler */}
  </div>
</div>
```

#### Tab'lı Detay Layout (Karmaşık Kayıtlar)
```tsx
import { Tabs } from 'antd';

<div className="bg-white border border-slate-200 rounded-xl">
  <Tabs
    defaultActiveKey="general"
    className="px-6"
    items={[
      { key: 'general', label: 'Genel', children: <GeneralTab /> },
      { key: 'history', label: 'Geçmiş', children: <HistoryTab /> },
      { key: 'documents', label: 'Dökümanlar', children: <DocumentsTab /> },
    ]}
  />
</div>
```

---

## 13. Ekleme Sayfası Yapısı (New/Create Page)

Yeni kayıt oluşturma sayfaları için standart yapı.

### 13.1 Temel Ekleme Sayfası

```tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Select, DatePicker, InputNumber, message } from 'antd';
import { PageContainer } from '@/components/patterns';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function NewItemPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    try {
      const response = await fetch('/api/module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });

      if (!response.ok) throw new Error('Kayıt oluşturulamadı');

      message.success('Kayıt başarıyla oluşturuldu');
      router.push('/module');
    } catch (error) {
      message.error('Bir hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageContainer maxWidth="3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/module"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Listeye Dön
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900">Yeni Kayıt Oluştur</h1>
        <p className="text-sm text-slate-500 mt-1">Yeni bir kayıt eklemek için formu doldurun</p>
      </div>

      {/* Form Kartı */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          {/* Temel Bilgiler Bölümü */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Temel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label={<span className="text-sm text-slate-700">Ad</span>}
                rules={[{ required: true, message: 'Ad zorunludur' }]}
              >
                <Input
                  placeholder="Kayıt adını girin"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="code"
                label={<span className="text-sm text-slate-700">Kod</span>}
                rules={[{ required: true, message: 'Kod zorunludur' }]}
              >
                <Input
                  placeholder="Benzersiz kod girin"
                  className="rounded-md"
                />
              </Form.Item>

              <Form.Item
                name="category"
                label={<span className="text-sm text-slate-700">Kategori</span>}
                className="md:col-span-2"
              >
                <Select
                  placeholder="Kategori seçin"
                  options={categoryOptions}
                  className="w-full"
                />
              </Form.Item>
            </div>
          </div>

          {/* Detay Bilgiler Bölümü */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Detay Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="quantity"
                label={<span className="text-sm text-slate-700">Miktar</span>}
              >
                <InputNumber
                  placeholder="0"
                  className="w-full rounded-md"
                  min={0}
                />
              </Form.Item>

              <Form.Item
                name="date"
                label={<span className="text-sm text-slate-700">Tarih</span>}
              >
                <DatePicker
                  placeholder="Tarih seçin"
                  className="w-full rounded-md"
                  format="DD.MM.YYYY"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-700">Açıklama</span>}
                className="md:col-span-2"
              >
                <Input.TextArea
                  placeholder="Açıklama girin..."
                  rows={4}
                  className="rounded-md"
                />
              </Form.Item>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href="/module">
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </button>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}
```

### 13.2 Form Bölüm Deseni

```tsx
// Form bölümlerini ayırmak için kullanılan pattern
<div className="mb-8">
  <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
    Bölüm Başlığı
  </h2>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    {/* Form alanları */}
  </div>
</div>
```

### 13.3 Form Input Stilleri

```tsx
// Text Input
<Input
  placeholder="Placeholder"
  className="rounded-md"
/>

// Select
<Select
  placeholder="Seçin"
  options={options}
  className="w-full"
/>

// Number Input
<InputNumber
  placeholder="0"
  className="w-full rounded-md"
  min={0}
/>

// Date Picker
<DatePicker
  placeholder="Tarih seçin"
  className="w-full rounded-md"
  format="DD.MM.YYYY"
/>

// Textarea
<Input.TextArea
  placeholder="Açıklama..."
  rows={4}
  className="rounded-md"
/>
```

---

## 14. Düzenleme Sayfası Yapısı (Edit Page)

Mevcut kaydı düzenleme sayfaları için standart yapı.

### 14.1 Temel Düzenleme Sayfası

```tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Form, Input, Select, DatePicker, InputNumber, message, Spin } from 'antd';
import { PageContainer } from '@/components/patterns';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import dayjs from 'dayjs';

export default function EditItemPage() {
  const params = useParams();
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [data, setData] = useState<DataType | null>(null);

  useEffect(() => {
    fetchData();
  }, [params.id]);

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/module/${params.id}`);
      if (!response.ok) throw new Error('Kayıt bulunamadı');
      const result = await response.json();
      setData(result);

      // Form'a mevcut değerleri yükle
      form.setFieldsValue({
        name: result.name,
        code: result.code,
        category: result.categoryId,
        quantity: result.quantity,
        date: result.date ? dayjs(result.date) : null,
        description: result.description,
      });
    } catch (error) {
      message.error('Kayıt yüklenemedi');
      router.push('/module');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/module/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...values,
          date: values.date?.toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Güncelleme başarısız');

      message.success('Kayıt başarıyla güncellendi');
      router.push(`/module/${params.id}`);
    } catch (error) {
      message.error('Bir hata oluştu');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <PageContainer maxWidth="3xl">
        <div className="flex items-center justify-center py-12">
          <Spin />
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="3xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href={`/module/${params.id}`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-4"
        >
          <ArrowLeftIcon className="w-4 h-4" />
          Detaya Dön
        </Link>

        <h1 className="text-2xl font-semibold text-slate-900">Kaydı Düzenle</h1>
        <p className="text-sm text-slate-500 mt-1">
          <span className="font-medium">{data?.name}</span> kaydını düzenliyorsunuz
        </p>
      </div>

      {/* Form Kartı */}
      <div className="bg-white border border-slate-200 rounded-xl">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="p-6"
        >
          {/* Form bölümleri - Ekleme sayfasıyla aynı yapı */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Temel Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="name"
                label={<span className="text-sm text-slate-700">Ad</span>}
                rules={[{ required: true, message: 'Ad zorunludur' }]}
              >
                <Input placeholder="Kayıt adını girin" className="rounded-md" />
              </Form.Item>

              <Form.Item
                name="code"
                label={<span className="text-sm text-slate-700">Kod</span>}
                rules={[{ required: true, message: 'Kod zorunludur' }]}
              >
                <Input placeholder="Benzersiz kod girin" className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Detay Bilgiler */}
          <div className="mb-8">
            <h2 className="text-sm font-medium text-slate-900 mb-4 pb-2 border-b border-slate-100">
              Detay Bilgiler
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Form.Item
                name="quantity"
                label={<span className="text-sm text-slate-700">Miktar</span>}
              >
                <InputNumber placeholder="0" className="w-full rounded-md" min={0} />
              </Form.Item>

              <Form.Item
                name="date"
                label={<span className="text-sm text-slate-700">Tarih</span>}
              >
                <DatePicker
                  placeholder="Tarih seçin"
                  className="w-full rounded-md"
                  format="DD.MM.YYYY"
                />
              </Form.Item>

              <Form.Item
                name="description"
                label={<span className="text-sm text-slate-700">Açıklama</span>}
                className="md:col-span-2"
              >
                <Input.TextArea placeholder="Açıklama girin..." rows={4} className="rounded-md" />
              </Form.Item>
            </div>
          </div>

          {/* Form Aksiyonları */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
            <Link href={`/module/${params.id}`}>
              <button
                type="button"
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
              >
                İptal
              </button>
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? 'Kaydediliyor...' : 'Güncelle'}
            </button>
          </div>
        </Form>
      </div>
    </PageContainer>
  );
}
```

### 14.2 Ekleme vs Düzenleme Farkları

| Özellik | Ekleme Sayfası | Düzenleme Sayfası |
|---------|---------------|-------------------|
| **URL** | `/module/new` | `/module/[id]/edit` |
| **Başlık** | "Yeni Kayıt Oluştur" | "Kaydı Düzenle" |
| **Geri Butonu** | Listeye dön | Detaya dön |
| **Submit Butonu** | "Kaydet" | "Güncelle" |
| **API Method** | `POST /api/module` | `PUT /api/module/[id]` |
| **Form Initial** | Boş | Mevcut verilerle dolu |
| **Loading State** | Yok | Veri yüklenene kadar |

### 14.3 Form Aksiyonları Deseni

```tsx
{/* Standart Form Aksiyonları */}
<div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
  {/* İptal Butonu */}
  <Link href="/module">
    <button
      type="button"
      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-md hover:bg-slate-50 transition-colors"
    >
      İptal
    </button>
  </Link>

  {/* Submit Butonu */}
  <button
    type="submit"
    disabled={loading}
    className="px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
  >
    {loading ? 'Kaydediliyor...' : 'Kaydet'}
  </button>
</div>
```

### 14.4 Silme İşlemi (Delete Confirmation)

```tsx
import { Modal, message } from 'antd';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const handleDelete = () => {
  Modal.confirm({
    title: 'Silme Onayı',
    icon: <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />,
    content: 'Bu kaydı silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
    okText: 'Sil',
    okType: 'danger',
    cancelText: 'İptal',
    async onOk() {
      try {
        const response = await fetch(`/api/module/${id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Silme başarısız');
        message.success('Kayıt silindi');
        router.push('/module');
      } catch (error) {
        message.error('Silme işlemi başarısız');
      }
    },
  });
};
```

---

## 15. Örnek Migrasyon

### Öncesi (Sales Dashboard)

```tsx
// ESKİ STIL
<div style={{ padding: 24 }}>
  <Title level={2}>Satış Dashboard</Title>
  <Row gutter={[16, 16]}>
    <Col xs={24} sm={12} lg={6}>
      <Card hoverable>
        <Statistic
          title="Toplam Sipariş"
          value={100}
          prefix={<ShoppingCartIcon style={{ color: '#1890ff' }} />}
        />
      </Card>
    </Col>
  </Row>
</div>
```

### Sonrası (CRM Stili)

```tsx
// YENİ STIL
<PageContainer maxWidth="7xl">
  {/* Header */}
  <div className="mb-8">
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Satış Dashboard</h1>
        <p className="text-sm text-slate-500">Satış operasyonlarınızın özeti</p>
      </div>
      <Link href="/sales/orders/new">
        <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-md hover:bg-slate-800 transition-colors">
          <PlusIcon className="w-4 h-4" />
          Yeni Sipariş
        </button>
      </Link>
    </div>
  </div>

  {/* KPI Cards */}
  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
    <Link href="/sales/orders">
      <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer group">
        <div className="flex items-center justify-between mb-3">
          <div className="w-9 h-9 rounded-lg bg-slate-100 flex items-center justify-center">
            <ShoppingCartIcon className="w-4 h-4 text-slate-500" />
          </div>
          <ChevronRightIcon className="w-4 h-4 text-slate-300 group-hover:text-slate-500 transition-colors" />
        </div>
        <div className="text-2xl font-semibold text-slate-900 mb-1">100</div>
        <div className="text-sm text-slate-500">Toplam Sipariş</div>
      </div>
    </Link>
    {/* Diğer kartlar... */}
  </div>
</PageContainer>
```

---

## 13. Sık Yapılan Hatalar

### YAPMAYIN ❌

```tsx
// Renkli butonlar
<Button type="primary" style={{ backgroundColor: '#1890ff' }}>

// Inline style
<div style={{ padding: 24 }}>

// Ant Design ikonları
import { ShoppingCartOutlined } from '@ant-design/icons';

// Renkli kartlar
<Card style={{ backgroundColor: '#e6f7ff' }}>

// Hard-coded renkler
<span style={{ color: '#52c41a' }}>
```

### YAPIN ✅

```tsx
// Slate buton
<button className="bg-slate-900 text-white hover:bg-slate-800">

// Tailwind class
<div className="p-6">

// Heroicons
import { ShoppingCartIcon } from '@heroicons/react/24/outline';

// Beyaz kart + slate border
<div className="bg-white border border-slate-200 rounded-xl">

// Tailwind renk class'ları
<span className="text-slate-900">
```

---

## 14. Test ve Doğrulama

Migration sonrası şunları kontrol edin:

1. **Görsel Tutarlılık**: CRM ile yan yana karşılaştırın
2. **Hover States**: Tüm interaktif elemanlar hover efekti göstermeli
3. **Responsive**: Mobil ve tablet görünümü kontrol edin
4. **Accessibility**: Kontrast oranları yeterli olmalı
5. **Dark Mode**: (Gelecek) Dark mode uyumluluğu

---

## 15. Yardımcı Kaynaklar

- [Tailwind CSS Cheat Sheet](https://nerdcave.com/tailwind-cheat-sheet)
- [Heroicons](https://heroicons.com/)
- [Recharts Documentation](https://recharts.org/)
- [Framer Motion](https://www.framer.com/motion/)

---

**Son Güncelleme:** 2025-12-27
**Versiyon:** 1.1.0 - Detay, Ekleme ve Düzenleme sayfa yapıları eklendi
