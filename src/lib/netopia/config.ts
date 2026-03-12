// Netopia Payments API v2 Configuration
// Sandbox vs Production endpoints

export const NETOPIA_CONFIG = {
  // Use sandbox for testing, switch to live for production
  isSandbox: process.env.NETOPIA_SANDBOX === 'true',
  
  get apiUrl() {
    return this.isSandbox 
      ? 'https://secure.sandbox.netopia-payments.com' 
      : 'https://secure.netopia-payments.com';
  },

  // API Key from Netopia Dashboard
  apiKey: process.env.NETOPIA_API_KEY || '',
  
  // POS Signature from Netopia Dashboard  
  posSignature: process.env.NETOPIA_POS_SIGNATURE || '',
  
  // Your domain URLs
  get notifyUrl() {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${base}/api/netopia/ipn`;
  },
  
  get redirectUrl() {
    const base = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    return `${base}/api/netopia/return`;
  },
};
