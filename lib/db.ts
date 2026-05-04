// Mock Database Service for BLIZ NFC System
export type Device = {
  id: string;
  ownerId: string | null;
  status: 'active' | 'maintenance' | 'lost';
};

export type User = {
  id: string;
  email: string;
  isLoggedIn: boolean;
};

// Simulation of a persistent state
const MOCK_DEVICES: Record<string, Device> = {
  'BLIZ_001': { id: 'BLIZ_001', ownerId: null, status: 'active' },
  'BLIZ_002': { id: 'BLIZ_002', ownerId: 'user_123', status: 'active' },
};

const CURRENT_USER: User = {
  id: 'user_123',
  email: 'tester@haler.co',
  isLoggedIn: false, // Start as logged out for the walkthrough
};

// MASTER ACCOUNT CONFIG
export const MASTER_ACCOUNT = {
  id: 'kalcross',
  password: '000000',
  email: 'kalcross@haler.co'
};

export const db = {
  getDevice: async (id: string): Promise<Device | null> => {
    // Simulate API delay
    await new Promise(r => setTimeout(r, 800));
    return MOCK_DEVICES[id] || null;
  },
  
  getCurrentUser: async (): Promise<User> => {
    return CURRENT_USER;
  },
  
  registerDevice: async (deviceId: string, userId: string): Promise<boolean> => {
    console.log(`Linking ${deviceId} to ${userId}`);
    if (MOCK_DEVICES[deviceId]) {
      MOCK_DEVICES[deviceId].ownerId = userId;
      return true;
    }
    return false;
  },

  verifyCredentials: async (id: string, pass: string): Promise<boolean> => {
    // MASTER KEY CHECK
    if (id === MASTER_ACCOUNT.id && pass === MASTER_ACCOUNT.password) {
      console.log("Master login successful");
      return true;
    }
    // Simple mock check for secondary accounts
    return id === 'tester@haler.co' && pass === 'password';
  }
};
