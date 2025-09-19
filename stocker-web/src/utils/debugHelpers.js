// Debug helper functions for development
// This file can be used in browser console for testing

// Force company setup complete
window.forceCompanySetupComplete = () => {
  localStorage.setItem('company_setup_complete', 'true');
  window.location.reload();
};

// Clear company setup
window.clearCompanySetup = () => {
  localStorage.removeItem('company_setup_complete');
  window.location.reload();
};

// Check auth status - Enhanced version
window.checkAuthStatus = () => {
  const token = localStorage.getItem('stocker_token');
  const refreshToken = localStorage.getItem('stocker_refresh_token');
  const companySetup = localStorage.getItem('company_setup_complete');
  const tenant = localStorage.getItem('stocker_tenant');
  const tenantCode = localStorage.getItem('X-Tenant-Code');
  const currentTenant = localStorage.getItem('current_tenant');
  
  // Check all possible token keys
  const allKeys = Object.keys(localStorage);
  const tokenKeys = allKeys.filter(key => 
    key.toLowerCase().includes('token') || 
    key.toLowerCase().includes('auth') ||
    key.toLowerCase().includes('jwt')
  );
  
  console.log('=== Auth Status ===');
  console.log('Token:', token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
  console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
  console.log('Company Setup:', companySetup === 'true' ? 'Complete' : 'Not Complete');
  console.log('Tenant ID:', tenant || 'Missing');
  console.log('Tenant Code:', tenantCode || 'Missing');
  console.log('Current Tenant:', currentTenant || 'Missing');
  console.log('Current URL:', window.location.href);
  console.log('Current Path:', window.location.pathname);
  console.log('---');
  console.log('All localStorage keys:', allKeys);
  console.log('Token-related keys found:', tokenKeys);
  
  if (tokenKeys.length > 0) {
    console.log('Token values:');
    tokenKeys.forEach(key => {
      const value = localStorage.getItem(key);
      console.log(`  ${key}: ${value ? value.substring(0, 30) + '...' : 'null'}`);
    });
  }
  
  return {
    token,
    refreshToken,
    companySetup,
    tenant,
    tenantCode,
    currentTenant,
    allKeys,
    tokenKeys
  };
};

// Force login (for testing)
window.forceLogin = () => {
  // Set a dummy token
  localStorage.setItem('stocker_token', 'dummy-token-for-testing');
  localStorage.setItem('stocker_refresh_token', 'dummy-refresh-token');
  window.location.reload();
};

// Clear all auth
window.clearAuth = () => {
  localStorage.removeItem('stocker_token');
  localStorage.removeItem('stocker_refresh_token');
  localStorage.removeItem('company_setup_complete');
  localStorage.removeItem('stocker_tenant');
  localStorage.removeItem('X-Tenant-Code');
  localStorage.removeItem('current_tenant');
  window.location.reload();
};

// Stop redirect loop for debugging
window.stopLoop = () => {
  console.log('Stopping redirect loop for debugging...');
  // Override location methods
  const originalHref = Object.getOwnPropertyDescriptor(window.location, 'href');
  const originalAssign = window.location.assign;
  const originalReplace = window.location.replace;
  
  Object.defineProperty(window.location, 'href', {
    set: function(val) {
      console.log('🔴 Blocked redirect via href to:', val);
      console.trace(); // Show call stack
      return false;
    },
    get: function() {
      return originalHref.get.call(this);
    }
  });
  
  window.location.assign = function(url) {
    console.log('🔴 Blocked redirect via assign to:', url);
    console.trace();
    return false;
  };
  
  window.location.replace = function(url) {
    console.log('🔴 Blocked redirect via replace to:', url);
    console.trace();
    return false;
  };
  
  console.log('✅ Redirect blocking enabled. Check console for blocked redirects.');
};

// Test company creation API
window.testCompanyCreate = async () => {
  const token = localStorage.getItem('stocker_token');
  const tenantId = localStorage.getItem('stocker_tenant');
  const tenantCode = localStorage.getItem('X-Tenant-Code');
  
  console.log('Testing company creation with:', {
    token: token ? 'Present' : 'Missing',
    tenantId,
    tenantCode
  });
  
  try {
    const response = await fetch('https://api.stoocker.app/api/tenant/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Tenant-Id': tenantId || '',
        'X-Tenant-Code': tenantCode || ''
      },
      body: JSON.stringify({
        name: 'Test Company',
        code: `test_${Date.now()}`,
        legalName: 'Test Company Ltd.',
        identityType: 'TaxNumber',
        identityNumber: '12345678901',
        taxNumber: '12345678901',
        taxOffice: 'Test V.D.',
        email: 'test@test.com',
        phone: '0212 123 45 67',
        currency: 'TRY',
        timezone: 'Europe/Istanbul',
        country: 'Türkiye',
        city: 'İstanbul',
        district: 'Kadıköy',
        addressLine: 'Test Address'
      })
    });
    
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', data);
    
    if (!response.ok) {
      console.error('❌ API Error:', data);
    } else {
      console.log('✅ Success:', data);
    }
    
    return data;
  } catch (error) {
    console.error('❌ Network Error:', error);
    return error;
  }
};

console.log('🔧 Debug helpers loaded. Available commands:');
console.log('- window.checkAuthStatus() - Show all auth related data');
console.log('- window.forceCompanySetupComplete() - Mark company as setup');
console.log('- window.clearCompanySetup() - Clear company setup flag');
console.log('- window.forceLogin() - Set dummy auth tokens');
console.log('- window.clearAuth() - Clear all auth data');
console.log('- window.stopLoop() - Block all redirects to debug loop');
console.log('- window.testCompanyCreate() - Test company creation API');