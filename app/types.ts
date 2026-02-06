export enum Platform {
  INSTAGRAM = 'instagram',
  FACEBOOK = 'facebook'
}

export interface AICaptionSuggestion {
  caption: string;
  hashtags: string[];
  recommendations: string[];
}
