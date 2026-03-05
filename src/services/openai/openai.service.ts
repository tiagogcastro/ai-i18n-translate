import { getOpenAIClient } from '@/services/openai/openai.client';
import { TranslateChunkRequest } from '@/types';

export const openAITranslateChunk = async ({
  model,
  texts,
  OPENAI_API_KEY,
  systemPrompt = '',
}: TranslateChunkRequest): Promise<Record<string, string>> => {
  const client = getOpenAIClient(OPENAI_API_KEY);

  const response = await client.chat.completions.create({
    model,
    temperature: 0,
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: JSON.stringify(texts) },
      { role: "user", content: "Return a valid JSON object only, with all keys unchanged." },
    ],
  });

  const content = response.choices[0].message.content || "{}";
  return JSON.parse(content);
};