/**
 * @jest-environment jsdom
 */

import { handleSubmit } from '../../handlers/submit.js';
import { collectFormData } from '../../handlers/formData.js';
import { showMessage, apiPost, apiPut } from '../../../utils.js';
import { EVENTS } from '../../../main.js';

// Mock dependencies
jest.mock('../../handlers/formData.js');
jest.mock('../../../utils.js');

describe('Submit Handler', () => {
    let mockEvent;
    let mockManager;
    
    beforeEach(() => {
        // Reset all mocks
        jest.clearAllMocks();
        
        // Setup mock event
        mockEvent = {
            preventDefault: jest.fn()
        };
        
        // Setup mock manager with proper structure
        mockManager = {
            resetForm: jest.fn(),
            loadCategories: jest.fn(),
            showMessage: jest.fn(),
            managers: {
                settings: {
                    getCurrentLimit: jest.fn().mockReturnValue(10)
                }
            }
        };

        // Setup mock document
        document.dispatchEvent = jest.fn();
    });

    describe('handleSubmit', () => {
        test('prevents default form submission', async () => {
            await handleSubmit(mockEvent, mockManager);
            expect(mockEvent.preventDefault).toHaveBeenCalled();
        });

        test('validates form data before submission', async () => {
            collectFormData.mockReturnValue({
                name: '',
                itemLimit: 0
            });

            await handleSubmit(mockEvent, mockManager);
            expect(mockManager.showMessage).toHaveBeenCalledWith(
                'Invalid form data',
                'error',
                'category'
            );
        });

        describe('new category submission', () => {
            beforeEach(() => {
                collectFormData.mockReturnValue({
                    name: 'Fresh Produce',
                    itemLimit: 5
                });
            });

            test('successfully creates new category', async () => {
                apiPost.mockResolvedValue({ success: true });

                await handleSubmit(mockEvent, mockManager);

                expect(apiPost).toHaveBeenCalledWith('/api/categories', {
                    name: 'Fresh Produce',
                    itemLimit: 5
                });
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category created successfully',
                    'success',
                    'category'
                );
                expect(mockManager.resetForm).toHaveBeenCalled();
                expect(mockManager.loadCategories).toHaveBeenCalled();
                expect(document.dispatchEvent).toHaveBeenCalledWith(
                    new Event(EVENTS.CATEGORY_UPDATED)
                );
            });

            test('handles creation error', async () => {
                const error = new Error('API Error');
                apiPost.mockRejectedValue(error);

                await handleSubmit(mockEvent, mockManager);

                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'API Error',
                    'error',
                    'category'
                );
                expect(mockManager.resetForm).not.toHaveBeenCalled();
            });
        });

        describe('category update', () => {
            beforeEach(() => {
                collectFormData.mockReturnValue({
                    id: 1,
                    name: 'Updated Produce',
                    itemLimit: 7
                });
            });

            test('successfully updates existing category', async () => {
                apiPut.mockResolvedValue({ success: true });

                await handleSubmit(mockEvent, mockManager);

                expect(apiPut).toHaveBeenCalledWith('/api/categories/1', {
                    name: 'Updated Produce',
                    itemLimit: 7
                });
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category updated successfully',
                    'success',
                    'category'
                );
                expect(mockManager.resetForm).toHaveBeenCalled();
                expect(mockManager.loadCategories).toHaveBeenCalled();
                expect(document.dispatchEvent).toHaveBeenCalledWith(
                    new Event(EVENTS.CATEGORY_UPDATED)
                );
            });

            test('handles update error', async () => {
                const error = new Error('Update failed');
                apiPut.mockRejectedValue(error);

                await handleSubmit(mockEvent, mockManager);

                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Update failed',
                    'error',
                    'category'
                );
                expect(mockManager.resetForm).not.toHaveBeenCalled();
            });
        });

        describe('validation scenarios', () => {
            test('rejects when name is too short', async () => {
                collectFormData.mockReturnValue({
                    name: 'Ab',
                    itemLimit: 5
                });

                await handleSubmit(mockEvent, mockManager);

                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Category name must be at least three characters',
                    'error',
                    'category'
                );
                expect(apiPost).not.toHaveBeenCalled();
            });

            test('rejects when item limit exceeds global limit', async () => {
                collectFormData.mockReturnValue({
                    name: 'Valid Name',
                    itemLimit: 15 // Greater than mock global limit of 10
                });

                await handleSubmit(mockEvent, mockManager);

                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Item limit cannot exceed global limit of 10',
                    'error',
                    'category'
                );
                expect(apiPost).not.toHaveBeenCalled();
            });

            test('handles missing form data', async () => {
                collectFormData.mockReturnValue(null);

                await handleSubmit(mockEvent, mockManager);

                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Invalid form data',
                    'error',
                    'category'
                );
                expect(apiPost).not.toHaveBeenCalled();
            });
        });

        describe('error handling edge cases', () => {
            test('handles null manager gracefully', async () => {
                await handleSubmit(mockEvent, null);
                expect(showMessage).toHaveBeenCalledWith(
                    'Invalid manager configuration',
                    'error',
                    'category'
                );
            });

            test('handles undefined manager settings gracefully', async () => {
                const managerWithoutSettings = {
                    resetForm: jest.fn(),
                    loadCategories: jest.fn(),
                    showMessage: jest.fn(),
                    managers: {}
                };

                collectFormData.mockReturnValue({
                    name: 'Valid Name',
                    itemLimit: 5
                });

                await handleSubmit(mockEvent, managerWithoutSettings);
                expect(apiPost).toHaveBeenCalledWith('/api/categories', {
                    name: 'Valid Name',
                    itemLimit: 5
                });
            });

            test('handles falsy getCurrentLimit value', async () => {
                const managerWithFalsyLimit = {
                    ...mockManager,
                    managers: {
                        settings: {
                            getCurrentLimit: jest.fn().mockReturnValue(0)
                        }
                    }
                };

                collectFormData.mockReturnValue({
                    name: 'Valid Name',
                    itemLimit: 150 // Should test against default 100
                });

                await handleSubmit(mockEvent, managerWithFalsyLimit);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'Item limit cannot exceed global limit of 100',
                    'error',
                    'category'
                );
                expect(apiPost).not.toHaveBeenCalled();
            });

            test('handles incomplete settings object', async () => {
                const managerVariations = [
                    { ...mockManager, managers: { settings: {} } },
                    { ...mockManager, managers: { settings: null } },
                    { ...mockManager, managers: { settings: { getCurrentLimit: null } } }
                ];

                collectFormData.mockReturnValue({
                    name: 'Valid Name',
                    itemLimit: 150 // Should test against default 100
                });

                for (const mgr of managerVariations) {
                    await handleSubmit(mockEvent, mgr);
                    expect(mockManager.showMessage).toHaveBeenCalledWith(
                        'Item limit cannot exceed global limit of 100',
                        'error',
                        'category'
                    );
                    expect(apiPost).not.toHaveBeenCalled();
                }
            });

            test('handles network error with empty message', async () => {
                collectFormData.mockReturnValue({
                    name: 'Valid Name',
                    itemLimit: 5
                });
                const error = new Error();
                apiPost.mockRejectedValue(error);

                await handleSubmit(mockEvent, mockManager);
                expect(mockManager.showMessage).toHaveBeenCalledWith(
                    'An error occurred',
                    'error',
                    'category'
                );
            });
        });
    });
});