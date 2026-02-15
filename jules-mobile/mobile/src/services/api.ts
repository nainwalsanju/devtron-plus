import { Platform } from 'react-native';
import { CreateVMData, VM } from '../types';

// Adjust this if running on physical device (use your machine's IP)
const BACKEND_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000' : 'http://localhost:3000';

export const API_URL = BACKEND_URL;

export const loginWithGitHub = async () => {
  try {
    const response = await fetch(`${BACKEND_URL}/auth/github`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
    });
    return await response.json();
  } catch (error) {
    console.error("Login Error:", error);
    throw error;
  }
};

export const getMyProfile = async (token: string) => {
  const response = await fetch(`${BACKEND_URL}/users/me`, {
    headers: { Authorization: token }
  });
  return response.json();
};

export const getVMs = async (token: string): Promise<VM[]> => {
  const response = await fetch(`${BACKEND_URL}/vms`, {
    headers: { Authorization: token }
  });
  return response.json();
};

export const addVM = async (token: string, vmData: CreateVMData): Promise<VM> => {
  const response = await fetch(`${BACKEND_URL}/vms`, {
    method: 'POST',
    headers: {
        'Authorization': token,
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(vmData)
  });

  if (!response.ok) {
      const err = await response.json();
      throw new Error(err.error || 'Failed to add VM');
  }
  return response.json();
};

export const upgradePlan = async (token: string) => {
    const response = await fetch(`${BACKEND_URL}/users/me/upgrade`, {
        method: 'POST',
        headers: { Authorization: token }
    });
    return response.json();
};

export const downgradePlan = async (token: string) => {
    const response = await fetch(`${BACKEND_URL}/users/me/downgrade`, {
        method: 'POST',
        headers: { Authorization: token }
    });
    return response.json();
};
