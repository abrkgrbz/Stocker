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

// Check auth status
window.checkAuthStatus = () => {
  const token = localStorage.getItem('stocker_token');
  const refreshToken = localStorage.getItem('stocker_refresh_token');
  const companySetup = localStorage.getItem('company_setup_complete');
  const tenant = localStorage.getItem('stocker_tenant');
  const tenantCode = localStorage.getItem('X-Tenant-Code');
  const currentTenant = localStorage.getItem('current_tenant');
  
  console.log('=== Auth Status ===');
  console.log('Token:', token ? 'Present' : 'Missing');
  console.log('Refresh Token:', refreshToken ? 'Present' : 'Missing');
  console.log('Company Setup:', companySetup === 'true' ? 'Complete' : 'Not Complete');
  console.log('Tenant ID:', tenant || 'Missing');
  console.log('Tenant Code:', tenantCode || 'Missing');
  console.log('Current Tenant:', currentTenant || 'Missing');
  console.log('Current URL:', window.location.href);
  console.log('Current Path:', window.location.pathname);
  
  return {
    token,
    refreshToken,
    companySetup,
    tenant,
    tenantCode,
    currentTenant
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

console.log('🔧 Debug helpers loaded. Available commands:');
console.log('- window.checkAuthStatus() - Show all auth related data');
console.log('- window.forceCompanySetupComplete() - Mark company as setup');
console.log('- window.clearCompanySetup() - Clear company setup flag');
console.log('- window.forceLogin() - Set dummy auth tokens');
console.log('- window.clearAuth() - Clear all auth data');
console.log('- window.stopLoop() - Block all redirects to debug loop');