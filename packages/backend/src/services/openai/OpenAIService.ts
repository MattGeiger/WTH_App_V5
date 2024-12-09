import { OpenAI } from 'openai';
import { ApiError } from '../../utils/ApiError';
import { LanguageConfig, getLanguageName } from '../../config/languageConfig';

export class OpenAIService {
    private client: OpenAI;
    private readonly maxRetries = 3;
    private readonly retryDelay = 1000; // 1 second

    constructor() {
        if (!process.env.OPENAI_API_KEY) {
            throw new ApiError(500, 'OpenAI API key is not configured');
        }
        this.client = new OpenAI({ 
            apiKey: process.env.OPENAI_API_KEY,
            maxRetries: this.maxRetries
        });
    }

    async translateText(
        text: string, 
        targetLanguage: string, 
        context: 'category' | 'foodItem'
    ): Promise<string> {
        const languageName = getLanguageName(targetLanguage);
        
        try {
            const systemPrompt = this.buildSystemPrompt(context, languageName);
            const response = await this.client.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: text }
                ],
                temperature: 0.3, // Lower temperature for more consistent translations
                max_tokens: 100  // Limit response length for efficiency
            });

            const translation = response.choices[0]?.message?.content?.trim();
            if (!translation) {
                throw new ApiError(500, 'Translation failed - empty response');
            }

            return translation;
        } catch (error) {
            console.error('Translation error:', error);
            throw new ApiError(500, `Translation failed: ${(error as Error).message}`);
        }
    }

    private buildSystemPrompt(context: 'category' | 'foodItem', languageName: string): string {
        const contextPrompts = {
            category: `You are a professional translator specializing in food categories. 
                      Translate the following category name to ${languageName}. 
                      Keep the translation concise and commonly used in food contexts.`,
            foodItem: `You are a professional translator specializing in food items. 
                      Translate the following food item name to ${languageName}. 
                      Use the most common term that would be recognized by native speakers.`
        };

        return contextPrompts[context];
    }

    async testConnection(): Promise<boolean> {
        try {
            const response = await this.client.chat.completions.create({
                model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
                messages: [
                    { role: 'system', content: 'Respond with "OK" if you can read this.' },
                    { role: 'user', content: 'Connection test' }
                ],
                max_tokens: 5
            });
            
            return response.choices[0]?.message?.content?.includes('OK') ?? false;
        } catch (error) {
            console.error('OpenAI connection test failed:', error);
            return false;
        }
    }

    async bulkTranslate(
        items: Array<{ id: number; text: string }>, 
        targetLanguage: string, 
        context: 'category' | 'foodItem'
    ): Promise<Array<{ id: number; translation: string }>> {
        const results = [];
        
        for (const item of items) {
            try {
                const translation = await this.translateText(item.text, targetLanguage, context);
                results.push({ id: item.id, translation });
                // Add small delay between requests to respect rate limits
                await new Promise(resolve => setTimeout(resolve, 200));
            } catch (error) {
                console.error(`Translation failed for item ${item.id}:`, error);
                results.push({ id: item.id, translation: '' });
            }
        }

        return results;
    }
}