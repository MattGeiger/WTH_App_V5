import { validateName, handleNameInput, VALIDATION_RULES } from '../../handlers/validation.js';
import { showMessage } from '../../../utils.js';

jest.mock('../../../utils.js', () => ({
    showMessage: jest.fn()
}));

describe('Food Item Validation', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('validateName', () => {
        it('should return false for names shorter than minimum length', () => {
            expect(validateName('ab')).toBe(false);
            expect(showMessage).toHaveBeenCalledWith(
                'Food item name must be at least three characters long',
                'error',
                'foodItem'
            );
        });

        it('should return false for names with insufficient letters', () => {
            expect(validateName('123')).toBe(false);
            expect(showMessage).toHaveBeenCalledWith(
                'Food item name must include at least three letters',
                'error',
                'foodItem'
            );
        });

        it('should return false for names with repeated words', () => {
            expect(validateName('Apple Apple')).toBe(false);
            expect(showMessage).toHaveBeenCalledWith(
                'Food item name contains repeated words',
                'error',
                'foodItem'
            );
        });

        it('should return true for valid names', () => {
            expect(validateName('Fresh Apples')).toBe(true);
            expect(showMessage).not.toHaveBeenCalled();
        });
    });

    describe('handleNameInput', () => {
        let input;

        beforeEach(() => {
            input = { value: '' };
        });

        it('should trim input to maximum length', () => {
            input.value = 'a'.repeat(VALIDATION_RULES.NAME.MAX_LENGTH + 5);
            const result = handleNameInput(input);
            expect(result.length).toBe(VALIDATION_RULES.NAME.MAX_LENGTH);
            expect(showMessage).toHaveBeenCalledWith(
                'Input cannot exceed 36 characters',
                'warning',
                'foodItem'
            );
        });

        it('should remove consecutive spaces', () => {
            input.value = 'Fresh  Apples';
            expect(handleNameInput(input)).toBe('Fresh Apples');
        });

        it('should convert to title case', () => {
            input.value = 'fresh apples';
            expect(handleNameInput(input)).toBe('Fresh Apples');
        });

        it('should warn about repeated words', () => {
            input.value = 'fresh fresh apples';
            handleNameInput(input);
            expect(showMessage).toHaveBeenCalledWith(
                'Input contains repeated words',
                'warning',
                'foodItem'
            );
        });
    });
});