import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
  IconButton,
  Paper,
  useTheme,
  alpha,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  ArrowForward as ArrowIcon,
} from '@mui/icons-material';
import { useAuthStore } from '../../stores/authStore';
import { useNavigate } from 'react-router-dom';

const LoginPage: React.FC = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { login } = useAuthStore();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Mock login - gerçek API entegrasyonu için değiştir
    setTimeout(() => {
      localStorage.setItem('admin_token', 'mock_token_123');
      navigate('/dashboard');
    }, 1000);
  };

  return (
    <Box
      sx={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        position: 'fixed',
        top: 0,
        left: 0,
        overflow: 'hidden',
      }}
    >
      {/* Sol Taraf - Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '45%' },
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          bgcolor: '#0a0e27',
          position: 'relative',
          zIndex: 2,
          overflowY: 'auto',
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 440 }}>
          {/* Logo */}
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 900,
                color: '#fff',
                letterSpacing: '-1px',
                mb: 1,
              }}
            >
              STOCKER
            </Typography>
            <Typography
              sx={{
                color: alpha('#fff', 0.7),
                fontSize: '1rem',
              }}
            >
              Admin Panel'e Hoş Geldiniz
            </Typography>
          </Box>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Box sx={{ mb: 3 }}>
              <Typography
                sx={{
                  color: alpha('#fff', 0.7),
                  fontSize: '0.875rem',
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                E-posta
              </Typography>
              <TextField
                fullWidth
                placeholder="admin@stocker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonIcon sx={{ color: alpha('#fff', 0.5) }} />
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: alpha('#fff', 0.05),
                    borderRadius: 2,
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#fff', 0.1),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#fff', 0.2),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography
                sx={{
                  color: alpha('#fff', 0.7),
                  fontSize: '0.875rem',
                  mb: 1,
                  fontWeight: 500,
                }}
              >
                Şifre
              </Typography>
              <TextField
                fullWidth
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockIcon sx={{ color: alpha('#fff', 0.5) }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        sx={{ color: alpha('#fff', 0.5) }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                  sx: {
                    bgcolor: alpha('#fff', 0.05),
                    borderRadius: 2,
                    color: '#fff',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#fff', 0.1),
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: alpha('#fff', 0.2),
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              fullWidth
              variant="contained"
              disabled={isLoading}
              endIcon={!isLoading && <ArrowIcon />}
              sx={{
                py: 2,
                borderRadius: 2,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '1rem',
                fontWeight: 600,
                textTransform: 'none',
                boxShadow: '0 10px 30px rgba(102, 126, 234, 0.4)',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 15px 40px rgba(102, 126, 234, 0.6)',
                },
              }}
            >
              {isLoading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
            </Button>
          </form>

          {/* Alt Linkler */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              sx={{
                color: alpha('#fff', 0.7),
                textTransform: 'none',
                '&:hover': {
                  color: '#fff',
                  bgcolor: 'transparent',
                },
              }}
            >
              Şifremi Unuttum
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Sağ Taraf - Görsel */}
      <Box
        sx={{
          width: { xs: '0', md: '55%' },
          height: '100vh',
          position: 'relative',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: { xs: 'none', md: 'flex' },
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
      >
        {/* Animated Background Pattern */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            opacity: 0.1,
            backgroundImage: `
              radial-gradient(circle at 20% 50%, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 70%),
              radial-gradient(circle at 80% 80%, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 70%),
              radial-gradient(circle at 40% 20%, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 70%)
            `,
            animation: 'float 20s ease-in-out infinite',
            '@keyframes float': {
              '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
              '50%': { transform: 'translateY(-20px) rotate(10deg)' },
            },
          }}
        />

        {/* İçerik */}
        <Box sx={{ position: 'relative', zIndex: 1, textAlign: 'center', px: 4 }}>
          <Box
            sx={{
              width: 120,
              height: 120,
              margin: '0 auto 3rem',
              borderRadius: '30px',
              background: 'rgba(255,255,255,0.2)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              transform: 'rotate(-10deg)',
              animation: 'pulse 3s ease-in-out infinite',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'rotate(-10deg) scale(1)' },
                '50%': { transform: 'rotate(-10deg) scale(1.05)' },
              },
            }}
          >
            <Typography
              sx={{
                fontSize: '3rem',
                fontWeight: 900,
                color: '#fff',
                transform: 'rotate(10deg)',
              }}
            >
              S
            </Typography>
          </Box>

          <Typography
            variant="h3"
            sx={{
              color: '#fff',
              fontWeight: 700,
              mb: 2,
              textShadow: '0 10px 30px rgba(0,0,0,0.3)',
            }}
          >
            Yönetim Paneli
          </Typography>
          
          <Typography
            sx={{
              color: alpha('#fff', 0.9),
              fontSize: '1.125rem',
              maxWidth: 400,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            Tüm işletme süreçlerinizi tek bir yerden yönetin. Güçlü araçlar ve detaylı analizlerle işinizi büyütün.
          </Typography>

          {/* Stats */}
          <Box sx={{ display: 'flex', gap: 4, justifyContent: 'center', mt: 5 }}>
            <Box>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
                500+
              </Typography>
              <Typography sx={{ color: alpha('#fff', 0.8), fontSize: '0.875rem' }}>
                Aktif Şirket
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
                10K+
              </Typography>
              <Typography sx={{ color: alpha('#fff', 0.8), fontSize: '0.875rem' }}>
                Kullanıcı
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '2rem', fontWeight: 700, color: '#fff' }}>
                99.9%
              </Typography>
              <Typography sx={{ color: alpha('#fff', 0.8), fontSize: '0.875rem' }}>
                Uptime
              </Typography>
            </Box>
          </Box>
        </Box>

        {/* Floating Elements */}
        <Box
          sx={{
            position: 'absolute',
            top: '10%',
            left: '10%',
            width: 60,
            height: 60,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            animation: 'float 6s ease-in-out infinite',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            bottom: '20%',
            right: '15%',
            width: 40,
            height: 40,
            borderRadius: '10px',
            background: 'rgba(255,255,255,0.2)',
            animation: 'float 8s ease-in-out infinite reverse',
          }}
        />
        <Box
          sx={{
            position: 'absolute',
            top: '60%',
            right: '10%',
            width: 80,
            height: 80,
            borderRadius: '20px',
            background: 'rgba(255,255,255,0.1)',
            animation: 'float 10s ease-in-out infinite',
          }}
        />
      </Box>
    </Box>
  );
};

export default LoginPage;