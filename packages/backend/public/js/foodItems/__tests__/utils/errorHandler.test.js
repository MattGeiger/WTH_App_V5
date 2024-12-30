import { handleError, handleSuccess } from '../../utils/errorHandler.js';
import { showMessage } from '../../../utils.js';

// Mock the external showMessage function
jest.mock('../../../utils.js', () => ({
    showMessage: jest.fn()
}));

// Mock console.error
const originalConsoleError = console.error;
beforeEach(() => {
    console.error = jest.fn();
});

afterEach(() => {
    console.error = originalConsoleError;
    jest.clearAllMocks();
});

describe('Error Handler Utils', () => {
    describe('handleError', () => {
        it('should handle error with message', () => {
            const error = new Error('Test error');
            const context = 'Testing';
            const result = handleError(error, context);

            expect(result).toBe(false);
            expect(showMessage).toHaveBeenCalledWith(
                'Testing: Test error',
                'error',
                'foodItem'
            );
            expect(console.error).toHaveBeenCalledWith(
                'Food Items Error (Testing):',
                error
            );
        });

        it('should handle error without message', () => {
            const error = new Error();
            const context = 'Testing';
            const result = handleError(error, context);

            expect(result).toBe(false);
            expect(showMessage).toHaveBeenCalledWith(
                'Testing: An error occurred',
                'error',
                'foodItem'
            );
            expect(console.error).toHaveBeenCalledWith(
                'Food Items Error (Testing):',
                error
            );
        });

        it('should handle non-Error objects', () => {
            const error = { custom: 'error' };
            const context = 'Testing';
            const result = handleError(error, context);

            expect(result).toBe(false);
            expect(showMessage).toHaveBeenCalledWith(
                'Testing: An error occurred',
                'error',
                'foodItem'
            );
            expect(console.error).toHaveBeenCalledWith(
                'Food Items Error (Testing):',
                error
            );
        });

        it('should handle undefined error', () => {
            const context = 'Testing';
            const result = handleError(undefined, context);

            expect(result).toBe(false);
            expect(showMessage).toHaveBeenCalledWith(
                'Testing: An error occurred',
                'error',
                'foodItem'
            );
            expect(console.error).toHaveBeenCalledWith(
                'Food Items Error (Testing):',
                undefined
            );
        });
    });

    describe('handleSuccess', () => {
        it('should handle success message', () => {
            const message = 'Operation successful';
            const result = handleSuccess(message);

            expect(result).toBe(true);
            expect(showMessage).toHaveBeenCalledWith(
                message,
                'success',
                'foodItem'
            );
        });

        it('should handle empty success message', () => {
            const result = handleSuccess();

            expect(result).toBe(true);
            expect(showMessage).toHaveBeenCalledWith(
                undefined,
                'success',
                'foodItem'
            );
        });

        it('should handle null success message', () => {
            const result = handleSuccess(null);

            expect(result).toBe(true);
            expect(showMessage).toHaveBeenCalledWith(
                null,
                'success',
                'foodItem'
            );
        });
    });
});