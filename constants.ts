
import { Property, VibeType, Booking } from './types';

export const MOCK_PROPERTIES: Property[] = [
  {
    id: '1',
    title: 'Nebula Glasshouse',
    location: 'Nordland, Norway',
    price: 45000,
    rating: 4.9,
    image: 'https://picsum.photos/800/600?random=1',
    vibe: VibeType.ZEN,
    description: 'Suspended above the fjords, this glass cube offers uninterrupted views of the Aurora Borealis. Complete silence, pure immersion.',
    tags: ['Glass', 'Aurora', 'Isolation'],
    features: ['Heated Floor', 'Telescope', 'Private Chef']
  },
  {
    id: '2',
    title: 'The Brutalist Bunker',
    location: 'Berlin, Germany',
    price: 32000,
    rating: 4.7,
    image: 'https://picsum.photos/800/600?random=2',
    vibe: VibeType.PARTY,
    description: 'Converted WWII bunker featuring Funktion-One sound systems and soundproof concrete walls. The ultimate private venue.',
    tags: ['Industrial', 'Techno', 'History'],
    features: ['Sound System', 'Bar', 'Lighting Rig']
  },
  {
    id: '3',
    title: 'Gayathri Farms',
    location: 'Thenur, Palakkad',
    price: 18000,
    rating: 4.95,
    // Hero Image: Sunset Paddy Field (Image 1 from user)
    image: 'https://images.unsplash.com/photo-1602288637781-5a34a62128a3?q=80&w=2000&auto=format&fit=crop', 
    vibe: VibeType.DETOX,
    description: 'A serene eco-sanctuary located on the Palakkad Ponnani Highway. Experience the authentic rhythm of nature at Gayathri Farms. Watch the sun set over our lush paddy fields, relax by the reflective natural pool under the twilight sky, and walk through our bamboo groves. A true cloud forest experience.',
    tags: ['Eco', 'Paddy Fields', 'Heritage', 'Nature'],
    features: ['Natural Pool', 'Bamboo Grove', 'Traditional Food', 'Sunset View'],
    gallery: [
      // 1. Sunset Paddy Field
      'https://images.unsplash.com/photo-1602288637781-5a34a62128a3?q=80&w=2000&auto=format&fit=crop',
      
      // 2. Twilight Pool Reflection
      'https://images.unsplash.com/photo-1572331165267-854da2b00dc1?q=80&w=2000&auto=format&fit=crop',
      
      // 3. Aerial View of Farm House (Day)
      'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?q=80&w=2000&auto=format&fit=crop',
      
      // 4. Aerial View of Farm House (Night/Dusk/Lights) - Matching user's 4th image
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?q=80&w=2000&auto=format&fit=crop',
      
      // 5. Aerial View of River and Fields
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=2000&auto=format&fit=crop',
      
      // 6. Rangoli / Pookalam Art 1
      'https://images.unsplash.com/photo-1631169873972-747d636b0485?q=80&w=2000&auto=format&fit=crop',
      
      // 7. Rangoli / Pookalam Art 2
      'https://images.unsplash.com/photo-1600093463592-8e36ae95ef56?q=80&w=2000&auto=format&fit=crop',

      // 8. Traditional Art / Chalkboard / Floor Art
      'https://images.unsplash.com/photo-1544983056-fa3d9804e33d?q=80&w=2000&auto=format&fit=crop'
    ],
    coordinates: { lat: 10.7867, lng: 76.6548 }
  },
  {
    id: '4',
    title: 'Silicon Valley Ranch',
    location: 'California, USA',
    price: 55000,
    rating: 4.8,
    image: 'https://picsum.photos/800/600?random=4',
    vibe: VibeType.WORKATION,
    description: 'High-speed fiber optics meet rustic charm. Equipped with ergonomic Herman Miller setups and breakout meeting pods.',
    tags: ['Tech', 'Ranch', 'Productivity'],
    features: ['Starlink', 'Meeting Rooms', 'Espresso Bar']
  },
 
];

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'B-1029',
    propertyId: '1',
    date: '2023-11-15',
    status: 'UPCOMING',
    guests: 2,
    totalPrice: 45000
  },
  {
    id: 'B-0921',
    propertyId: '3',
    date: '2023-08-10',
    status: 'COMPLETED',
    guests: 1,
    totalPrice: 18000
  }
];

export const ADDONS = [
  { id: 'bonfire', name: 'Bonfire Kit', price: 500, emoji: '🔥' },
  { id: 'trek', name: 'Guided Village Trek', price: 300, emoji: '🥾' },
  { id: 'bbq', name: 'Barbecue Setup', price: 1000, emoji: '🍖' },
];
