
export interface Property {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  image: string;
  vibe: VibeType;
  description: string;
  tags: string[];
  features: string[];
  reviews?: Review[];
  coordinates?: { lat: number; lng: number };
  gallery?: string[]; // Added gallery support
  minTier?: 'Silver' | 'Gold' | 'Platinum'; // For Vault properties
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  rating: number;
  date: string;
  comment: string;
  isVerified: boolean;
}

export enum VibeType {
  ZEN = 'Zen',
  PARTY = 'Party',
  WORKATION = 'Workation',
  DETOX = 'Detox',
  ADVENTURE = 'Adventure'
}

export interface Booking {
  id: string;
  propertyId: string;
  date: string;
  endDate?: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  guests: number;
  totalPrice: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin' | 'host';
  avatar: string;
  memberStatus: 'Silver' | 'Gold' | 'Platinum';
  vibeScore?: number;
  mfaEnabled?: boolean;
}

export interface GroundingChunk {
  web?: { uri: string; title: string };
  maps?: { uri: string; title: string };
}

export interface GroundingMetadata {
  groundingChunks?: GroundingChunk[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  groundingMetadata?: GroundingMetadata;
}

// The 5 distinct brains of the AI Concierge
export type ChatMode = 'standard' | 'thinking' | 'search' | 'maps' | 'fast';
