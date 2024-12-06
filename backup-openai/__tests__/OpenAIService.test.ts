import { OpenAIService } from '../OpenAIService';

const mockCreateResponse = {
    choices: [{ message: { content: 'manzana', role: 'assistant' } }]
};

jest.mock('openai', () => ({
    OpenAI: function() {
        return {
            chat: {
                completions: {
                    create: () => Promise.resolve(mockCreateResponse)
                }
            }
        };
    }
}));

describe('OpenAIService', () => {
    beforeEach(() => {
        process.env.OPENAI_API_KEY = 'test-key';
    });

    it('should initialize with valid API key', () => {
        expect(() => new OpenAIService()).not.toThrow();
    });

    it('should throw error when API key is missing', () => {
        delete process.env.OPENAI_API_KEY;
        expect(() => new OpenAIService()).toThrow('OpenAI API key is not configured');
    });

    it('should translate text successfully', async () => {
        const service = new OpenAIService();
        const result = await service.translateText('apple', 'es', 'foodItem');
        expect(result).toBe('manzana');
    });

    it('should connect to OpenAI API', async () => {
        const service = new OpenAIService();
        const result = await service.testConnection();
        expect(result).toBe(true);
    });
});