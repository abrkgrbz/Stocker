# PHASE 3: MONITORING & OBSERVABILITY - İMPLEMENTASYON PLANI

## 🎯 Genel Hedef
API'nin production ortamında izlenebilirliğini (observability) sağlamak, performans metriklerini toplamak, audit logging ile güvenlik ve compliance sağlamak.

---

## 📋 ANA ÖZELLIKLER

### 1. AUDIT LOGGING (En Öncelikli) ✨
**Amaç**: Tüm önemli işlemleri kaydetmek, compliance ve güvenlik için audit trail oluşturmak

#### 1.1. Audit Log Infrastructure
**Yapılacaklar:**
- [ ] `AuditLog` entity oluşturma
  - UserId, TenantId, Action, EntityType, EntityId
  - OldValues, NewValues (JSON), Changes
  - IpAddress, UserAgent, Timestamp
  - RequestId (Correlation ID ile entegrasyon)

- [ ] `IAuditLogService` interface ve implementation
  - LogCreate, LogUpdate, LogDelete, LogRead
  - LogAuthentication, LogAuthorization
  - Async batch processing

- [ ] `AuditLogMiddleware` oluşturma
  - Tüm API isteklerini otomatik loglama
  - Request/Response body capture (optional)
  - Performance metrics (response time)

- [ ] Audit Log Storage
  - SQL Server (structured data)
  - Elasticsearch (opsiyonel, log search için)
  - Retention policy (90 gün default)

#### 1.2. Audit Events
**Loglanacak Eventler:**
- Authentication: Login, Logout, Login Failed, Password Reset
- Authorization: Permission Denied, Role Changed
- Data Operations: Create, Update, Delete (önemli entityler için)
- Configuration Changes: Settings Updated, Features Enabled/Disabled
- Security Events: Suspicious Activity, Rate Limit Exceeded
- Admin Operations: User Management, System Configuration

**Örnek Log Entry:**
```json
{
  "id": "uuid",
  "timestamp": "2025-01-13T16:30:00Z",
  "userId": "user-id",
  "tenantId": "tenant-id",
  "action": "ProductUpdated",
  "entityType": "Product",
  "entityId": "product-123",
  "oldValues": {"price": 100, "stock": 50},
  "newValues": {"price": 120, "stock": 45},
  "changes": ["price", "stock"],
  "ipAddress": "192.168.1.100",
  "userAgent": "Mozilla/5.0...",
  "requestId": "correlation-id",
  "duration": 150,
  "success": true
}
```

#### 1.3. Audit Query API
**Endpoints:**
```
GET  /api/admin/audit-logs                    # Paginated audit log list
GET  /api/admin/audit-logs/{id}               # Single audit log
GET  /api/admin/audit-logs/user/{userId}      # User activity history
GET  /api/admin/audit-logs/entity/{type}/{id} # Entity change history
POST /api/admin/audit-logs/search             # Advanced search
GET  /api/admin/audit-logs/export             # Export to CSV/JSON
```

---

### 2. METRICS & PERFORMANCE MONITORING 📊
**Amaç**: Real-time performans metrikleri toplamak ve görselleştirmek (Prometheus + Grafana)

#### 2.1. Prometheus Metrics
**Yapılacaklar:**
- [ ] `prometheus-net.AspNetCore` NuGet package
- [ ] Metrics Middleware oluşturma
- [ ] Custom metrics registration

**Toplanacak Metrikler:**

**HTTP Metrics:**
```
http_requests_total                    # Total request count
http_requests_duration_seconds         # Request duration histogram
http_requests_in_progress              # Current active requests
http_response_size_bytes               # Response size distribution
```

**Business Metrics:**
```
api_calls_by_endpoint                  # Endpoint bazında çağrı sayısı
api_calls_by_tenant                    # Tenant bazında kullanım
api_errors_total                       # Hata sayısı (by type, endpoint)
api_rate_limit_exceeded                # Rate limit aşımları
```

