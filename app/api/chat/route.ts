import { google } from '@ai-sdk/google';
import { generateObject } from 'ai';
import { z } from 'zod';

export const runtime = 'nodejs';

const CaptionSchema = z.object({
  caption: z.string().describe('Poutavý popisek optimalizovaný pro sociální síť'),
  hashtags: z.array(z.string()).describe('Relevantní hashtagy'),
  engagementTip: z.string().describe('Tip pro zvýšení engagement a dosahu'),
});

export async function POST(req: Request) {
  try {
    const { platform, text, imageData } = await req.json();

    if (!text && !imageData) {
      return Response.json(
        { error: 'Text nebo obrázek je povinný' },
        { status: 400 }
      );
    }

    const prompt = `
      Role: Jsi profesionální Social Media Manager.
      Cíl: Transformuj surový nápad uživatele do vysoce kvalitního příspěvku pro ${platform}.
      Jazyk: Vždy komunikuj v češtině.
      
      Kontext od uživatele: "${text}"
      Platforma: ${platform}
      
      Instrukce:
      1. Vytvoř poutavý popisek optimalizovaný pro ${platform} (používej emoji, kde se to hodí).
      2. Navrhni 5-10 populárních českých hashtagů ve formátu #hashtag.
      3. Poskytni jeden krátký tip pro zvýšení engagement a dosahu.
    `;

    const result = await generateObject({
      model: google('gemini-2.0-flash'),
      schema: CaptionSchema,
      prompt,
    });

    return Response.json(result.object);
  } catch (error) {
    console.error('Chyba při generování obsahu:', error);
    return Response.json(
      { error: 'Nepodařilo se zpracovat žádost o AI generování' },
      { status: 500 }
    );
  }
}

