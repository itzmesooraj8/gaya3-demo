/**
 * Worker: booking-confirmed-listener
 * Node script that subscribes to `bookings` updates and sends emails when a booking becomes 'confirmed'.
 * Run this script in a server/worker environment (PM2, Docker, or a VM).
 *
 * Environment variables required:
 * - SUPABASE_URL
 * - SUPABASE_SERVICE_ROLE_KEY
 * - SENDGRID_API_KEY
 * - FROM_EMAIL
 */

import { createClient } from '@supabase/supabase-js';
import sgMail from '@sendgrid/mail';

const SUPABASE_URL = process.env.SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY!;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@example.com';

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Missing Supabase env vars');
  process.exit(1);
}
if (!SENDGRID_API_KEY) {
  console.error('Missing SENDGRID_API_KEY');
  process.exit(1);
}

sgMail.setApiKey(SENDGRID_API_KEY);

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  realtime: { params: { events: ['postgres_changes'] } },
});

async function sendBookingConfirmationEmail(booking: any) {
  try {
    // Fetch related data: user and property
    const [{ data: user }, { data: property }] = await Promise.all([
      supabase.from('profiles').select('email,full_name').eq('id', booking.user_id).maybeSingle(),
      supabase.from('properties').select('title,location_name').eq('id', booking.property_id).maybeSingle(),
    ]);

    if (!user || !property) {
      console.warn('Missing user or property for booking:', booking.id);
      return;
    }

    const msg = {
      to: user.email,
      from: FROM_EMAIL,
      subject: `Your booking is confirmed: ${property.title}`,
      text: `Hi ${user.full_name || ''},\n\nYour booking (id: ${booking.id}) for ${property.title} (${property.location_name}) is confirmed. Check-in: ${booking.check_in_date}, Check-out: ${booking.check_out_date}.\n\nThanks,\nGaya Team`,
    };

    await sgMail.send(msg);
    console.log('Email sent for booking', booking.id);
  } catch (err) {
    console.error('Failed to send email', err);
  }
}

async function main() {
  console.log('Starting booking-confirmed listener...');

  const channel = supabase.channel('public:bookings');

  channel.on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'bookings' }, (payload) => {
    try {
      const newBooking = payload.new;
      const oldBooking = payload.old;
      if (newBooking && newBooking.status === 'confirmed' && oldBooking?.status !== 'confirmed') {
        console.log('Detected confirmed booking:', newBooking.id);
        sendBookingConfirmationEmail(newBooking);
      }
    } catch (err) {
      console.error('Error handling payload', err);
    }
  });

  await channel.subscribe();
  console.log('Subscribed to bookings updates');
}

main().catch((e) => {
  console.error('Fatal error:', e);
  process.exit(1);
});