**Cache Metrics:**
```
cache_hits_total                       # Cache hit count
cache_misses_total                     # Cache miss count
cache_hit_ratio                        # Hit ratio percentage
cache_size_bytes                       # Cache memory usage
```

**Database Metrics:**
```
db_queries_total                       # Query count
db_queries_duration_seconds            # Query duration
db_connections_active                  # Active connections
db_connection_pool_size                # Pool size
```

**Authentication Metrics:**
```
auth_login_attempts_total              # Login attempts
auth_login_failures_total              # Failed logins
auth_token_issued_total                # Issued tokens
auth_active_sessions                   # Active sessions
```

#### 2.2. Metrics Endpoints
```
GET /metrics                           # Prometheus format metrics
GET /api/admin/metrics/summary         # Human-readable summary
GET /api/admin/metrics/health          # System health status
```

#### 2.3. Grafana Dashboards
**Dashboard Templates:**
- API Overview Dashboard
- Performance Dashboard
- Error Rate Dashboard
- Business Metrics Dashboard
- Cache Performance Dashboard

---

### 3. API USAGE ANALYTICS 📈
**Amaç**: API kullanım istatistiklerini toplamak ve raporlamak

#### 3.1. Usage Tracking
**Yapılacaklar:**
- [ ] `ApiUsageService` oluşturma
- [ ] Usage data aggregation (hourly, daily, monthly)
- [ ] Time-series database integration (opsiyonel: InfluxDB)

**Toplanacak Veriler:**
```
- Endpoint usage statistics
- Request/response size distribution
- Response time percentiles (p50, p95, p99)
- Error rate by endpoint
- Usage by tenant/user
- Geographic distribution (by IP)
- Client type distribution (User-Agent)
- Peak usage times
- API version usage
```

#### 3.2. Usage Analytics API
**Endpoints:**
```
GET  /api/admin/analytics/overview              # Dashboard data
GET  /api/admin/analytics/endpoints             # Endpoint statistics
GET  /api/admin/analytics/tenants               # Tenant usage
GET  /api/admin/analytics/users                 # User activity
GET  /api/admin/analytics/trends                # Usage trends
POST /api/admin/analytics/custom-report         # Custom reports
GET  /api/admin/analytics/export                # Export analytics
```

**Örnek Response:**
```json
{
  "period": "2025-01-01 to 2025-01-13",
  "totalRequests": 1500000,
  "successRate": 99.2,
  "averageResponseTime": 85,
  "topEndpoints": [
    {
      "endpoint": "/api/products",
      "requests": 50000,
      "avgResponseTime": 45,
      "errorRate": 0.5
    }
  ],
  "topTenants": [
    {
      "tenantId": "tenant-1",
      "requests": 250000,
      "bandwidth": "15GB"
    }
  ],
  "errorDistribution": {
    "400": 1200,
    "401": 500,
    "404": 300,
    "500": 100
  }
}
```

---

### 4. DISTRIBUTED TRACING (Opsiyonel) 🔍
**Amaç**: Microservices ortamında request'leri trace etmek

#### 4.1. OpenTelemetry Integration
**Yapılacaklar:**
- [ ] OpenTelemetry SDK integration
- [ ] Jaeger/Zipkin exporter configuration
- [ ] Automatic instrumentation
- [ ] Custom span creation

**Trace Edilecek İşlemler:**
- HTTP requests (already via Activity)
- Database queries
- Cache operations
- External API calls
- SignalR messages
- Background jobs

---

### 5. HEALTH CHECKS ENHANCEMENT 🏥
**Amaç**: Sistem sağlığını detaylı olarak izlemek

#### 5.1. Comprehensive Health Checks
**Yapılacaklar:**
- [ ] Database health check (connection, query performance)
- [ ] Redis health check (connection, memory)
- [ ] External services health check
- [ ] Disk space health check
- [ ] Memory usage health check
- [ ] SignalR hub health check

