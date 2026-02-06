import { Platform, AICaptionSuggestion } from '../types';

export async function generateSocialContent(
  platform: Platform,
  text: string,
  imageData?: string
): Promise<AICaptionSuggestion> {
  const response = await fetch('/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ platform, text, imageData }),
  });

  if (!response.ok) throw new Error('AI request failed');
  return response.json();
}
