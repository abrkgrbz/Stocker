import React, { useState } from 'react';
import './notification-settings.css';
import './notification-settings-enhanced.css';

interface NotificationPreferences {
  email: {
    enabled: boolean;
    frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
    categories: {
      system: boolean;
      tenant: boolean;
      payment: boolean;
      security: boolean;
      performance: boolean;
    };
  };
  push: {
    enabled: boolean;
    categories: {
      system: boolean;
      tenant: boolean;
      payment: boolean;
      security: boolean;
      performance: boolean;
    };
  };
  sms: {
    enabled: boolean;
    phoneNumber: string;
    criticalOnly: boolean;
  };
  slack: {
    enabled: boolean;
    webhookUrl: string;
    channel: string;
  };
  webhook: {
    enabled: boolean;
    url: string;
    secret: string;
  };
}

const NotificationSettings: React.FC = () => {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      enabled: true,
      frequency: 'instant',
      categories: {
        system: true,
        tenant: true,
        payment: true,
        security: true,
        performance: true
      }
    },
    push: {
      enabled: true,
      categories: {
        system: true,
        tenant: true,
        payment: false,
        security: true,
        performance: true
      }
    },
    sms: {
      enabled: false,
      phoneNumber: '',
      criticalOnly: true
    },
    slack: {
      enabled: false,
      webhookUrl: '',
      channel: '#notifications'
    },
    webhook: {
      enabled: false,
      url: '',
      secret: ''
    }
  });

  const [testMode, setTestMode] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');

  const handleSave = () => {
    setSaveStatus('saving');
    // Simüle edilmiş kaydetme
    setTimeout(() => {
      localStorage.setItem('notification_preferences', JSON.stringify(preferences));
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }, 1000);
  };

  const sendTestNotification = (channel: string) => {
    setTestMode(channel);
    // Test bildirimi gönder
    setTimeout(() => {
      alert(`Test bildirimi ${channel} kanalına gönderildi!`);
      setTestMode(null);
    }, 1500);
  };

  return (
    <div className="notification-settings">
      <div className="settings-header">
        <h1>🔔 Bildirim Ayarları</h1>
        <p>Bildirim tercihlerinizi ve kanallarınızı yönetin</p>
      </div>

      <div className="settings-content">
        {/* Email Bildirimleri */}
        <div className="settings-section">
          <div className="section-header">
            <h2>📧 Email Bildirimleri</h2>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.email.enabled}
                onChange={(e) => setPreferences({
                  ...preferences,
                  email: { ...preferences.email, enabled: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {preferences.email.enabled && (
            <div className="section-content">
              <div className="form-group">
                <label>Bildirim Sıklığı</label>
                <select
                  value={preferences.email.frequency}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    email: { ...preferences.email, frequency: e.target.value as any }
                  })}
                >
                  <option value="instant">Anında</option>
                  <option value="hourly">Saatlik Özet</option>
                  <option value="daily">Günlük Özet</option>
                  <option value="weekly">Haftalık Özet</option>
                </select>
              </div>
              
              <div className="category-toggles">
                <h3>Bildirim Kategorileri</h3>
                {Object.entries(preferences.email.categories).map(([key, value]) => (
                  <label key={key} className="category-toggle">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        email: {
                          ...preferences.email,
                          categories: {
                            ...preferences.email.categories,
                            [key]: e.target.checked
                          }
                        }
                      })}
                    />
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </label>
                ))}
              </div>
              
              <button 
                className="test-btn"
                onClick={() => sendTestNotification('email')}
                disabled={testMode === 'email'}
              >
                {testMode === 'email' ? 'Gönderiliyor...' : 'Test Email Gönder'}
              </button>
            </div>
          )}
        </div>

        {/* Push Bildirimleri */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🔔 Push Bildirimleri</h2>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.push.enabled}
                onChange={(e) => setPreferences({
                  ...preferences,
                  push: { ...preferences.push, enabled: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {preferences.push.enabled && (
            <div className="section-content">
              <div className="category-toggles">
                <h3>Bildirim Kategorileri</h3>
                {Object.entries(preferences.push.categories).map(([key, value]) => (
                  <label key={key} className="category-toggle">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setPreferences({
                        ...preferences,
                        push: {
                          ...preferences.push,
                          categories: {
                            ...preferences.push.categories,
                            [key]: e.target.checked
                          }
                        }
                      })}
                    />
                    <span>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  </label>
                ))}
              </div>
              
              <button 
                className="test-btn"
                onClick={() => sendTestNotification('push')}
                disabled={testMode === 'push'}
              >
                {testMode === 'push' ? 'Gönderiliyor...' : 'Test Push Gönder'}
              </button>
            </div>
          )}
        </div>

        {/* SMS Bildirimleri */}
        <div className="settings-section">
          <div className="section-header">
            <h2>📱 SMS Bildirimleri</h2>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.sms.enabled}
                onChange={(e) => setPreferences({
                  ...preferences,
                  sms: { ...preferences.sms, enabled: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {preferences.sms.enabled && (
            <div className="section-content">
              <div className="form-group">
                <label>Telefon Numarası</label>
                <input
                  type="tel"
                  placeholder="+90 5XX XXX XX XX"
                  value={preferences.sms.phoneNumber}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    sms: { ...preferences.sms, phoneNumber: e.target.value }
                  })}
                />
              </div>
              
              <label className="category-toggle">
                <input
                  type="checkbox"
                  checked={preferences.sms.criticalOnly}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    sms: { ...preferences.sms, criticalOnly: e.target.checked }
                  })}
                />
                <span>Sadece kritik bildirimler</span>
              </label>
              
              <button 
                className="test-btn"
                onClick={() => sendTestNotification('sms')}
                disabled={testMode === 'sms' || !preferences.sms.phoneNumber}
              >
                {testMode === 'sms' ? 'Gönderiliyor...' : 'Test SMS Gönder'}
              </button>
            </div>
          )}
        </div>

        {/* Slack Entegrasyonu */}
        <div className="settings-section">
          <div className="section-header">
            <h2>💬 Slack Entegrasyonu</h2>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.slack.enabled}
                onChange={(e) => setPreferences({
                  ...preferences,
                  slack: { ...preferences.slack, enabled: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {preferences.slack.enabled && (
            <div className="section-content">
              <div className="form-group">
                <label>Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://hooks.slack.com/services/..."
                  value={preferences.slack.webhookUrl}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    slack: { ...preferences.slack, webhookUrl: e.target.value }
                  })}
                />
              </div>
              
              <div className="form-group">
                <label>Kanal</label>
                <input
                  type="text"
                  placeholder="#notifications"
                  value={preferences.slack.channel}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    slack: { ...preferences.slack, channel: e.target.value }
                  })}
                />
              </div>
              
              <button 
                className="test-btn"
                onClick={() => sendTestNotification('slack')}
                disabled={testMode === 'slack' || !preferences.slack.webhookUrl}
              >
                {testMode === 'slack' ? 'Gönderiliyor...' : 'Test Mesajı Gönder'}
              </button>
            </div>
          )}
        </div>

        {/* Webhook */}
        <div className="settings-section">
          <div className="section-header">
            <h2>🔗 Webhook</h2>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={preferences.webhook.enabled}
                onChange={(e) => setPreferences({
                  ...preferences,
                  webhook: { ...preferences.webhook, enabled: e.target.checked }
                })}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
          
          {preferences.webhook.enabled && (
            <div className="section-content">
              <div className="form-group">
                <label>Webhook URL</label>
                <input
                  type="url"
                  placeholder="https://your-api.com/webhook"
                  value={preferences.webhook.url}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    webhook: { ...preferences.webhook, url: e.target.value }
                  })}
                />
              </div>
              
              <div className="form-group">
                <label>Secret Key</label>
                <input
                  type="password"
                  placeholder="Webhook secret key"
                  value={preferences.webhook.secret}
                  onChange={(e) => setPreferences({
                    ...preferences,
                    webhook: { ...preferences.webhook, secret: e.target.value }
                  })}
                />
              </div>
              
              <button 
                className="test-btn"
                onClick={() => sendTestNotification('webhook')}
                disabled={testMode === 'webhook' || !preferences.webhook.url}
              >
                {testMode === 'webhook' ? 'Gönderiliyor...' : 'Test Webhook Gönder'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="settings-footer">
        <button 
          className={`save-btn ${saveStatus}`}
          onClick={handleSave}
          disabled={saveStatus === 'saving'}
        >
          {saveStatus === 'saving' && '⏳ Kaydediliyor...'}
          {saveStatus === 'saved' && '✅ Kaydedildi!'}
          {saveStatus === 'idle' && '💾 Ayarları Kaydet'}
        </button>
      </div>
    </div>
  );
};

export default NotificationSettings;