#### 5.2. Health Check API
```
GET /health                            # Overall health (liveness)
GET /health/ready                      # Readiness probe
GET /health/detailed                   # Detailed component health
GET /api/admin/health/components       # Individual components
```

**Örnek Detailed Health Response:**
```json
{
  "status": "Healthy",
  "totalDuration": "00:00:00.0450000",
  "entries": {
    "database": {
      "status": "Healthy",
      "duration": "00:00:00.0230000",
      "data": {
        "connectionString": "Server=...",
        "responseTime": 23
      }
    },
    "redis": {
      "status": "Healthy",
      "duration": "00:00:00.0150000",
      "data": {
        "memoryUsage": "150MB",
        "connectedClients": 5
      }
    },
    "disk": {
      "status": "Warning",
      "duration": "00:00:00.0020000",
      "data": {
        "freeSpace": "5GB",
        "threshold": "10GB"
      }
    }
  }
}
```

---

### 6. LOGGING ENHANCEMENT 📝
**Amaç**: Structured logging ve log aggregation

#### 6.1. Structured Logging
**Yapılacaklar:**
- [ ] Serilog enrichers (User, Tenant, RequestId)
- [ ] Log level configuration per namespace
- [ ] Sensitive data masking
- [ ] Exception serialization

#### 6.2. Log Sinks
**Yapılacaklar:**
- [ ] File sink (rolling files)
- [ ] Seq sink (already configured)
- [ ] Elasticsearch sink (opsiyonel)
- [ ] Azure Application Insights (opsiyonel)

---

## 🏗️ İMPLEMENTASYON SIRASI

### Faz 3.1: Audit Logging (1-2 gün)
1. ✅ AuditLog entity ve DbContext
2. ✅ IAuditLogService implementation
3. ✅ AuditLogMiddleware
4. ✅ Audit query endpoints
5. ✅ Test endpoints

### Faz 3.2: Metrics & Prometheus (1 gün)
1. ✅ Prometheus-net integration
2. ✅ Custom metrics
3. ✅ Metrics endpoint
4. ✅ Grafana dashboard templates

### Faz 3.3: Usage Analytics (1 gün)
1. ✅ ApiUsageService
2. ✅ Usage aggregation
3. ✅ Analytics endpoints
4. ✅ Export functionality

### Faz 3.4: Health Checks (0.5 gün)
1. ✅ Enhanced health checks
2. ✅ Component-level health
3. ✅ Health check UI (opsiyonel)

### Faz 3.5: Logging Enhancement (0.5 gün)
1. ✅ Structured logging setup
2. ✅ Additional sinks
3. ✅ Log filtering

### Faz 3.6: Integration & Testing (0.5 gün)
1. ✅ End-to-end testing
2. ✅ Documentation
3. ✅ Performance testing

**Toplam Tahmini Süre**: 4-5 gün

---

## 📦 GEREKLI NUGET PACKAGES

```xml
<!-- Metrics & Monitoring -->
<PackageReference Include="prometheus-net.AspNetCore" Version="8.2.1" />
<PackageReference Include="prometheus-net.AspNetCore.HealthChecks" Version="8.2.1" />

<!-- Health Checks -->
<PackageReference Include="AspNetCore.HealthChecks.Redis" Version="7.0.0" />
<PackageReference Include="AspNetCore.HealthChecks.SqlServer" Version="7.0.0" />
<PackageReference Include="AspNetCore.HealthChecks.UI" Version="7.0.0" />
<PackageReference Include="AspNetCore.HealthChecks.UI.Client" Version="7.0.0" />

<!-- Tracing (Opsiyonel) -->
<PackageReference Include="OpenTelemetry.Exporter.Jaeger" Version="1.5.0" />
<PackageReference Include="OpenTelemetry.Extensions.Hosting" Version="1.7.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.AspNetCore" Version="1.7.0" />
<PackageReference Include="OpenTelemetry.Instrumentation.Http" Version="1.7.0" />

<!-- Logging -->
<PackageReference Include="Serilog.Sinks.Elasticsearch" Version="9.0.3" />
<PackageReference Include="Serilog.Enrichers.Environment" Version="2.3.0" />
<PackageReference Include="Serilog.Enrichers.Thread" Version="3.1.0" />
```

