import { Booking, Property } from '../types';
import { MOCK_BOOKINGS, MOCK_PROPERTIES } from '../constants';

// Simulator for network latency (Liquid feel: fast but with slight weight)
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// --- API CLIENT ---
// This prepares the app for Module 2: Backend Architecture.
// Currently it simulates the backend, but later we replace implementation 
// to use fetch('/api/...')
export const api = {
  
  properties: {
    getAll: async (): Promise<Property[]> => {
      await delay(800);
      return MOCK_PROPERTIES;
    },
    getById: async (id: string): Promise<Property | undefined> => {
      await delay(600);
      return MOCK_PROPERTIES.find(p => p.id === id);
    },
    getRecommended: async (vibe?: string): Promise<Property[]> => {
      await delay(1000); // AI simulation delay
      if (!vibe) return MOCK_PROPERTIES;
      return MOCK_PROPERTIES.filter(p => p.vibe === vibe);
    }
  },

  bookings: {
    getMyBookings: async (userId: string): Promise<Booking[]> => {
      await delay(1200); // Simulate database query
      // For MVP, we return all mock bookings. 
      // In real backend, filter by userId
      return MOCK_BOOKINGS;
    },
    create: async (bookingData: Partial<Booking>): Promise<{ success: boolean; id: string }> => {
      await delay(2000); // Simulate payment processing & allocation
      const newId = `B-${Math.floor(Math.random() * 10000)}`;
      
      // In a real app, we would push to the array or DB here
      // MOCK_BOOKINGS.push({ ...bookingData, id: newId } as Booking);
      
      return { success: true, id: newId };
    }
  },

  user: {
    updateProfile: async (userId: string, data: any) => {
      await delay(1500);
      return { success: true };
    }
  }
};