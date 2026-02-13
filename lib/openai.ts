import ModelClient, { isUnexpected } from '@azure-rest/ai-inference';
import { AzureKeyCredential } from '@azure/core-auth';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const MODEL = process.env.MODEL || 'openai/gpt-4.1';
const ENDPOINT = 'https://models.github.ai/inference';

export async function generateAIResponse(
  systemPrompt: string,
  goal: string,
  rules: string,
  knowledgeText: string,
  userMessage: string
): Promise<string> {
  if (!GITHUB_TOKEN) {
    throw new Error('GITHUB_TOKEN is not set');
  }

  const systemMessage = `You are a WhatsApp business assistant.
Goal: ${goal}
Rules: ${rules}
Knowledge: ${knowledgeText}
Be concise, clear, and helpful. Keep responses under 1000 characters.
${systemPrompt}`;

  const client = ModelClient(ENDPOINT, new AzureKeyCredential(GITHUB_TOKEN));
  const response = await client.path('/chat/completions').post({
    body: {
      model: MODEL,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage },
      ],
      temperature: 0.7,
      top_p: 1,
    },
  });

  if (isUnexpected(response)) {
    const err = response.body?.error;
    console.error('GitHub AI API error:', err);
    throw new Error(err?.message || 'GitHub AI API error');
  }

  const content = response.body?.choices?.[0]?.message?.content?.trim();
  if (!content) {
    throw new Error('No response from GitHub AI model');
  }

  return content;
}
