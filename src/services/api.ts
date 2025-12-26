import { supabase } from './supabaseClient';
import { Property, Booking } from '../types';

export const api = {
  properties: {
    // Fetch all properties from the DB
    getAll: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*');

      if (error) {
        console.error('Error fetching properties:', error);
        return [];
      }
      return data as Property[];
    },

    // Fetch a single property by ID
    getById: async (id: string): Promise<Property | undefined> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) return undefined;
      return data as Property;
    },

    // Filter properties by 'vibe' (server-side filtering)
    getRecommended: async (vibe?: string): Promise<Property[]> => {
      let query = supabase.from('properties').select('*');
      
      if (vibe) {
        query = query.eq('vibe', vibe);
      }
      
      const { data, error } = await query;
      if (error) return [];
      return data as Property[];
    }
  },

  bookings: {
    // Fetch bookings for the logged-in user
    getMyBookings: async (): Promise<Booking[]> => {
      const { data, error } = await supabase
        .from('bookings')
        .select('*, properties(*)') // Join with properties to get details
        .order('start_date', { ascending: true });

      if (error) throw error;
      return data as any;
    },

    // Create a new booking (Used for UPI/Manual flow)
    create: async (bookingData: Partial<Booking>): Promise<{ success: boolean; id: string }> => {
      // 1. Get current user
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Must be logged in to book.");

      // 2. Insert booking row
      const { data, error } = await supabase
        .from('bookings')
        .insert({
          property_id: bookingData.propertyId,
          user_id: user.id,
          start_date: bookingData.date,
          // Default to 1 day later if end_date is missing
          end_date: bookingData.endDate || bookingData.date, 
          guests: bookingData.guests,
          total_price: bookingData.totalPrice,
          status: 'UPCOMING' // Default status for manual/UPI bookings
        })
        .select()
        .single();

      if (error) throw error;
      return { success: true, id: data.id };
    }
  },

  user: {
    updateProfile: async (id: string, updates: any) => {
      const { error } = await supabase
        .from('profiles')
        .upsert({ id, ...updates });
      
      if (error) throw error;
      return { success: true };
    }
  }
};