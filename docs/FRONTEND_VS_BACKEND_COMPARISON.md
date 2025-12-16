# Frontend vs Backend Endpoint Karsilastirmasi

Bu dokuman, backend API endpoint'leri ile frontend hook/service'lerini karsilastirarak eksik implementasyonlari listeler.

## Projeler

- **stocker-nextjs**: Ana tenant uygulamasi (CRM, HR, Inventory, Sales, Purchase)
- **stocker-admin**: Master Admin paneli (Tenant yonetimi, CMS, Monitoring)

## Ozet

| Modul | Backend Endpoint | Frontend | Kapsam | Proje |
|-------|-----------------|----------|--------|-------|
| CRM | 80+ | 130+ hooks | ~100% ✅ | stocker-nextjs |
| Inventory | 90+ | 110+ hooks | ~100% ✅ | stocker-nextjs |
| HR | 70+ | 85+ hooks | ~100% ✅ | stocker-nextjs |
| Sales | 80+ | 100+ hooks | ~100% ✅ | stocker-nextjs |
| Purchase | 50+ | 75+ hooks | ~100% ✅ | stocker-nextjs |
| Tenant Core | 50+ | ~35 hooks | ~70% | stocker-nextjs |
| Master Admin | 45+ | 350+ services | ~100% ✅ | stocker-admin |
| CMS | 100+ | 100+ services | ~100% ✅ | stocker-admin |

---

## ✅ TAMAMLANAN HOOK'LAR

### Sales Modulu
Asagidaki hook'lar `useSales.ts` dosyasinda tanimlanmis ve calisiyor:

**Siparis Islemleri:**
- ✅ `useConfirmSalesOrder` - Siparis onayi
- ✅ `useShipSalesOrder` - Gonderim islemi
- ✅ `useDeliverSalesOrder` - Teslim islemi
- ✅ `useCompleteSalesOrder` - Tamamlama islemi
- ✅ `useCancelSalesOrder` - Iptal islemi
- ✅ `useIssueInvoice` - Fatura kesme
- ✅ `useOverdueInvoices` - Vadesi gecmis faturalar

**Teklif Islemleri (Quotations):**
- ✅ `useQuotations` - Teklifleri listele
- ✅ `useQuotation` - Teklif detayi
- ✅ `useQuotationsByCustomer` - Musteriye gore teklifler
- ✅ `useQuotationsBySalesPerson` - Satisci bazli teklifler
- ✅ `useExpiringQuotations` - Suresi dolmak uzere olan teklifler
- ✅ `useQuotationRevisions` - Teklif revizyonlari
- ✅ `useQuotationStatistics` - Teklif istatistikleri
- ✅ `useCreateQuotation` - Teklif olustur
- ✅ `useUpdateQuotation` - Teklif guncelle
- ✅ `useAddQuotationItem` - Teklife kalem ekle
- ✅ `useRemoveQuotationItem` - Tekliften kalem sil
- ✅ `useSubmitQuotationForApproval` - Onaya gonder
- ✅ `useApproveQuotation` - Teklif onayla
- ✅ `useSendQuotation` - Teklif gonder
- ✅ `useAcceptQuotation` - Teklif kabul et
- ✅ `useRejectQuotation` - Teklif reddet
- ✅ `useCancelQuotation` - Teklif iptal et
- ✅ `useConvertQuotationToOrder` - Siparise donustur
- ✅ `useCreateQuotationRevision` - Revizyon olustur
- ✅ `useDeleteQuotation` - Teklif sil

**Indirim Islemleri (Discounts):**
- ✅ `useDiscounts` - Indirimleri listele
- ✅ `useDiscount` - Indirim detayi
- ✅ `useDiscountByCode` - Kod ile indirim ara
- ✅ `useActiveDiscounts` - Aktif indirimler
- ✅ `useValidateDiscountCode` - Indirim kodu dogrula
- ✅ `useCreateDiscount` - Indirim olustur
- ✅ `useUpdateDiscount` - Indirim guncelle
- ✅ `useActivateDiscount` - Indirim aktifle
- ✅ `useDeactivateDiscount` - Indirim pasifle
- ✅ `useDeleteDiscount` - Indirim sil

