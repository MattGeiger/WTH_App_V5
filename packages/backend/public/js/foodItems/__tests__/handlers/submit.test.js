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

    beforeEach(() => {
        mockEvent = {
            preventDefault: jest.fn()
        };

        mockManager = {
            nameInput: { value: 'Test Item' },
            updateItem: jest.fn(),
            createItem: jest.fn(),
            resetForm: jest.fn(),
            loadFoodItems: jest.fn()
        };

        validateName.mockReset().mockReturnValue(true);
        collectFormData.mockReset().mockReturnValue({
            name: 'Test Item',
            categoryId: '1'
        });
        showMessage.mockReset();
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
        collectFormData.mockReturnValue({ categoryId: '' });
        await handleSubmit(mockEvent, mockManager);
        expect(showMessage).toHaveBeenCalledWith(
            'Please select a category',
            'error',
            'foodItem'
        );
        expect(mockManager.createItem).not.toHaveBeenCalled();
    });

    it('should create new item when no ID present', async () => {
        mockManager.createItem.mockResolvedValue(true);
        await handleSubmit(mockEvent, mockManager);
        expect(mockManager.createItem).toHaveBeenCalled();
        expect(mockManager.updateItem).not.toHaveBeenCalled();
        expect(mockManager.resetForm).toHaveBeenCalled();
        expect(mockManager.loadFoodItems).toHaveBeenCalled();
    });

    it('should update existing item when ID present', async () => {
        document.body.innerHTML = '<input id="foodItemId" value="1" />';
        mockManager.updateItem.mockResolvedValue(true);
        await handleSubmit(mockEvent, mockManager);
        expect(mockManager.updateItem).toHaveBeenCalled();
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
    });
});