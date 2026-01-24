# İyileştirme 9: Girdi Temizliği (Input Sanitization)

**İlgili Senaryo:** Kullanıcı Adı Olarak HTML Kodu Girmek (Level 3)
**Öncelik:** Orta (P2) - Güvenlik

## Sorun
Kullanıcı girdileri (Ad, Soyad, Notlar vb.) veritabanına ham (raw) olarak kaydedilmektedir. Eğer kullanıcı HTML veya Script tagleri girerse, bu içerik arayüzde render edildiğinde XSS (Cross-Site Scripting) zafiyetine yol açabilir.

## Çözüm Önerisi
Girdiler ya Backend'e girerken (Input) ya da Frontend'e çıkarken (Output) temizlenmelidir. En güvenlisi, veritabanına girerken HTML taglerinden arındırmaktır.

### Teknik Adımlar
1.  **Sanitizer Library:** `Ganymede` veya `HtmlSanitizer` gibi bir kütüphane kullanılmalı.
2.  **Validator Middleware:** FluentValidation pipeline'ına veya MediatR pipeline'ına bir `SanitizationBehavior` eklenerek tüm string alanlar otomatik temizlenebilir.

```csharp
// StringExtensions.cs
public static string Sanitize(this string input) 
{
    return new HtmlSanitizer().Sanitize(input); // "<b>Admin</b>" -> "Admin"
}
```
