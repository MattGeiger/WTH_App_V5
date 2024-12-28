import { handleSubmit } from '../../handlers/submit.js';
import { showMessage } from '../../../utils.js';
import { validateName } from '../../handlers/validation.js';
import { collectFormData } from '../../handlers/formData.js';

jest.mock('../../../utils.js');
jest.mock('../../handlers/validation.js');
jest.mock('../../handlers/formData.js');

describe('Submit Handler', () => {
    let mockEvent;
    let mockManager;
    let mockData;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <form id="foodItemForm">
                <input type="text" id="foodItemName" value="Test Item">
                <select id="foodItemCategory" value="1"></select>
                <input type="hidden" id="foodItemId" value="">
                <button type="submit">Add Food Item</button>
            </form>
        `;

        // Mock event
        mockEvent = {
            preventDefault: jest.fn()
        };

        // Mock form data
        mockData = {
            name: 'Test Item',
            categoryId: 1,
            itemLimit: 5,
            limitType: 'perHousehold',
            inStock: true
        };

        // Mock manager
        mockManager = {
            nameInput: { value: 'Test Item' },
            categorySelect: { value: '1' },
            updateItem: jest.fn(),
            createItem: jest.fn(),
            resetForm: jest.fn(),
            loadFoodItems: jest.fn()
        };

        // Setup default mock returns
        validateName.mockReturnValue(true);
        collectFormData.mockReturnValue(mockData);
        showMessage.mockReset();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
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
        mockManager.createItem.mockResolvedValue({ success: true });
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(mockManager.createItem).toHaveBeenCalledWith(mockData);
        expect(mockManager.updateItem).not.toHaveBeenCalled();
        expect(mockManager.resetForm).toHaveBeenCalled();
        expect(mockManager.loadFoodItems).toHaveBeenCalled();
    });

    it('should update existing item when ID present', async () => {
        document.getElementById('foodItemId').value = '1';
        mockManager.updateItem.mockResolvedValue({ success: true });
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(mockManager.updateItem).toHaveBeenCalledWith('1', mockData);
        expect(mockManager.createItem).not.toHaveBeenCalled();
        expect(mockManager.resetForm).toHaveBeenCalled();
        expect(mockManager.loadFoodItems).toHaveBeenCalled();
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
        const validationError = new Error('Validation failed');
        validateName.mockImplementation(() => { throw validationError; });
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(showMessage).toHaveBeenCalledWith(
            'Validation failed',
            'error',
            'foodItem'
        );
        expect(mockManager.createItem).not.toHaveBeenCalled();
    });

    it('should handle form data collection errors', async () => {
        const collectionError = new Error('Data collection failed');
        collectFormData.mockImplementation(() => { throw collectionError; });
        
        await handleSubmit(mockEvent, mockManager);
        
        expect(showMessage).toHaveBeenCalledWith(
            'Data collection failed',
            'error',
            'foodItem'
        );
        expect(mockManager.createItem).not.toHaveBeenCalled();
    });
});