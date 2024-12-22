import { PrismaClient } from '@prisma/client';
import { ApiError } from './ApiError';

const prisma = new PrismaClient();

export interface ValidationResult {
    isValid: boolean;
    error?: string;
    normalizedValue?: string;
}

export class ValidationUtils {
    private static readonly MAX_LENGTH = 36;
    private static readonly MIN_LENGTH = 3;

    static async validateInput(
        input: string,
        type: 'category' | 'foodItem',
        existingId?: number
    ): Promise<ValidationResult> {
        try {
            input = input.trim();

            if (input.length > this.MAX_LENGTH) {
                return {
                    isValid: false,
                    error: `Input cannot exceed ${this.MAX_LENGTH} characters, including spaces.`
                };
            }

            if (input.length < this.MIN_LENGTH) {
                return {
                    isValid: false,
                    error: 'Input must be at least three characters long.'
                };
            }

            const letterCount = (input.match(/[a-zA-Z]/g) || []).length;
            if (letterCount < 3) {
                return {
                    isValid: false,
                    error: 'Input must include at least three letters.'
                };
            }

            if (/\s{2,}/.test(input)) {
                return {
                    isValid: false,
                    error: 'Input contains unnecessary spaces.'
                };
            }

            const words = input.toLowerCase().split(' ');
            const uniqueWords = new Set(words);
            if (uniqueWords.size !== words.length) {
                return {
                    isValid: false,
                    error: 'Input contains repeated words.'
                };
            }

            const normalizedInput = input.toLowerCase();

            // Check categories using LIKE query for SQLite
            const existingCategory = await prisma.category.findFirst({
                where: {
                    name: {
                        contains: normalizedInput
                    },
                    NOT: existingId ? { id: existingId } : undefined
                }
            });

            if (existingCategory && 
                existingCategory.name.toLowerCase() === normalizedInput) {
                return {
                    isValid: false,
                    error: type === 'category' ? 
                        'This category already exists.' : 
                        'This name already exists as a category.'
                };
            }

            // Check food items using LIKE query for SQLite
            const existingFoodItem = await prisma.foodItem.findFirst({
                where: {
                    name: {
                        contains: normalizedInput
                    },
                    NOT: existingId ? { id: existingId } : undefined
                }
            });

            if (existingFoodItem && 
                existingFoodItem.name.toLowerCase() === normalizedInput) {
                return {
                    isValid: false,
                    error: type === 'foodItem' ? 
                        'This food item already exists.' : 
                        'This name already exists as a food item.'
                };
            }

            const titleCaseInput = input
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                .join(' ');

            return {
                isValid: true,
                normalizedValue: titleCaseInput
            };
        } catch (error) {
            console.error('Validation error:', error);
            throw new ApiError(400, 'Validation failed. Please try again.');
        } finally {
            await prisma.$disconnect();
        }
    }

    static formatForDisplay(input: string): string {
        return input
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
            .join(' ');
    }
}
