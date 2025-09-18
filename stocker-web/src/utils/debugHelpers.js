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
  
  console.log('Auth Status:');
  console.log('- Token:', token ? 'Present' : 'Missing');
  console.log('- Refresh Token:', refreshToken ? 'Present' : 'Missing');
  console.log('- Company Setup:', companySetup === 'true' ? 'Complete' : 'Not Complete');
  
  return {
    token,
    refreshToken,
    companySetup
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
  window.location.reload();
};

console.log('Debug helpers loaded. Available commands:');
console.log('- window.forceCompanySetupComplete()');
console.log('- window.clearCompanySetup()');
console.log('- window.checkAuthStatus()');
console.log('- window.forceLogin()');
console.log('- window.clearAuth()');