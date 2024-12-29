import { FoodItemManager } from '../FoodItemManager.js';
import { showMessage } from '../../utils.js';
import { SortableTable } from '../../utils/sortableTable.js';
import { handleSubmit } from '../handlers/submit.js';
import { handleNameInput } from '../handlers/validation.js';

jest.mock('../../utils.js');
jest.mock('../../utils/sortableTable.js');
jest.mock('../handlers/submit.js');
jest.mock('../handlers/validation.js');

describe('FoodItemManager', () => {
    let manager;
    let mockSettingsManager;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <form id="foodItemForm">
                <div class="input-section">
                    <input type="text" id="foodItemName" name="foodItemName" value="Test Item">
                    <select id="foodItemCategory"></select>
                    <select id="itemLimitSelect"></select>
                    <input type="hidden" id="foodItemId" value="">
                    <button id="resetFoodItemForm" type="button">Reset</button>
                    <button type="submit">Add Food Item</button>
                </div>
                <div id="limitTypeContainer" style="display: none;">
                    <input type="radio" name="limitType" value="perHousehold" id="perHousehold" checked>
                    <label for="perHousehold">Per Household</label>
                    <input type="radio" name="limitType" value="perPerson" id="perPerson">
                    <label for="perPerson">Per Person</label>
                </div>
                <div class="status-section"></div>
                <div class="dietary-section"></div>
            </form>
            <div id="foodItemTableBody"></div>
            <div id="foodItemStats"></div>
        `;

        // Mock settings manager
        mockSettingsManager = {
            getCurrentLimit: jest.fn().mockReturnValue(10)
        };

        // Mock handlers
        handleSubmit.mockImplementation(e => e.preventDefault());
        handleNameInput.mockReturnValue('Test Item');

        // Create manager instance
        manager = new FoodItemManager(mockSettingsManager);

        // Reset mocks
        showMessage.mockReset();
        SortableTable.mockClear();
        handleSubmit.mockClear();
        handleNameInput.mockClear();
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('Initialization', () => {
        it('should initialize with correct DOM elements', () => {
            expect(manager.form).toBeTruthy();
            expect(manager.tableBody).toBeTruthy();
            expect(manager.itemLimitSelect).toBeTruthy();
            expect(manager.resetButton).toBeTruthy();
            expect(manager.categorySelect).toBeTruthy();
            expect(manager.nameInput).toBeTruthy();
            expect(manager.foodItemStats).toBeTruthy();
        });

        it('should initialize item limit dropdown', () => {
            expect(manager.itemLimitSelect.children.length).toBe(11); // 0-10
            const firstOption = manager.itemLimitSelect.children[0];
            expect(firstOption.value).toBe('0');
            expect(firstOption.textContent).toBe('No Limit');
        });

        it('should set up initial event listeners', () => {
            // Test form submission
            const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
            manager.form.dispatchEvent(submitEvent);
            expect(handleSubmit).toHaveBeenCalledWith(submitEvent, manager);
            expect(submitEvent.defaultPrevented).toBe(true);

            // Test input handling
            const inputEvent = new Event('input');
            manager.nameInput.dispatchEvent(inputEvent);
            expect(handleNameInput).toHaveBeenCalled();

            // Test reset button
            const resetEvent = new Event('click');
            const originalValue = manager.itemLimitSelect.value;
            manager.itemLimitSelect.value = '5';
            manager.resetButton.dispatchEvent(resetEvent);
            expect(manager.itemLimitSelect.value).toBe('0');

            // Test limit type container visibility
            const changeEvent = new Event('change');
            manager.itemLimitSelect.value = '5';
            manager.itemLimitSelect.dispatchEvent(changeEvent);
            const limitContainer = document.getElementById('limitTypeContainer');
            expect(limitContainer.style.display).toBe('block');
        });
    });

    // Rest of test cases remain the same...
});