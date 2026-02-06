export enum Platform {
  FACEBOOK = 'Facebook',
  INSTAGRAM = 'Instagram'
}

export interface PostContent {
  text: string;
  mediaUrl: string | null;
  mediaType: 'image' | 'video' | null;
  platform: Platform;
}

export interface AICaptionSuggestion {
  caption: string;
  hashtags: string[];
  engagementTip: string;
}

export interface UserProfile {
  name: string;
  avatar: string;
}
