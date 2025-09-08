import React, { useState } from 'react';
import '../../styles/index.css';

const CustomTenants: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const mockTenants = [
    {
      id: '1',
      name: 'Acme Corporation',
      domain: 'acme.stoocker.app',
      email: 'admin@acme.com',
      status: 'active',
      plan: 'enterprise',
      users: 245,
      storage: 85,
      createdAt: '2024-01-15',
      revenue: '₺45,000',
    },
    {
      id: '2',
      name: 'TechStart Inc',
      domain: 'techstart.stoocker.app',
      email: 'info@techstart.com',
      status: 'active',
      plan: 'premium',
      users: 189,
      storage: 45,
      createdAt: '2024-02-20',
      revenue: '₺32,000',
    },
    {
      id: '3',
      name: 'Global Systems',
      domain: 'global.stoocker.app',
      email: 'contact@global.com',
      status: 'active',
      plan: 'premium',
      users: 156,
      storage: 38,
      createdAt: '2024-03-10',
      revenue: '₺28,500',
    },
    {
      id: '4',
      name: 'Innovation Labs',
      domain: 'labs.stoocker.app',
      email: 'hello@labs.com',
      status: 'suspended',
      plan: 'business',
      users: 134,
      storage: 22,
      createdAt: '2024-01-28',
      revenue: '₺24,000',
    },
    {
      id: '5',
      name: 'Digital Solutions',
      domain: 'digital.stoocker.app',
      email: 'support@digital.com',
      status: 'active',
      plan: 'business',
      users: 98,
      storage: 18,
      createdAt: '2024-04-05',
      revenue: '₺18,000',
    },
    {
      id: '6',
      name: 'StartUp Hub',
      domain: 'startup.stoocker.app',
      email: 'info@startup.com',
      status: 'trial',
      plan: 'starter',
      users: 12,
      storage: 2,
      createdAt: '2024-11-01',
      revenue: '₺0',
    }
  ];

  const filteredTenants = mockTenants.filter(tenant => {
    const matchesSearch = tenant.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          tenant.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || tenant.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSelectAll = () => {
    if (selectedTenants.length === filteredTenants.length) {
      setSelectedTenants([]);
    } else {
      setSelectedTenants(filteredTenants.map(t => t.id));
    }
  };

  const handleSelectTenant = (id: string) => {
    if (selectedTenants.includes(id)) {
      setSelectedTenants(selectedTenants.filter(tid => tid !== id));
    } else {
      setSelectedTenants([...selectedTenants, id]);
    }
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      active: 'badge-success',
      suspended: 'badge-danger',
      trial: 'badge-warning',
    };
    const labels: Record<string, string> = {
      active: 'Aktif',
      suspended: 'Askıda',
      trial: 'Deneme',
    };
    return (
      <span className={`badge ${colors[status] || 'badge-secondary'}`}>
        {labels[status] || status}
      </span>
    );
  };

  const getPlanBadge = (plan: string) => {
    const colors: Record<string, string> = {
      enterprise: 'badge-primary',
      premium: 'badge-info',
      business: 'badge-success',
      starter: 'badge-secondary',
    };
    return (
      <span className={`badge ${colors[plan] || 'badge-secondary'}`}>
        {plan.charAt(0).toUpperCase() + plan.slice(1)}
      </span>
    );
  };

  return (
    <div className="tenants-container">
      {/* Page Header */}
      <div className="page-header mb-4">
        <div className="d-flex justify-content-between align-items-center">
          <div>
            <h1 className="page-title">Tenants</h1>
            <p className="page-description">Tüm müşteri hesaplarını yönetin</p>
          </div>
          <div className="d-flex gap-2">
            <button className="btn btn-light btn-sm">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 8H14M8 2V14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              <span className="ms-2">Dışa Aktar</span>
            </button>
            <button className="btn btn-primary btn-sm" onClick={() => setIsCreateModalOpen(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M8 3V13M3 8H13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              </svg>
              <span className="ms-2">Yeni Tenant</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="row mb-4">
        <div className="col-12 col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Toplam Tenant</p>
                  <h4 className="fw-bold mb-0">487</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                    <span style={{ color: '#50cd89' }}>+12%</span> geçen ay
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#e1f0ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M5 9L12 5L19 9V19H5V9Z" stroke="#009ef7" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Aktif Tenant</p>
                  <h4 className="fw-bold mb-0">423</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>%86.8 aktif oran</p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#e8f5ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="8" stroke="#50cd89" strokeWidth="2"/>
                    <path d="M9 12L11 14L15 10" stroke="#50cd89" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Toplam Kullanıcı</p>
                  <h4 className="fw-bold mb-0">12,487</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Tüm tenantlarda</p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#f1e8ff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="9" r="3" stroke="#7239ea" strokeWidth="2"/>
                    <path d="M5 20V18C5 16.3431 6.34315 15 8 15H16C17.6569 15 19 16.3431 19 18V20" stroke="#7239ea" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12 col-md-3 mb-3">
          <div className="card">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <p className="text-muted mb-2" style={{ fontSize: '13px' }}>Aylık Gelir</p>
                  <h4 className="fw-bold mb-0">₺487K</h4>
                  <p className="text-muted mb-0" style={{ fontSize: '12px' }}>
                    <span style={{ color: '#50cd89' }}>+24%</span> büyüme
                  </p>
                </div>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '8px',
                  backgroundColor: '#fff8dd',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M7 10L12 5L17 10M12 5V19" stroke="#ffc700" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row align-items-center">
            <div className="col-12 col-md-6 mb-3 mb-md-0">
              <div style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#a1a5b7',
                }}>
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Tenant ara..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>
            </div>
            <div className="col-12 col-md-6">
              <div className="d-flex gap-2 justify-content-md-end">
                <select
                  className="form-select"
                  style={{ width: 'auto' }}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="suspended">Askıda</option>
                  <option value="trial">Deneme</option>
                </select>
                <button className="btn btn-light">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M2 4H14M5 4V2M11 4V2M5 8H11M5 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tenants Table */}
      <div className="card">
        <div className="card-header">
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0">Tenant Listesi</h5>
            {selectedTenants.length > 0 && (
              <div className="d-flex gap-2">
                <button className="btn btn-light btn-sm">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M8 5V8L10 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="ms-2">Toplu İşlem</span>
                </button>
                <button className="btn btn-danger btn-sm">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M5 3V2H11V3M3 3H13M4 6V13H12V6M7 8V11M9 8V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="ms-2">Sil ({selectedTenants.length})</span>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{ width: '40px' }}>
                    <input
                      type="checkbox"
                      className="form-check-input"
                      checked={selectedTenants.length === filteredTenants.length && filteredTenants.length > 0}
                      onChange={handleSelectAll}
                    />
                  </th>
                  <th>Tenant</th>
                  <th>Durum</th>
                  <th>Plan</th>
                  <th>Kullanıcılar</th>
                  <th>Depolama</th>
                  <th>Gelir</th>
                  <th>Oluşturulma</th>
                  <th className="text-center">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {filteredTenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td>
                      <input
                        type="checkbox"
                        className="form-check-input"
                        checked={selectedTenants.includes(tenant.id)}
                        onChange={() => handleSelectTenant(tenant.id)}
                      />
                    </td>
                    <td>
                      <div className="d-flex align-items-center gap-3">
                        <div className="avatar" style={{ backgroundColor: '#667eea' }}>
                          {tenant.name.charAt(0)}
                        </div>
                        <div>
                          <div className="fw-medium">{tenant.name}</div>
                          <div className="text-muted" style={{ fontSize: '12px' }}>{tenant.domain}</div>
                        </div>
                      </div>
                    </td>
                    <td>{getStatusBadge(tenant.status)}</td>
                    <td>{getPlanBadge(tenant.plan)}</td>
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
                      <div>
                        <div className="mb-1">{tenant.storage}GB / 100GB</div>
                        <div className="progress" style={{ height: '4px' }}>
                          <div className="progress-bar" style={{ width: `${tenant.storage}%` }}></div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>
                        <div className="fw-semibold">{tenant.revenue}</div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>Aylık</div>
                      </div>
                    </td>
                    <td>
                      <span className="text-muted" style={{ fontSize: '13px' }}>{tenant.createdAt}</span>
                    </td>
                    <td className="text-center">
                      <div className="dropdown">
                        <button className="btn btn-light btn-sm btn-icon">
                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <circle cx="8" cy="3" r="1.5" fill="currentColor"/>
                            <circle cx="8" cy="8" r="1.5" fill="currentColor"/>
                            <circle cx="8" cy="13" r="1.5" fill="currentColor"/>
                          </svg>
                        </button>
                        <div className="dropdown-menu">
                          <button className="dropdown-item">Görüntüle</button>
                          <button className="dropdown-item">Düzenle</button>
                          <button className="dropdown-item">Kullanıcı Ekle</button>
                          <button className="dropdown-item">Faturalandırma</button>
                          <div className="dropdown-divider"></div>
                          <button className="dropdown-item text-danger">Sil</button>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-4">
            <p className="text-muted mb-0" style={{ fontSize: '13px' }}>
              Toplam {filteredTenants.length} kayıttan 1-{Math.min(25, filteredTenants.length)} arası gösteriliyor
            </p>
            <div className="pagination">
              <button className="page-link">Önceki</button>
              <button className="page-link active">1</button>
              <button className="page-link">2</button>
              <button className="page-link">3</button>
              <button className="page-link">Sonraki</button>
            </div>
          </div>
        </div>
      </div>

      {/* Create Modal */}
      {isCreateModalOpen && (
        <>
          <div className="modal show d-block">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Yeni Tenant Oluştur</h5>
                  <button className="btn btn-icon btn-sm btn-light" onClick={() => setIsCreateModalOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M4 4L12 12M4 12L12 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </button>
                </div>
                <div className="modal-body">
                  <div className="form-group">
                    <label className="form-label required">Şirket Adı</label>
                    <input type="text" className="form-control" placeholder="Acme Corporation" />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Domain</label>
                    <input type="text" className="form-control" placeholder="acme" />
                    <p className="form-text">.stoocker.app uzantısı otomatik eklenecek</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label required">E-posta</label>
                    <input type="email" className="form-control" placeholder="admin@acme.com" />
                  </div>
                  <div className="form-group">
                    <label className="form-label required">Plan</label>
                    <select className="form-select">
                      <option value="starter">Starter</option>
                      <option value="business">Business</option>
                      <option value="premium">Premium</option>
                      <option value="enterprise">Enterprise</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="btn btn-light" onClick={() => setIsCreateModalOpen(false)}>İptal</button>
                  <button className="btn btn-primary">Oluştur</button>
                </div>
              </div>
            </div>
          </div>
          <div className="modal-backdrop" onClick={() => setIsCreateModalOpen(false)}></div>
        </>
      )}
    </div>
  );
};

export default CustomTenants;