**Komisyon Plani (Commission Plans):**
- ✅ `useCommissionPlans` - Komisyon planlarini listele
- ✅ `useCommissionPlan` - Komisyon plan detayi
- ✅ `useActiveCommissionPlans` - Aktif komisyon planlari
- ✅ `useCreateCommissionPlan` - Komisyon plani olustur
- ✅ `useUpdateCommissionPlan` - Komisyon plani guncelle
- ✅ `useAddCommissionTier` - Kademe ekle
- ✅ `useRemoveCommissionTier` - Kademe sil
- ✅ `useActivateCommissionPlan` - Plan aktifle
- ✅ `useDeactivateCommissionPlan` - Plan pasifle
- ✅ `useDeleteCommissionPlan` - Plan sil

**Satis Komisyonlari (Sales Commissions):**
- ✅ `useSalesCommissions` - Komisyonlari listele
- ✅ `useSalesCommission` - Komisyon detayi
- ✅ `useCommissionsBySalesPerson` - Satisci bazli komisyonlar
- ✅ `usePendingCommissions` - Bekleyen komisyonlar
- ✅ `useApprovedCommissions` - Onaylanan komisyonlar
- ✅ `useCommissionSummary` - Komisyon ozeti
- ✅ `useSalesPersonCommissionSummary` - Satisci komisyon ozeti
- ✅ `useCalculateCommission` - Komisyon hesapla
- ✅ `useApproveCommission` - Komisyon onayla
- ✅ `useRejectCommission` - Komisyon reddet
- ✅ `useMarkCommissionAsPaid` - Odendi isaretle
- ✅ `useCancelCommission` - Komisyon iptal
- ✅ `useBulkApproveCommissions` - Toplu onay
- ✅ `useBulkMarkCommissionsAsPaid` - Toplu odendi isaretle

**Satis Iadeleri (Sales Returns):**
- ✅ `useSalesReturns` - Iadeleri listele
- ✅ `useSalesReturn` - Iade detayi
- ✅ `useSalesReturnsByOrder` - Siparise gore iadeler
- ✅ `useSalesReturnsByCustomer` - Musteriye gore iadeler
- ✅ `usePendingReturns` - Bekleyen iadeler
- ✅ `useReturnSummary` - Iade ozeti
- ✅ `useReturnableItems` - Iade edilebilir urunler
- ✅ `useCreateSalesReturn` - Iade olustur
- ✅ `useUpdateSalesReturn` - Iade guncelle
- ✅ `useAddSalesReturnItem` - Iade urunu ekle
- ✅ `useRemoveSalesReturnItem` - Iade urunu sil
- ✅ `useSubmitSalesReturn` - Iade gonder
- ✅ `useApproveSalesReturn` - Iade onayla
- ✅ `useRejectSalesReturn` - Iade reddet
- ✅ `useReceiveSalesReturn` - Iade teslim al
- ✅ `useProcessRefund` - Iade isle
- ✅ `useCompleteSalesReturn` - Iade tamamla
- ✅ `useCancelSalesReturn` - Iade iptal
- ✅ `useMarkItemAsRestocked` - Urunu stoga ekle
- ✅ `useMarkReturnAsRestocked` - Iadeyi stoga ekle
- ✅ `useDeleteSalesReturn` - Iade sil

### CRM Modulu
Yeni eklenen hook'lar:
- ✅ `useNotifications` - Bildirimleri listele
- ✅ `useMarkNotificationAsRead` - Bildirimi okundu isaretle
- ✅ `useMarkAllNotificationsAsRead` - Tum bildirimleri okundu isaretle
- ✅ `useDeleteNotification` - Bildirim sil
- ✅ `useReminders` - Hatirlaticilar listele
- ✅ `useCreateReminder` - Hatirlatici olustur
- ✅ `useUpdateReminder` - Hatirlatici guncelle
- ✅ `useSnoozeReminder` - Hatirlatici ertele
- ✅ `useCompleteReminder` - Hatirlatici tamamla
- ✅ `useDeleteReminder` - Hatirlatici sil
- ✅ `useSendTestEmail` - Test e-postasi gonder

### Inventory Modulu
Mevcut ve calisan hook'lar:
- ✅ `useProductBundles`, `useCreateProductBundle`, `useUpdateProductBundle`, `useDeleteProductBundle`
- ✅ `useProductAttributes`, `useCreateProductAttribute`, `useUpdateProductAttribute`, `useDeleteProductAttribute`
- ✅ `useLotBatches`, `useCreateLotBatch`, `useUpdateLotBatch`
- ✅ `useBarcodes`, `useGenerateBarcode`, `useScanBarcode`

### HR Modulu
Mevcut ve calisan hook'lar:
- ✅ `usePerformanceReviews`, `useCreatePerformanceReview`, `useUpdatePerformanceReview`
- ✅ `useTrainings`, `useCreateTraining`, `useUpdateTraining`, `useDeleteTraining`, `useEnrollTraining`
- ✅ `useExpenses`, `useCreateExpense`, `useUpdateExpense`, `useApproveExpense`, `useRejectExpense`
- ✅ `useAnnouncements`, `useCreateAnnouncement`, `useUpdateAnnouncement`, `useDeleteAnnouncement`

---

## ⚠️ KALAN EKSIKLER (Dusuk Oncelik)

### Tenant Core
| Backend Endpoint | Method | Eksik Hook | Oncelik |
|-----------------|--------|------------|---------|
| `/tenant/onboarding/status` | GET | useOnboardingStatus | DUSUK |
| `/tenant/onboarding/complete-step` | POST | useCompleteOnboardingStep | DUSUK |
| `/tenant/onboarding/skip-step` | POST | useSkipOnboardingStep | DUSUK |
| `/tenant/dashboard` | GET | useTenantDashboard | ORTA |

> **Not**: Onboarding islemi `useOnboarding` hook'u ile halihazirda yonetiliyor. Bu hook'lar ek granular kontrol icin.

### CRM Email Templates (Henuz Backend'de Yok)
| Backend Endpoint | Method | Eksik Hook | Oncelik |
|-----------------|--------|------------|---------|
| `/crm/email/templates` | GET | useEmailTemplates | DUSUK |
| `/crm/email/templates` | POST | useCreateEmailTemplate | DUSUK |
| `/crm/email/history/{customerId}` | GET | useEmailHistory | DUSUK |

> **Not**: Email template endpoint'leri henuz backend'de implemente edilmemis.

---

## NOTLAR

1. **Frontend Hook Dosyalari** (Guncellenmis):
   - `src/lib/api/hooks/useCRM.ts` - 2,460+ satir (Notifications, Reminders, Email eklendi)
   - `src/lib/api/hooks/useHR.ts` - 2,800+ satir
   - `src/lib/api/hooks/useInventory.ts` - 3,500+ satir
   - `src/lib/api/hooks/usePurchase.ts` - Kapsamli
   - `src/lib/api/hooks/useSales.ts` - Tam kapsamli (248 satir)

2. **Pattern**:
   - Tum hook'lar React Query (TanStack Query) kullanıyor
   - Query key'ler tutarli format takip ediyor
   - Mutation'lar otomatik cache invalidation yapiyor

3. **Durum**:
   - ✅ Master Admin paneli stocker-admin projesinde tam kapsamli
   - ✅ Sales modulu tam kapsamli
   - ✅ CRM modulu Notification ve Reminder hook'lari eklendi
   - ✅ Inventory ve HR modulleri tam kapsamli
   - ⚠️ Tenant Core onboarding hook'lari dusuk oncelikli

---

*Son Guncelleme: 2025-12-16*
