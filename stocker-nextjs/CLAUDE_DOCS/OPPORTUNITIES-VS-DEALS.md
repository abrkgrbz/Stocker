# Opportunities vs Deals - Fark Analizi

## Özet
**Opportunities (Fırsatlar)** ve **Deals (Anlaşmalar)** CRM sisteminde farklı amaçlara hizmet eden iki ayrı konsepttir. İkisi de satış pipeline'ında yer alsa da, farklı aşamaları ve özellikleri temsil ederler.

---

## Temel Farklar

### 🎯 Opportunity (Fırsat)
**Tanım:** Potansiyel satış fırsatı - henüz kesinleşmemiş, geliştirilmekte olan satış

**Kullanım Amacı:**
- Potansiyel müşterilerle ilk temas
- Satış öncesi değerlendirme
- Nitelikli lead'lerden dönüşüm
- Uzun vadeli satış takibi

**Özellikler:**
```typescript
interface Opportunity {
  name: string                    // Fırsat adı
  amount: Money                   // Tahmini tutar
  probability: decimal            // Kapanma olasılığı (0-100)
  expectedCloseDate: DateTime     // Beklenen kapanış tarihi
  actualCloseDate?: DateTime      // Gerçek kapanış (kazanılınca)
  status: OpportunityStatus       // Open, Won, Lost
  leadId?: Guid                   // Hangi lead'den geldi
  campaignId?: Guid               // Hangi kampanyadan
  competitorName?: string         // Rakip firma
  source: OpportunitySource       // Nereden geldi (Web, Referral, etc)
  type: OpportunityType           // Yeni iş, tekrar satış, vs
  parentOpportunityId?: Guid      // Bağlı olduğu ana fırsat
  nextStep?: string               // Sonraki adım nedir
}
```

---

### 💰 Deal (Anlaşma)
**Tanım:** Aktif olarak üzerinde çalışılan, somut anlaşma - gerçek satış süreci

**Kullanım Amacı:**
- Kesinleşmiş müşteri anlaşmaları
- Aktif satış süreçleri
- Tekrarlayan gelir yönetimi
- Detaylı aktivite takibi

**Özellikler:**
```typescript
interface Deal {
  name: string                    // Anlaşma adı
  value: Money                    // Ana tutar
  recurringValue?: Money          // Tekrarlayan gelir tutarı
  recurringPeriod?: RecurringPeriod // Aylık, yıllık vs
  recurringCycles?: int           // Kaç dönem tekrarlanacak
  probability: decimal            // Kapanma olasılığı
  expectedCloseDate?: DateTime    // Beklenen bitiş
  actualCloseDate?: DateTime      // Gerçek bitiş
  status: DealStatus              // Open, Won, Lost
  currency?: string               // Para birimi
  rottenDays?: int                // Kaç gündür hareketsiz
  lastActivityDate?: DateTime     // Son aktivite
  nextActivityDate?: DateTime     // Sonraki aktivite
  activitiesCount: int            // Toplam aktivite sayısı
  emailsCount: int                // Gönderilen email sayısı
  labels?: string                 // Etiketler
}
```

---

## Karşılaştırma Tablosu

| Özellik | Opportunity | Deal |
|---------|-------------|------|
| **Aşama** | Erken (Potansiyel) | Geç (Aktif) |
| **Olgunluk** | Belirsiz | Somut |
| **Lead İlişkisi** | ✅ Var (`leadId`) | ❌ Yok |
| **Kampanya Takibi** | ✅ Var (`campaignId`) | ❌ Yok |
| **Rakip Bilgisi** | ✅ Var (`competitorName`) | ❌ Yok |
| **Kaynak Takibi** | ✅ Var (`source`) | ❌ Yok |
| **Tip Kategorisi** | ✅ Var (`type`) | ❌ Yok |
| **Hiyerarşi** | ✅ Var (`parentOpportunityId`) | ❌ Yok |
| **Tekrarlayan Gelir** | ❌ Yok | ✅ Var (`recurringValue`, `recurringPeriod`) |
| **Para Birimi** | ❌ Yok | ✅ Var (`currency`) |
| **Rotten Days** | ❌ Yok | ✅ Var (hareketsizlik takibi) |
| **Aktivite Metrikleri** | ❌ Yok | ✅ Var (sayaçlar) |
| **Email Takibi** | ❌ Yok | ✅ Var (`emailsCount`) |

---

## İş Akışı

### 📈 Tipik Satış Süreci

