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
        
        // Setup mock manager
        mockManager = {
            resetForm: jest.fn(),
            loadCategories: jest.fn(),
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
            expect(showMessage).toHaveBeenCalledWith(
                expect.any(String),
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
                expect(showMessage).toHaveBeenCalledWith(
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

                expect(showMessage).toHaveBeenCalledWith(
                    error.message,
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
                expect(showMessage).toHaveBeenCalledWith(
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

                expect(showMessage).toHaveBeenCalledWith(
                    error.message,
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

                expect(showMessage).toHaveBeenCalledWith(
                    expect.stringContaining('three characters'),
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

                expect(showMessage).toHaveBeenCalledWith(
                    expect.stringContaining('global limit'),
                    'error',
                    'category'
                );
                expect(apiPost).not.toHaveBeenCalled();
            });

            test('handles missing form data', async () => {
                collectFormData.mockReturnValue(null);

                await handleSubmit(mockEvent, mockManager);

                expect(showMessage).toHaveBeenCalledWith(
                    expect.any(String),
                    'error',
                    'category'
                );
                expect(apiPost).not.toHaveBeenCalled();
            });
        });
    });
});