import { handleSubmit } from '../../handlers/submit.js';
import { validateName } from '../../handlers/validation.js';
import { collectFormData } from '../../handlers/formData.js';
import { showMessage } from '../../../utils.js';

// Mock dependencies
jest.mock('../../../utils.js');
jest.mock('../../handlers/validation.js');
jest.mock('../../handlers/formData.js');

describe('Submit Handler', () => {
    let mockEvent;
    let mockManager;
    let mockData;

    beforeEach(() => {
        // Reset mocks
        jest.clearAllMocks();

        // Mock event
        mockEvent = {
            preventDefault: jest.fn()
        };

        // Mock form data
        mockData = {
            name: 'Test Item',
            categoryId: 1,
            itemLimit: 5
        };

        // Mock manager
        mockManager = {
            nameInput: { value: 'Test Item' },
            categorySelect: { value: '1' },
            createItem: jest.fn().mockResolvedValue(true),
            updateItem: jest.fn().mockResolvedValue(true),
            resetForm: jest.fn(),
            loadFoodItems: jest.fn()
        };

        // Set up default mock returns
        validateName.mockReturnValue(true);
        collectFormData.mockReturnValue(mockData);

        // Set up DOM
        document.body.innerHTML = `
            <input type="hidden" id="foodItemId" value="">
        `;
    });

    it('should prevent default form submission', async () => {
        await handleSubmit(mockEvent, mockManager);
        expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should validate name before submission', async () => {
        validateName.mockReturnValue(false);
        await handleSubmit(mockEvent, mockManager);
        
        expect(validateName).toHaveBeenCalledWith('Test Item');
        expect(mockManager.createItem).not.toHaveBeenCalled();
        expect(showMessage).toHaveBeenCalledWith(
            'Invalid item name', 
            'error', 
            'foodItem'
        );
    });

    it('should show error if category is not selected', async () => {
        mockData.categoryId = '';
        collectFormData.mockReturnValue(mockData);
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(showMessage).toHaveBeenCalledWith(
            'Please select a category',
            'error',
            'foodItem'
        );
        expect(mockManager.createItem).not.toHaveBeenCalled();
    });

    it('should create new item when no ID present', async () => {
        await handleSubmit(mockEvent, mockManager);
        
        expect(mockManager.createItem).toHaveBeenCalledWith(mockData);
        expect(mockManager.updateItem).not.toHaveBeenCalled();
        expect(mockManager.resetForm).toHaveBeenCalled();
        expect(mockManager.loadFoodItems).toHaveBeenCalled();
        expect(showMessage).toHaveBeenCalledWith(
            'Food item created successfully',
            'success',
            'foodItem'
        );
    });

    it('should update existing item when ID present', async () => {
        document.getElementById('foodItemId').value = '1';
        await handleSubmit(mockEvent, mockManager);
        
        expect(mockManager.updateItem).toHaveBeenCalledWith('1', mockData);
        expect(mockManager.createItem).not.toHaveBeenCalled();
        expect(mockManager.resetForm).toHaveBeenCalled();
        expect(mockManager.loadFoodItems).toHaveBeenCalled();
        expect(showMessage).toHaveBeenCalledWith(
            'Food item updated successfully',
            'success',
            'foodItem'
        );
    });

    it('should handle API errors gracefully', async () => {
        const error = new Error('API Error');
        mockManager.createItem.mockRejectedValue(error);
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(showMessage).toHaveBeenCalledWith(
            'API Error',
            'error',
            'foodItem'
        );
        expect(mockManager.resetForm).not.toHaveBeenCalled();
        expect(mockManager.loadFoodItems).not.toHaveBeenCalled();
    });

    it('should handle validation errors appropriately', async () => {
        validateName.mockImplementation(() => {
            throw new Error('Validation failed');
        });
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(showMessage).toHaveBeenCalledWith(
            'Validation failed',
            'error',
            'foodItem'
        );
        expect(mockManager.createItem).not.toHaveBeenCalled();
    });

    it('should handle form data collection errors', async () => {
        collectFormData.mockImplementation(() => {
            throw new Error('Data collection failed');
        });
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(showMessage).toHaveBeenCalledWith(
            'Data collection failed',
            'error',
            'foodItem'
        );
        expect(mockManager.createItem).not.toHaveBeenCalled();
    });

    it('should handle failed create operation', async () => {
        mockManager.createItem.mockResolvedValue(false);
        await handleSubmit(mockEvent, mockManager);
        
        expect(mockManager.resetForm).not.toHaveBeenCalled();
        expect(mockManager.loadFoodItems).not.toHaveBeenCalled();
        expect(showMessage).not.toHaveBeenCalledWith(
            expect.stringContaining('successfully'),
            'success',
            'foodItem'
        );
    });

    it('should handle failed update operation', async () => {
        document.getElementById('foodItemId').value = '1';
        mockManager.updateItem.mockResolvedValue(false);
        await handleSubmit(mockEvent, mockManager);
        
        expect(mockManager.resetForm).not.toHaveBeenCalled();
        expect(mockManager.loadFoodItems).not.toHaveBeenCalled();
        expect(showMessage).not.toHaveBeenCalledWith(
            expect.stringContaining('successfully'),
            'success',
            'foodItem'
        );
    });

    it('should handle error without message', async () => {
        const error = new Error();
        mockManager.createItem.mockRejectedValue(error);
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(showMessage).toHaveBeenCalledWith(
            'An error occurred',
            'error',
            'foodItem'
        );
    });
});