# CMS Preview Mode - Teknik Dokümantasyon

## Genel Bakış

CMS Preview Mode, admin panelinden oluşturulan içeriklerin (sayfa, blog, döküman) yayınlanmadan önce önizlenmesini sağlayan sistemdir. Next.js Draft Mode API'si kullanılarak implement edilmiştir.

## Mimari

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────────┐
│   Admin Panel   │────▶│   Next.js Frontend   │────▶│   Backend API   │
│  (stoocker.app) │     │    (stoocker.app)    │     │(api.stoocker.app)│
└─────────────────┘     └──────────────────────┘     └─────────────────┘
        │                         │                          │
        │  1. Önizle butonuna     │                          │
        │     tıkla               │                          │
        ▼                         │                          │
   /preview?slug=xxx              │                          │
   &secret=xxx&type=page          │                          │
        │                         │                          │
        └────────────────────────▶│                          │
                                  │  2. Middleware secret    │
                                  │     doğrular             │
                                  │                          │
                                  │  3. Draft mode cookie    │
                                  │     set edilir           │
                                  │                          │
                                  │  4. /xxx sayfasına       │
                                  │     redirect             │
                                  │                          │
                                  │  5. Page component       │
                                  │     draftMode() kontrol  │
                                  │                          │
                                  │  6. Preview API çağrısı ─┼──────────────────▶│
                                  │                          │                   │
                                  │◀─────────────────────────┼───────────────────│
                                  │  7. Draft içerik render  │  Tüm statüdeki
                                  │                          │  içerik döner
                                  ▼                          │
                          Önizleme Modu Banner               │
                          + Draft İçerik                     │
```

## URL Yapısı

### Preview Mode Etkinleştirme
```
GET /preview?slug={slug}&secret={secret}&type={type}
```

| Parametre | Zorunlu | Açıklama |
|-----------|---------|----------|
| `slug` | Evet | İçerik slug'ı (örn: `test-features`, `blog-post-1`) |
| `secret` | Evet | `CMS_PREVIEW_SECRET` environment variable ile eşleşmeli |
| `type` | Hayır | İçerik tipi: `page` (varsayılan), `blog`, `docs` |

### Preview Mode Devre Dışı Bırakma
```
GET /exit-preview?redirect={url}
```

| Parametre | Zorunlu | Açıklama |
|-----------|---------|----------|
| `redirect` | Hayır | Çıkış sonrası yönlendirilecek URL (varsayılan: `/`) |

## Middleware İmplementasyonu

Preview mode, `middleware.ts` içinde handle edilir:

```typescript
// /preview route handling
if (pathname === '/preview') {
  // 1. Secret doğrulama
  // 2. Draft mode cookie'leri set et
  // 3. İlgili sayfaya redirect
}

// /exit-preview route handling
if (pathname === '/exit-preview') {
  // 1. Draft mode cookie'leri sil
  // 2. Redirect
}
```

### Draft Mode Cookie'leri

| Cookie | Açıklama |
|--------|----------|
| `__prerender_bypass` | Draft mode aktif flag'i |
| `__next_preview_data` | Şifreli preview data |

## Sayfa Tarafı İmplementasyon

### CMS Page (`[slug]/page.tsx`)

```typescript
import { draftMode } from 'next/headers';
import { getPageBySlug, getPagePreview } from '@/lib/api/services/cms-server';

export default async function DynamicCMSPage({ params }) {
  const { slug } = await params;

  // Draft mode kontrolü
  const draft = await draftMode();
  const isPreview = draft.isEnabled;

  let page;
  if (isPreview) {
    // Preview API - tüm statüdeki içerikleri getirir
    page = await getPagePreview(slug);
    if (!page) {
      page = await getPageBySlug(slug); // Fallback
    }
  } else {
    // Normal API - sadece published içerik
    page = await getPageBySlug(slug);
  }

  return (
    <>
      {isPreview && <PreviewBanner status={page.status} />}
      <PageContent page={page} />
    </>
  );
}
```

### Preview Banner Komponenti

```tsx
{isPreview && (
  <div className="bg-amber-500 text-amber-950 px-4 py-2 text-center text-sm font-medium">
    <span>Önizleme Modu</span>
    <span className="mx-2">•</span>
    <span>Status: {page.status}</span>
    <span className="mx-2">•</span>
    <a href="/exit-preview" className="underline hover:no-underline">
      Önizlemeden Çık
    </a>
  </div>
)}
```

## Backend API Endpoints

### Public Endpoints (Published Only)

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/cms/pages/slug/{slug}` | Published sayfa |
| `GET /api/cms/blog/posts/slug/{slug}` | Published blog post |
| `GET /api/cms/docs/articles/slug/{slug}` | Published döküman |

### Preview Endpoints (Any Status)

| Endpoint | Açıklama |
|----------|----------|
| `GET /api/cms/pages/preview-public/{slug}?secret=xxx` | Herhangi statüdeki sayfa |
| `GET /api/cms/blog/posts/preview-public/{slug}?secret=xxx` | Herhangi statüdeki blog |
| `GET /api/cms/docs/articles/preview-public/{slug}?secret=xxx` | Herhangi statüdeki döküman |

