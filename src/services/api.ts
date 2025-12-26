import { supabase } from './supabaseClient';
import { Property, Booking } from '../types';

export const api = {
  properties: {
    getAll: async (): Promise<Property[]> => {
      try {
        const { data, error } = await supabase.from('properties').select('*');
        if (error) {
          console.error('Error fetching properties:', error);
          return [];
        }
        return data as Property[];
      } catch (err) {
        console.error('properties.getAll error', err);
        return [];
      }
    },

    getById: async (id: string): Promise<Property | undefined> => {
      try {
        const { data, error } = await supabase.from('properties').select('*').eq('id', id).single();
        if (error) {
          console.error('properties.getById error', error);
          return undefined;
        }
        return data as Property;
      } catch (err) {
        console.error('properties.getById error', err);
        return undefined;
      }
    },

    getRecommended: async (vibe?: string): Promise<Property[]> => {
      try {
        let query: any = supabase.from('properties').select('*');
        if (vibe) query = query.eq('vibe', vibe);
        const { data, error } = await query;
        if (error) {
          console.error('properties.getRecommended error', error);
          return [];
        }
        return data as Property[] || [];
      } catch (err) {
        console.error('properties.getRecommended error', err);
        return [];
      }
    }
  },

  bookings: {
    getMyBookings: async (): Promise<Booking[]> => {
      try {
        const { data, error } = await supabase.from('bookings').select('*, properties(*)').order('start_date', { ascending: true });
        if (error) {
          console.error('bookings.getMyBookings error', error);
          return [];
        }
        return data as any;
      } catch (err) {
        console.error('bookings.getMyBookings error', err);
        return [];
      }
    },

    create: async (bookingData: Partial<Booking>): Promise<{ success: boolean; id: string }> => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Must be logged in.');

        const { data, error } = await supabase.from('bookings').insert({
          property_id: (bookingData as any).propertyId,
          user_id: user.id,
          start_date: (bookingData as any).date,
          end_date: (bookingData as any).endDate || (bookingData as any).date,
          guests: (bookingData as any).guests,
          total_price: (bookingData as any).totalPrice,
          status: 'UPCOMING'
        }).select().single();

        if (error) throw error;
        return { success: true, id: (data as any).id };
      } catch (err) {
        console.error('bookings.create error', err);
        throw err;
      }
    }
  },

  user: {
    updateProfile: async (id: string, updates: any) => {
      try {
        const { error } = await supabase.from('profiles').upsert({ id, ...updates });
        if (error) throw error;
        return { success: true };
      } catch (err) {
        console.error('user.updateProfile error', err);
        throw err;
      }
    }
  }
};