import React from 'react';
import { CheckCircleOutlined, RocketOutlined, CrownOutlined, ThunderboltOutlined } from '@ant-design/icons';
import './premium-package-selection.css';

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  maxUsers: number;
  maxStorage: number;
  modules: string[];
  isPopular?: boolean;
  discount?: number;
}

interface PremiumPackageCardProps {
  package: Package;
  isSelected: boolean;
  onSelect: (pkg: Package) => void;
  billingPeriod: 'Monthly' | 'Yearly';
}

const packageIcons: { [key: string]: React.ReactNode } = {
  'Başlangıç': '🚀',
  'Profesyonel': '💎',
  'Enterprise': '👑'
};

const packageThemes: { [key: string]: string } = {
  'Başlangıç': 'starter',
  'Profesyonel': 'professional',
  'Enterprise': 'enterprise'
};

const featureIcons: { [key: string]: string } = {
  'Kullanıcı': '👤',
  'Depolama': '💾',
  'CRM': '📊',
  'Stok': '📦',
  'Muhasebe': '💰',
  'İK': '👥',
  'Proje': '📋',
  'Destek': '🎧',
  'API': '🔌',
  'Eğitim': '🎓',
  'Raporlama': '📈',
  'Entegrasyon': '🔗',
  'Mobil': '📱',
  'Email': '✉️',
  'SLA': '🛡️',
  'Sunucu': '🖥️'
};

export const PremiumPackageCard: React.FC<PremiumPackageCardProps> = ({
  package: pkg,
  isSelected,
  onSelect,
  billingPeriod
}) => {
  const theme = packageThemes[pkg.name] || 'starter';
  
  const calculatePrice = () => {
    let price = pkg.price;
    if (billingPeriod === 'Yearly') {
      price = Math.floor(price * 12 * 0.8 / 12); // 20% yearly discount
    }
    return price;
  };

  const getFeatureIcon = (feature: string) => {
    const foundIcon = Object.keys(featureIcons).find(key => 
      feature.toLowerCase().includes(key.toLowerCase())
    );
    return foundIcon ? featureIcons[foundIcon] : '✨';
  };

  const formatFeature = (feature: string) => {
    // Parse feature text to extract value and label
    const match = feature.match(/(\d+)\s*(.*)/);
    if (match) {
      return {
        value: match[1],
        label: match[2]
      };
    }
    return {
      value: '',
      label: feature
    };
  };

  return (
    <div className={`premium-package-card ${isSelected ? 'selected' : ''}`} onClick={() => onSelect(pkg)}>
      {pkg.isPopular && (
        <div className="package-special-badge">
          <div className="badge-popular">En Popüler</div>
        </div>
      )}
      
      <div className={`package-card-header ${theme}`}>
        <div className="package-icon-container">
          <div className="package-mega-icon">
            {packageIcons[pkg.name] || '📦'}
          </div>
        </div>
        
        <div className="package-title-group">
          <h2 className="package-main-title">{pkg.name}</h2>
          <p className="package-subtitle">{pkg.description}</p>
        </div>
        
        <div className="package-price-display">
          <div className="price-tag">
            <span className="price-currency">{pkg.currency}</span>
            <span className="price-value">{calculatePrice()}</span>
            <span className="price-period">/ay</span>
          </div>
          {billingPeriod === 'Yearly' && (
            <div className="price-discount">%20 İndirim</div>
          )}
        </div>
      </div>
      
      <div className="package-card-body">
        <ul className="premium-features-list">
          {pkg.features.map((feature, index) => {
            const { value, label } = formatFeature(feature);
            return (
              <li key={index} className="premium-feature-item">
                <div className={`feature-icon-wrapper ${theme}`}>
                  {getFeatureIcon(feature)}
                </div>
                <span className="feature-text">
                  {value && <span className="feature-value">{value} </span>}
                  {label}
                </span>
              </li>
            );
          })}
        </ul>
        
        {pkg.modules && pkg.modules.length > 0 && (
          <div className="package-modules">
            {pkg.modules.map((module, index) => (
              <span key={index} className="module-pill">
                {module}
              </span>
            ))}
          </div>
        )}
        
        <button className={`package-select-button ${theme}`}>
          {isSelected ? 'Seçildi ✓' : 'Bu Paketi Seç'}
        </button>
      </div>
    </div>
  );
};