# Stocker Coverage İyileştirme Stratejisi

## Mevcut Durum
- **Overall Coverage**: %12 (ÇOK DÜŞÜK!)
- **API Layer**: %0 - Hiçbir controller test edilmemiş
- **Identity Layer**: %0 - Güvenlik kritik, test yok
- **Application Layer**: %2.7 - İş mantığı test edilmemiş

## Kritik Sorunlar
1. Yeni eklenen testler henüz gerçek kodu kapsamıyor (mock kullanıyor)
2. Integration testlerin çoğu başarısız (DB bağlantı sorunları)
3. Existing testler sadece basit entity validation'ları kapsıyor

## Acil Eylem Planı

### 1. Hafta: Kritik Path Coverage (%12 → %30)
- Authentication/Authorization testleri
- Tenant isolation testleri
- Payment processing testleri
- Critical API endpoints

### 2. Hafta: Core Business Logic (%30 → %50)
- CQRS command/query handlers
- Domain business rules
- Service layer tests
- Integration test fixes

### 3. Hafta: Full API Coverage (%50 → %70)
- All controller actions
- Error handling paths
- Validation scenarios
- Edge cases

## Test Önceliklendirme
1. **P0 - Security Critical**: Auth, Multi-tenant isolation
2. **P1 - Business Critical**: Payments, Invoicing, Customer management
3. **P2 - Important**: Reporting, Settings, Notifications
4. **P3 - Nice to Have**: Admin features, Monitoring

## Örnek Test Dosyaları Oluşturuldu
- AuthControllerTests.cs - Unit test örneği
- CreateCustomerCommandHandlerTests.cs - Handler test örneği
- AuthControllerIntegrationTests.cs - Integration test örneği

## Sonraki Adımlar
1. Integration test infrastructure'ı düzelt (DB connection issues)
2. Her sprint'te minimum %10 coverage artışı hedefle
3. CI/CD'ye coverage gate ekle (minimum %30 başlangıç)
4. Team training: TDD practices
5. Coverage dashboard oluştur