```
1. Lead (Potansiyel Müşteri)
   ↓
2. Opportunity (Fırsat)
   - Niteliklendir
   - Değerlendir
   - Takip et
   ↓
3. Deal (Anlaşma)
   - Teklif hazırla
   - Müzakere et
   - Finalize et
   ↓
4. Customer (Müşteri)
   - Sözleşme imzala
   - Ürün/hizmet sun
```

### 🔄 Dönüşüm Kuralları

**Lead → Opportunity:**
- Lead nitelikli hale geldiğinde
- Potansiyel satış değeri belirlenebildiğinde
- İlk temas kurulduğunda

**Opportunity → Deal:**
- Müşteri ciddi ilgi gösterdiğinde
- Teklif/proposal aşamasına gelindiğinde
- Somut bütçe ve timeline oluştuğunda

**Deal → Customer:**
- Anlaşma kazanıldığında (Won)
- Sözleşme imzalandığında
- Ödeme planı netleştiğinde

---

## Kullanım Senaryoları

### ✅ Opportunity Kullan
- B2B satışlarda ilk temas
- Uzun satış döngüleri (6+ ay)
- Birden fazla rakip var
- Kampanya ROI takibi gerekli
- Lead source analizi önemli
- Büyük hesaplar için stratejik planlama

**Örnek:**
> "ABC Company ile web sitesi yenileme projesi için görüşmeler başladı. 3 rakip firma var, 6 aylık değerlendirme süreci var, LinkedIn kampanyasından geldi."

### ✅ Deal Kullan
- Teklif verilmiş satışlar
- Aktif müzakere aşamasındakiler
- Tekrarlayan gelir modelleri (SaaS, abonelik)
- Günlük aktivite takibi gereken
- ROI hesaplama yapılan
- Email correspondence önemli

**Örnek:**
> "XYZ Company'ye SaaS platformu teklifi verildi. Aylık 5000₺ tekrarlayan gelir, 12 aylık kontrat. Bu hafta demo, gelecek hafta karar."

---

## Mimari Notlar

### Backend Farkları
- Opportunity: `OpportunitySource`, `OpportunityType`, `OpportunityStatus` enum'ları
- Deal: `DealStatus`, `DealPriority`, `RecurringPeriod` enum'ları
- Opportunity: Campaign ve Lead ilişkileri
- Deal: Detaylı metrik tracking

### Pipeline İlişkisi
- İkisi de Pipeline'da stage'lerde ilerler
- Opportunity için: "Qualification → Proposal → Negotiation → Closed"
- Deal için: "Sent Quote → In Negotiation → Contract Review → Won"

### Raporlama
- Opportunity: Kaynak analizi, kampanya ROI, lead conversion rate
- Deal: Satış velocity, win rate, recurring revenue, aktivite metrikleri

---

## Öneriler

### 🎯 Ne Zaman Hangisini Kullan?

**Opportunity Seç:**
- Satış dönemi uzunsa (>3 ay)
- Birden fazla karar verici varsa
- Rekabet yoğunsa
- Lead kaynağı önemliyse
- Stratejik planlama gerekiyorsa

**Deal Seç:**
- Hızlı satış döngüsüyse (<3 ay)
- Teklif/sözleşme aşamasındaysa
- Tekrarlayan gelir varsa
- Aktivite yoğunluğu yüksekse
- Email takibi kritikse

### 🔧 İyileştirme Önerileri

1. **UI'da Netleştirme:**
   - Opportunity: "🎯 Fırsatlar" (daha açık mavi, early stage vurgusu)
   - Deal: "💰 Anlaşmalar" (daha koyu yeşil, money vurgusu)

2. **Açıklayıcı Metinler:**
   - Opportunity sayfasına: "Potansiyel satış fırsatlarınızı değerlendirin ve nitelendirin"
   - Deal sayfasına: "Aktif anlaşmalarınızı yönetin ve kapanış oranınızı artırın"

3. **Dönüşüm Butonları:**
   - Opportunity detayında: "Anlaşmaya Dönüştür" butonu
   - Deal kazanınca: "Müşteri Oluştur" butonu

4. **Filtre Farklılıkları:**
   - Opportunity: Source, Campaign, Competitor filtreleri
   - Deal: Recurring, Currency, Rotten Days filtreleri

---

## Özet

**Basit Ayrım:**
- **Opportunity** = "Belki satarız" 🤔
- **Deal** = "Satıyoruz" 💪

**Satış Hunisi:**
```
Leads → Opportunities → Deals → Customers
 100        50            25       10
```

İki sistem de aynı pipeline mekanizmasını kullansa da, farklı satış aşamalarını ve farklı yönetim ihtiyaçlarını karşılar.
