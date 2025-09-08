import React, { useState, useEffect } from 'react';
import '../../styles/index.css';

// Custom Chart Component (simple implementation)
const SimpleChart: React.FC<{ data: number[]; color: string }> = ({ data, color }) => {
  const maxValue = Math.max(...data);
  const chartHeight = 200;
  
  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', height: chartHeight + 'px', gap: '8px' }}>
      {data.map((value, index) => (
        <div
          key={index}
          style={{
            flex: 1,
            height: `${(value / maxValue) * chartHeight}px`,
            backgroundColor: color,
            borderRadius: '4px 4px 0 0',
            transition: 'height 0.3s ease',
            opacity: 0.8 + (index * 0.02),
          }}
        />
      ))}
    </div>
  );
};

const CustomDashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => setLoading(false), 1000);
  }, []);

  const stats = [
    {
      title: 'Toplam Kullanıcı',
      value: '12,487',
      change: '+12.5%',
      trend: 'up',
      color: '#009ef7',
      bgColor: '#e1f0ff',
    },
    {
      title: 'Aktif Tenants',
      value: '487',
      change: '+8.2%',
      trend: 'up',
      color: '#50cd89',
      bgColor: '#e8f5ff',
    },
    {
      title: 'Aylık Gelir',
      value: '₺487,250',
      change: '+24.5%',
      trend: 'up',
      color: '#7239ea',
      bgColor: '#f1e8ff',
    },
    {
      title: 'Aktif Paketler',
      value: '24',
      change: '-2.4%',
      trend: 'down',
      color: '#ffc700',
      bgColor: '#fff8dd',
    },
  ];

  const revenueData = [420, 380, 450, 470, 510, 480, 520, 545, 580, 590, 620, 650];
  const userGrowthData = [145, 189, 234, 178, 256, 289, 312];

  const recentActivities = [
    { id: 1, user: 'Ahmet Yılmaz', action: 'Yeni tenant oluşturdu', time: '2 dakika önce', type: 'success' },
    { id: 2, user: 'Mehmet Kaya', action: 'Premium pakete yükseltme yaptı', time: '15 dakika önce', type: 'info' },
    { id: 3, user: 'Ayşe Demir', action: 'Ödeme başarısız', time: '1 saat önce', type: 'error' },
    { id: 4, user: 'Fatma Şahin', action: 'Yeni kullanıcı ekledi', time: '2 saat önce', type: 'success' },
    { id: 5, user: 'Ali Çelik', action: 'Paketi iptal etti', time: '3 saat önce', type: 'warning' },
  ];

  const topTenants = [
    { name: 'Acme Corp', users: 245, plan: 'Enterprise', revenue: '₺45,000', growth: '+15%' },
    { name: 'TechStart Inc', users: 189, plan: 'Premium', revenue: '₺32,000', growth: '+8%' },
    { name: 'Global Systems', users: 156, plan: 'Premium', revenue: '₺28,500', growth: '+12%' },
    { name: 'Innovation Labs', users: 134, plan: 'Business', revenue: '₺24,000', growth: '-3%' },
    { name: 'Digital Solutions', users: 98, plan: 'Business', revenue: '₺18,000', growth: '+5%' },
  ];

  const packageDistribution = [
    { name: 'Enterprise', value: 35, color: '#667eea' },
    { name: 'Premium', value: 25, color: '#f59e0b' },
    { name: 'Business', value: 20, color: '#10b981' },
    { name: 'Starter', value: 15, color: '#ef4444' },
    { name: 'Free', value: 5, color: '#94a3b8' },
  ];

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'success': return '#50cd89';
      case 'error': return '#f1416c';
      case 'warning': return '#ffc700';
      default: return '#009ef7';
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-description">Sistem genelinde özet ve istatistikler</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light btn-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 8C14 8 14 6.5 14 4C14 2 12 2 12 2H4C4 2 2 2 2 4C2 6.5 2 8 2 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M2 8V12C2 14 4 14 4 14H12C12 14 14 14 14 12V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="ms-2">Rapor İndir</span>
            </button>
            <select className="form-select" style={{ width: '150px' }} value={dateRange} onChange={(e) => setDateRange(e.target.value)}>
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 3 Ay</option>
            </select>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="row mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="col-12 col-md-6 col-lg-3 mb-3">
            <div className="card">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-start mb-3">
                  <div>
                    <p className="text-muted mb-2" style={{ fontSize: '13px' }}>{stat.title}</p>
                    <h3 className="fw-bold mb-0">{stat.value}</h3>
                  </div>
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '8px',
                    backgroundColor: stat.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                      <rect x="5" y="5" width="14" height="14" rx="2" stroke={stat.color} strokeWidth="2"/>
                    </svg>
                  </div>
                </div>
                <div className="d-flex align-items-center gap-1">
                  {stat.trend === 'up' ? (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 12L8 8L12 12" stroke="#50cd89" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4L8 8L12 4" stroke="#f1416c" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  )}
                  <span style={{ 
                    color: stat.trend === 'up' ? '#50cd89' : '#f1416c',
                    fontSize: '13px',
                    fontWeight: 500,
                  }}>
                    {stat.change}
                  </span>
                  <span className="text-muted" style={{ fontSize: '12px' }}>geçen aya göre</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="row mb-4">
        {/* Revenue Chart */}
        <div className="col-12 col-lg-8 mb-3">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Gelir Analizi</h5>
              <p className="card-subtitle">Aylık gelir takibi</p>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted">₺650,000</span>
                  <span className="text-muted">Bu Ay</span>
                </div>
                <SimpleChart data={revenueData} color="#009ef7" />
              </div>
              <div className="d-flex justify-content-center gap-4 mt-3">
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#009ef7' }}></div>
                  <span className="text-muted" style={{ fontSize: '12px' }}>Gelir</span>
                </div>
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: '12px', height: '12px', borderRadius: '2px', backgroundColor: '#f59e0b' }}></div>
                  <span className="text-muted" style={{ fontSize: '12px' }}>Gider</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Package Distribution */}
        <div className="col-12 col-lg-4 mb-3">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Paket Dağılımı</h5>
              <p className="card-subtitle">Aktif abonelikler</p>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-center mb-4">
                <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                  <svg width="180" height="180" viewBox="0 0 180 180">
                    <circle cx="90" cy="90" r="70" fill="none" stroke="#e1e3ea" strokeWidth="20"/>
                    <circle cx="90" cy="90" r="70" fill="none" stroke="#009ef7" strokeWidth="20"
                      strokeDasharray="439.82" strokeDashoffset="100"
                      transform="rotate(-90 90 90)"/>
                  </svg>
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}>
                    <div className="fw-bold" style={{ fontSize: '24px' }}>487</div>
                    <div className="text-muted" style={{ fontSize: '12px' }}>Toplam</div>
                  </div>
                </div>
              </div>
              <div>
                {packageDistribution.map((pkg, index) => (
                  <div key={index} className="d-flex justify-content-between align-items-center mb-2">
                    <div className="d-flex align-items-center gap-2">
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: pkg.color }}></div>
                      <span style={{ fontSize: '13px' }}>{pkg.name}</span>
                    </div>
                    <span className="fw-semibold" style={{ fontSize: '13px' }}>{pkg.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Second Row */}
      <div className="row mb-4">
        {/* User Growth */}
        <div className="col-12 col-lg-4 mb-3">
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">Kullanıcı Büyümesi</h5>
              <p className="card-subtitle">Haftalık yeni kullanıcılar</p>
            </div>
            <div className="card-body">
              <SimpleChart data={userGrowthData} color="#50cd89" />
              <div className="d-flex justify-content-between mt-3">
                {['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'].map((day, index) => (
                  <span key={index} className="text-muted" style={{ fontSize: '11px' }}>{day}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activities */}
        <div className="col-12 col-lg-8 mb-3">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <div>
                <h5 className="card-title mb-0">Son Aktiviteler</h5>
                <p className="card-subtitle">Sistemdeki son işlemler</p>
              </div>
              <button className="btn btn-light btn-sm">Tümünü Gör</button>
            </div>
            <div className="card-body">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="d-flex align-items-start gap-3 mb-3">
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: getActivityColor(activity.type),
                    marginTop: '6px',
                    flexShrink: 0,
                  }}></div>
                  <div className="flex-1">
                    <div className="d-flex align-items-center gap-2 mb-1">
                      <span className="fw-medium" style={{ fontSize: '13px' }}>{activity.user}</span>
                      <span className="badge badge-secondary">{activity.action}</span>
                    </div>
                    <span className="text-muted" style={{ fontSize: '12px' }}>{activity.time}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top Tenants Table */}
      <div className="card">
        <div className="card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="card-title mb-0">En İyi Müşteriler</h5>
            <p className="card-subtitle">Gelire göre en iyi 5 müşteri</p>
          </div>
          <button className="btn btn-light btn-sm">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 4H14M5 4V2M11 4V2M5 8H11M5 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span className="ms-2">Filtrele</span>
          </button>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Şirket</th>
                  <th>Kullanıcılar</th>
                  <th>Plan</th>
                  <th className="text-end">Aylık Gelir</th>
                  <th className="text-end">Büyüme</th>
                </tr>
              </thead>
              <tbody>
                {topTenants.map((tenant, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar" style={{ backgroundColor: '#667eea' }}>
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-medium">{tenant.name}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>{tenant.users} kullanıcı</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                          <circle cx="8" cy="5" r="2" stroke="#a1a5b7" strokeWidth="1.5"/>
                          <path d="M3 14V12C3 10.3431 4.34315 9 6 9H10C11.6569 9 13 10.3431 13 12V14" stroke="#a1a5b7" strokeWidth="1.5" strokeLinecap="round"/>
                        </svg>
                        <span>{tenant.users}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${
                        tenant.plan === 'Enterprise' ? 'badge-primary' :
                        tenant.plan === 'Premium' ? 'badge-info' :
                        'badge-secondary'
                      }`}>
                        {tenant.plan}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="fw-semibold">{tenant.revenue}</div>
                      <div className="text-muted" style={{ fontSize: '11px' }}>MRR</div>
                    </td>
                    <td className="text-end">
                      <span style={{
                        color: tenant.growth.startsWith('+') ? '#50cd89' : '#f1416c',
                        fontWeight: 500,
                      }}>
                        {tenant.growth}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Server Status Row */}
      <div className="row mt-4">
        <div className="col-12 col-md-4 mb-3">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Sunucu Durumu</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ fontSize: '13px' }}>CPU Kullanımı</span>
                  <span className="fw-medium" style={{ fontSize: '13px' }}>45%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div className="mb-3">
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ fontSize: '13px' }}>RAM Kullanımı</span>
                  <span className="fw-medium" style={{ fontSize: '13px' }}>67%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: '67%', backgroundColor: '#ffc700' }}></div>
                </div>
              </div>
              <div>
                <div className="d-flex justify-content-between mb-2">
                  <span style={{ fontSize: '13px' }}>Disk Kullanımı</span>
                  <span className="fw-medium" style={{ fontSize: '13px' }}>82%</span>
                </div>
                <div className="progress">
                  <div className="progress-bar" style={{ width: '82%', backgroundColor: '#f1416c' }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-3">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">API Durumu</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontSize: '13px' }}>Durum</span>
                <span className="badge badge-success">Çalışıyor</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontSize: '13px' }}>Uptime</span>
                <span className="fw-medium" style={{ fontSize: '13px' }}>99.98%</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontSize: '13px' }}>Ortalama Yanıt</span>
                <span className="fw-medium" style={{ fontSize: '13px' }}>124ms</span>
              </div>
              <div className="d-flex justify-content-between align-items-center">
                <span style={{ fontSize: '13px' }}>İstek/Dakika</span>
                <span className="fw-medium" style={{ fontSize: '13px' }}>3,847</span>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-4 mb-3">
          <div className="card">
            <div className="card-header">
              <h6 className="card-title mb-0">Güvenlik Özeti</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontSize: '13px' }}>Başarısız Girişler</span>
                <span className="badge badge-danger">12</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontSize: '13px' }}>Engellenen IP</span>
                <span className="fw-medium" style={{ fontSize: '13px' }}>3</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <span style={{ fontSize: '13px' }}>Son Tarama</span>
                <span className="text-muted" style={{ fontSize: '12px' }}>2 saat önce</span>
              </div>
              <button className="btn btn-light btn-sm w-100 mt-2">Güvenlik Raporu</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomDashboard;