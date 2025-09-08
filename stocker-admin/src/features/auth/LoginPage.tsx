import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import '../../styles/index.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err) {
      setError('Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px',
    }}>
      <div className="card" style={{
        width: '100%',
        maxWidth: '420px',
        padding: '2rem',
        borderRadius: '16px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '1rem' }}>
            <rect width="64" height="64" rx="16" fill="#009ef7"/>
            <path d="M20 44V28L32 20L44 28V44H20Z" fill="white"/>
            <path d="M28 44V36H36V44" stroke="#009ef7" strokeWidth="3" strokeLinecap="round"/>
          </svg>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#181c32', marginBottom: '0.5rem' }}>
            Stocker Master Admin
          </h2>
          <p style={{ color: '#a1a5b7', fontSize: '14px' }}>
            Yönetim paneline hoş geldiniz
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: '1rem' }}>
              {error}
            </div>
          )}

          <div className="form-group">
            <label className="form-label">E-posta</label>
            <input
              type="email"
              className="form-control form-control-lg"
              placeholder="admin@stocker.app"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label className="form-label">Şifre</label>
            <input
              type="password"
              className="form-control form-control-lg"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <div className="form-check">
              <input
                type="checkbox"
                className="form-check-input"
                id="rememberMe"
              />
              <label className="form-check-label" htmlFor="rememberMe">
                Beni hatırla
              </label>
            </div>
          </div>

          <button
            type="submit"
            className="btn btn-primary btn-lg w-100"
            disabled={isLoading}
            style={{ marginTop: '1rem' }}
          >
            {isLoading ? (
              <span className="spinner spinner-sm"></span>
            ) : (
              'Giriş Yap'
            )}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
          <a href="#" style={{ fontSize: '13px', color: '#009ef7', textDecoration: 'none' }}>
            Şifremi Unuttum
          </a>
        </div>

        <div style={{ 
          textAlign: 'center', 
          marginTop: '2rem', 
          paddingTop: '1rem', 
          borderTop: '1px solid #e1e3ea',
          fontSize: '12px',
          color: '#a1a5b7'
        }}>
          &copy; 2024 Stocker. Tüm hakları saklıdır.
        </div>
      </div>

      <style jsx>{`
        .w-100 {
          width: 100%;
        }
      `}</style>
    </div>
  );
};

export default LoginPage;