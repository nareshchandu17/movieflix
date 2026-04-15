export interface Avatar {
  id: string;
  name: string;
  emoji: string;
  gradient: string;
  ring: string;
  category: 'character' | 'animal' | 'abstract';
}

export interface Profile {
  _id: string;
  profileId: string;
  userId: string;
  name: string;
  avatarId: string;
  isKids: boolean;
  isDefault: boolean;
  color: string;
  pin?: string;
  pinEnabled?: boolean;
  pinLockedUntil?: string;
  maturityRating?: 'G' | 'PG' | 'PG-13' | 'R' | 'TV-MA';
  language?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface CreateProfilePayload {
  name: string;
  avatarId: string;
  isKids: boolean;
  color: string;
  pin?: string;
  maturityRating?: 'G' | 'PG' | 'PG-13' | 'R' | 'TV-MA';
  language?: string;
}

export interface ProfileContextType {
  profiles: Profile[];
  activeProfile: Profile | null;
  setActive: (p: Profile) => void;
  refetch: () => void;
}

export type ProfileAction = 'select' | 'edit' | 'delete';
