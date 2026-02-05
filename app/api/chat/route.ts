import { google } from '@ai-sdk/google';
import { streamText } from 'ai';
import { sql } from '@vercel/postgres';

export const runtime = 'edge';

export async function POST(req: Request) {
  const { messages } = await req.json();
  const posledniText = messages[messages.length - 1].content;

  try {
    await sql`INSERT INTO zpravy (text) VALUES (${posledniText})`;
  } catch (e) {
    console.error("Chyba DB:", e);
  }

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    messages,
  });

  return result.toDataStreamResponse();
}