---

## 🎯 BEKLENEN ÇIKTILAR

### Monitoring Dashboards
1. **API Overview Dashboard** (Grafana)
   - Request rate, response time, error rate
   - Top endpoints, top tenants
   - Cache hit ratio

2. **Performance Dashboard**
   - Response time percentiles
   - Database query performance
   - Memory/CPU usage

3. **Business Metrics Dashboard**
   - API usage by tenant
   - Revenue metrics
   - User activity

### API Endpoints
```
# Audit Logs
GET  /api/admin/audit-logs
GET  /api/admin/audit-logs/{id}
POST /api/admin/audit-logs/search

# Metrics
GET  /metrics (Prometheus)
GET  /api/admin/metrics/summary

# Analytics
GET  /api/admin/analytics/overview
GET  /api/admin/analytics/endpoints
GET  /api/admin/analytics/export

# Health
GET  /health
GET  /health/ready
GET  /health/detailed
```

### Documentation
- Audit Logging Guide
- Metrics Collection Guide
- Analytics API Documentation
- Grafana Dashboard Setup Guide
- Alert Configuration Guide

---

## ⚙️ CONFIGURATION EXAMPLES

### appsettings.json
```json
{
  "Monitoring": {
    "EnableMetrics": true,
    "EnableAuditLogging": true,
    "EnableAnalytics": true,
    "EnableTracing": false
  },
  "AuditLog": {
    "RetentionDays": 90,
    "LogRequestBody": false,
    "LogResponseBody": false,
    "ExcludedPaths": ["/health", "/metrics", "/swagger"]
  },
  "Prometheus": {
    "Endpoint": "/metrics",
    "EnableDetailedMetrics": true
  },
  "Analytics": {
    "AggregationInterval": "1h",
    "RetentionDays": 365
  },
  "HealthChecks": {
    "Endpoints": {
      "UI": "/health-ui",
      "API": "/health"
    }
  }
}
```

---

## 🚀 SONUÇ

Phase 3 tamamlandığında:
- ✅ Tüm önemli işlemler audit log'a kaydediliyor
- ✅ Real-time metrikler Prometheus üzerinden toplanıyor
- ✅ Grafana dashboards ile görselleştirme yapılabiliyor
- ✅ API kullanım istatistikleri detaylı olarak takip ediliyor
- ✅ System health monitoring aktif
- ✅ Production-ready observability altyapısı hazır

**Öncelik Sırası:**
1. 🔥 Audit Logging (Compliance ve güvenlik için kritik)
2. 📊 Metrics & Prometheus (Performance monitoring)
3. 📈 Usage Analytics (Business insights)
4. 🏥 Health Checks Enhancement
5. 🔍 Distributed Tracing (Opsiyonel, microservices için)

---

## 💡 ÖNERİLER

1. **Start Small**: Önce Audit Logging ve basic metrics ile başla
2. **Iterate**: Metrics'i ihtiyaç doğrultusunda genişlet
3. **Alert Rules**: Prometheus AlertManager ile kritik metrikler için uyarı kur
4. **Dashboard Templates**: Hazır Grafana dashboard'ları kullan
5. **Performance**: Metrics collection'ın performance overhead'i düşük tut
6. **Storage**: Audit log ve metrics için uygun retention policy belirle
7. **Security**: Sensitive data'yı audit log'a kaydetme
8. **Testing**: Production'a geçmeden önce metrics ve alerting'i test et