import { OpenAIService } from '../OpenAIService';
import { ApiError } from '../../../utils/ApiError';

// Mock OpenAI responses
const mockCreateCompletion = jest.fn();
jest.mock('openai', () => ({
    OpenAI: jest.fn().mockImplementation(() => ({
        chat: {
            completions: {
                create: mockCreateCompletion
            }
        }
    }))
}));

describe('OpenAIService', () => {
    let service: OpenAIService;

    beforeEach(() => {
        process.env.OPENAI_API_KEY = 'test-key';
        process.env.OPENAI_MODEL = 'gpt-4o-mini';
        mockCreateCompletion.mockClear();
        service = new OpenAIService();
    });

    describe('initialization', () => {
        it('should initialize with valid API key', () => {
            expect(() => new OpenAIService()).not.toThrow();
        });

        it('should throw error when API key is missing', () => {
            delete process.env.OPENAI_API_KEY;
            expect(() => new OpenAIService()).toThrow('OpenAI API key is not configured');
        });
    });

    describe('translateText', () => {
        beforeEach(() => {
            mockCreateCompletion.mockResolvedValue({
                choices: [{ message: { content: 'manzana', role: 'assistant' } }]
            });
        });

        it('should translate text successfully', async () => {
            const result = await service.translateText('apple', 'es', 'foodItem');
            expect(result).toBe('manzana');
            expect(mockCreateCompletion).toHaveBeenCalledWith(expect.objectContaining({
                temperature: 0.3,
                max_tokens: 100
            }));
        });

        it('should handle empty responses', async () => {
            mockCreateCompletion.mockResolvedValue({
                choices: [{ message: { content: '', role: 'assistant' } }]
            });
            await expect(service.translateText('apple', 'es', 'foodItem'))
                .rejects
                .toThrow('Translation failed - empty response');
        });

        it('should handle API errors', async () => {
            mockCreateCompletion.mockRejectedValue(new Error('API Error'));
            await expect(service.translateText('apple', 'es', 'foodItem'))
                .rejects
                .toThrow('Translation failed: API Error');
        });
    });

    describe('testConnection', () => {
        it('should return true for successful connection', async () => {
            mockCreateCompletion.mockResolvedValue({
                choices: [{ message: { content: 'OK', role: 'assistant' } }]
            });
            const result = await service.testConnection();
            expect(result).toBe(true);
        });

        it('should return false for failed connection', async () => {
            mockCreateCompletion.mockRejectedValue(new Error('Connection failed'));
            const result = await service.testConnection();
            expect(result).toBe(false);
        });
    });

    describe('bulkTranslate', () => {
        const testItems = [
            { id: 1, text: 'apple' },
            { id: 2, text: 'banana' }
        ];

        beforeEach(() => {
            mockCreateCompletion
                .mockResolvedValueOnce({
                    choices: [{ message: { content: 'manzana', role: 'assistant' } }]
                })
                .mockResolvedValueOnce({
                    choices: [{ message: { content: 'plátano', role: 'assistant' } }]
                });
        });

        it('should translate multiple items successfully', async () => {
            const results = await service.bulkTranslate(testItems, 'es', 'foodItem');
            expect(results).toEqual([
                { id: 1, translation: 'manzana' },
                { id: 2, translation: 'plátano' }
            ]);
        });

        it('should handle partial failures in bulk translation', async () => {
            mockCreateCompletion
                .mockResolvedValueOnce({
                    choices: [{ message: { content: 'manzana', role: 'assistant' } }]
                })
                .mockRejectedValueOnce(new Error('API Error'));

            const results = await service.bulkTranslate(testItems, 'es', 'foodItem');
            expect(results).toEqual([
                { id: 1, translation: 'manzana' },
                { id: 2, translation: '' }
            ]);
        });

        it('should respect rate limiting with delays', async () => {
            const startTime = Date.now();
            await service.bulkTranslate(testItems, 'es', 'foodItem');
            const duration = Date.now() - startTime;
            expect(duration).toBeGreaterThanOrEqual(200); // At least 200ms delay
        });
    });
});