## Frontend Service Layer

### `cms-server.ts` Fonksiyonları

```typescript
// Normal (published only)
export async function getPageBySlug(slug: string): Promise<CmsPage | null>
export async function getPostBySlug(slug: string): Promise<BlogPost | null>
export async function getDocArticleBySlug(slug: string): Promise<DocArticle | null>

// Preview (any status)
export async function getPagePreview(slug: string): Promise<CmsPage | null>
export async function getPostPreview(slug: string): Promise<BlogPost | null>
export async function getDocArticlePreview(slug: string): Promise<DocArticle | null>
```

## Admin Panel Entegrasyonu

### PageEditor.tsx
```typescript
const handlePreview = () => {
  const secret = 'R5VlT2OZ0wVQokJwruUN5e2AuDuf8FJW';
  const url = `https://stoocker.app/preview?slug=${slug}&secret=${secret}&type=page`;
  window.open(url, '_blank');
};
```

### BlogEditor.tsx
```typescript
const url = `https://stoocker.app/preview?slug=${slug}&secret=${secret}&type=blog`;
```

### DocsEditor.tsx
```typescript
const url = `https://stoocker.app/preview?slug=${slug}&secret=${secret}&type=docs`;
```

## Environment Variables

| Variable | Açıklama | Örnek |
|----------|----------|-------|
| `CMS_PREVIEW_SECRET` | Preview authentication secret | `R5VlT2OZ0wVQokJwruUN5e2AuDuf8FJW` |

## Güvenlik

1. **Secret Validation**: Her preview isteği secret ile doğrulanır
2. **Server-side Only**: Secret sadece server tarafında kontrol edilir
3. **HttpOnly Cookies**: Draft mode cookie'leri JavaScript'ten erişilemez
4. **Secure Cookies**: Sadece HTTPS üzerinden gönderilir
5. **SameSite=None**: Cross-origin admin panel desteği

## Hata Durumları

| HTTP Status | Durum | Mesaj |
|-------------|-------|-------|
| 500 | Secret yapılandırılmamış | `Preview secret not configured` |
| 401 | Geçersiz secret | `Invalid preview secret` |
| 400 | Slug eksik | `Slug parameter is required` |
| 404 | İçerik bulunamadı | `Page not found` |

## Akış Diyagramı

```
Admin Panel                    Frontend                      Backend
     │                            │                             │
     │ 1. "Önizle" tıkla          │                             │
     │─────────────────────────▶  │                             │
     │                            │                             │
     │ 2. /preview?slug=x&secret=y&type=page                    │
     │─────────────────────────▶  │                             │
     │                            │                             │
     │                   3. Middleware:                         │
     │                   - Secret doğrula                       │
     │                   - Cookie set                           │
     │                   - Redirect /x                          │
     │                            │                             │
     │                   4. Page render:                        │
     │                   - draftMode().isEnabled = true         │
     │                            │                             │
     │                   5. getPagePreview(slug)                │
     │                            │─────────────────────────▶   │
     │                            │                             │
     │                            │   6. /api/cms/pages/        │
     │                            │      preview-public/x       │
     │                            │      ?secret=y              │
     │                            │                             │
     │                            │◀─────────────────────────   │
     │                            │   7. Draft page data        │
     │                            │                             │
     │◀────────────────────────── │                             │
     │ 8. Preview sayfası         │                             │
     │    (amber banner ile)      │                             │
     │                            │                             │
```

## İlgili Dosyalar

### Frontend (stocker-nextjs)
- `src/middleware.ts` - Preview route handling
- `src/app/(public)/[slug]/page.tsx` - CMS page rendering
- `src/app/(public)/blog/[slug]/page.tsx` - Blog post rendering
- `src/lib/api/services/cms-server.ts` - API service layer

### Admin Panel (stocker-admin-v2)
- `src/pages/cms/PageEditor.tsx` - Sayfa editörü
- `src/pages/cms/BlogEditor.tsx` - Blog editörü
- `src/pages/cms/DocsEditor.tsx` - Döküman editörü

### Backend (Stocker.API)
- `Controllers/Public/CMS/PublicCmsPagesController.cs`
- `Controllers/Public/CMS/PublicCmsBlogController.cs`
- `Controllers/Public/CMS/PublicCmsDocsController.cs`

## Troubleshooting

### Preview 404 Döndürüyor

1. `CMS_PREVIEW_SECRET` environment variable set edilmiş mi kontrol et
2. Secret değerleri (admin & frontend) eşleşiyor mu kontrol et
3. Backend API'de `preview-public` endpoint'i var mı kontrol et
4. Slug doğru mu kontrol et

### Draft Mode Çalışmıyor

1. Cookie'ler set edilmiş mi (DevTools > Application > Cookies)
2. `__prerender_bypass` cookie'si var mı
3. Sayfa component'inde `draftMode()` doğru kullanılıyor mu

### Banner Görünmüyor

1. `isPreview` değeri true mu kontrol et
2. Component'te conditional rendering doğru mu
