import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "6920df23bc3c86556eac642a", 
  requiresAuth: true // Ensure authentication is required for all operations
});
