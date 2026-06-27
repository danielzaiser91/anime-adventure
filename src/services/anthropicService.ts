import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

function getClient(): Anthropic {
  if (!client) {
    client = new Anthropic({
      apiKey: import.meta.env['VITE_ANTHROPIC_API_KEY'] ?? '',
      dangerouslyAllowBrowser: true,
    });
  }
  return client;
}

export async function generateHint(puzzleContext: string): Promise<string> {
  const apiKey = import.meta.env['VITE_ANTHROPIC_API_KEY'];
  if (!apiKey) return 'Check the symbols carefully...';
  try {
    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      messages: [
        {
          role: 'user',
          content: `You are a mystical game hint system. Give a brief, cryptic hint for this puzzle: ${puzzleContext}. Maximum 1 sentence, poetic style.`,
        },
      ],
    });
    const block = response.content[0];
    return block?.type === 'text' ? block.text : 'The answer lies within...';
  } catch {
    return 'Trust your instincts...';
  }
}

export async function generateNarration(sceneContext: string): Promise<string> {
  const apiKey = import.meta.env['VITE_ANTHROPIC_API_KEY'];
  if (!apiKey) return '';
  try {
    const response = await getClient().messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 150,
      messages: [
        {
          role: 'user',
          content: `You are a narrator for an anime adventure game. Add atmospheric flavor to this scene: ${sceneContext}. Keep it to 2 sentences maximum, evocative and cinematic.`,
        },
      ],
    });
    const block = response.content[0];
    return block?.type === 'text' ? block.text : '';
  } catch {
    return '';
  }
}
