import { OpenAI } from 'openai';
import { ApiError } from '../../utils/ApiError';

export class OpenAIService {
    private client: OpenAI;
    
    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new ApiError(500, 'OpenAI API key is not configured');
        }
        this.client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    }

    async translateText(text: string, targetLanguage: string, context: 'category' | 'foodItem'): Promise<string> {
        const response = await this.client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                { role: 'system', content: `Translate ${context} names to ${targetLanguage}.` },
                { role: 'user', content: text }
            ]
        });
        return response.choices[0]?.message?.content?.trim() || '';
    }

    async testConnection(): Promise<boolean> {
        try {
            await this.client.chat.completions.create({
                model: 'gpt-4o-mini',
                messages: [{ role: 'user', content: 'test' }]
            });
            return true;
        } catch {
            return false;
        }
    }
}