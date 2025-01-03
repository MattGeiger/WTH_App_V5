/**
 * @jest-environment jsdom
 */

import { createFormLayout, updateFormState, clearForm } from '../../ui/forms.js';

describe('Form UI', () => {
    let mockForm;
    let mockManager;

    beforeEach(() => {
        // Create initial form structure with complete elements
        document.body.innerHTML = `
            <form id="categoryForm">
                <input type="text" id="categoryName" name="categoryName">
                <select id="categoryItemLimit">
                    <option value="0">No Limit</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                </select>
                <input type="hidden" id="categoryId" value="">
                <button type="submit">Add Category</button>
                <button type="reset" id="resetForm">Reset</button>
            </form>
        `;

        // Get the form reference first
        mockForm = document.getElementById('categoryForm');
        
        // Create mock manager with form and settings
        mockManager = {
            form: mockForm,
            settingsManager: {
                getCurrentLimit: jest.fn().mockReturnValue(10)
            }
        };
    });

    afterEach(() => {
        document.body.innerHTML = '';
        jest.clearAllMocks();
    });

    describe('createFormLayout', () => {
        it('creates complete form with all required elements', () => {
            const form = createFormLayout(mockManager);
            
            // Verify basic form structure
            expect(form.id).toBe('categoryForm');
            expect(form.classList.contains('form')).toBe(true);
            expect(form.getAttribute('aria-label')).toBe('Category management form');

            // Verify form groups
            const groups = form.querySelectorAll('.form__group');
            expect(groups.length).toBe(2); // Name and limit groups

            // Verify name input group
            const nameGroup = groups[0];
            const nameInput = nameGroup.querySelector('#categoryName');
            const nameLabel = nameGroup.querySelector('label[for="categoryName"]');
            
            expect(nameInput).toBeTruthy();
            expect(nameLabel).toBeTruthy();
            expect(nameInput.required).toBe(true);
            expect(nameInput.getAttribute('aria-required')).toBe('true');
            expect(nameInput.getAttribute('aria-invalid')).toBe('false');
            expect(nameInput.maxLength).toBe(36);

            // Verify limit select
            const limitGroup = groups[1];
            const limitSelect = limitGroup.querySelector('#categoryItemLimit');
            const limitLabel = limitGroup.querySelector('label[for="categoryItemLimit"]');
            
            expect(limitSelect).toBeTruthy();
            expect(limitLabel).toBeTruthy();
            expect(limitSelect.options[0].value).toBe('0');
            expect(limitSelect.options[0].text).toBe('No Limit');
        });

        it('handles missing settings manager gracefully', () => {
            const managerWithoutSettings = { form: mockForm };
            const form = createFormLayout(managerWithoutSettings);
            
            const limitSelect = form.querySelector('#categoryItemLimit');
            expect(limitSelect.options.length).toBe(1); // Only "No Limit" option
        });

        it('handles errors during form creation gracefully', () => {
            const invalidManager = { form: null };
            expect(() => createFormLayout(invalidManager)).toThrow('Invalid manager or missing form element');
        });
    });

    describe('updateFormState', () => {
        it('updates form to edit mode correctly', () => {
            updateFormState(mockManager, true);
            
            const submitBtn = mockForm.querySelector('button[type="submit"]');
            expect(submitBtn.textContent).toBe('Update Category');
            expect(submitBtn.getAttribute('aria-label')).toBe('Update category');
        });

        it('updates form back to add mode correctly', () => {
            updateFormState(mockManager, true);
            updateFormState(mockManager, false);
            
            const submitBtn = mockForm.querySelector('button[type="submit"]');
            expect(submitBtn.textContent).toBe('Add Category');
            expect(submitBtn.getAttribute('aria-label')).toBe('Add category');
        });

        it('handles skipReset parameter correctly', () => {
            const nameInput = mockForm.querySelector('#categoryName');
            const limitSelect = mockForm.querySelector('#categoryItemLimit');
            
            // Set initial values
            nameInput.value = 'Test Category';
            limitSelect.value = '2';
            
            // Should preserve values when skipReset is true
            updateFormState(mockManager, false, true);
            expect(nameInput.value).toBe('Test Category');
            expect(limitSelect.value).toBe('2');

            // Should clear values when skipReset is false
            updateFormState(mockManager, false, false);
            expect(nameInput.value).toBe('');
            expect(limitSelect.value).toBe('0');
        });

        it('handles missing form gracefully', () => {
            const managerWithoutForm = { ...mockManager, form: null };
            expect(() => updateFormState(managerWithoutForm, true)).not.toThrow();
        });

        it('handles missing submit button gracefully', () => {
            const submitBtn = mockForm.querySelector('button[type="submit"]');
            submitBtn.remove();
            expect(() => updateFormState(mockManager, true)).not.toThrow();
        });
    });

    describe('clearForm', () => {
        beforeEach(() => {
            const nameInput = mockForm.querySelector('#categoryName');
            const idInput = mockForm.querySelector('#categoryId');
            const limitSelect = mockForm.querySelector('#categoryItemLimit');

            nameInput.value = 'Test Category';
            nameInput.setAttribute('aria-invalid', 'true');
            idInput.value = '123';
            limitSelect.value = '2';
        });

        it('clears all form fields and resets state', () => {
            clearForm(mockManager);

            const nameInput = mockForm.querySelector('#categoryName');
            const idInput = mockForm.querySelector('#categoryId');
            const limitSelect = mockForm.querySelector('#categoryItemLimit');

            expect(nameInput.value).toBe('');
            expect(idInput.value).toBe('');
            expect(limitSelect.value).toBe('0');
            expect(nameInput.getAttribute('aria-invalid')).toBe('false');
        });

        it('handles missing form elements gracefully', () => {
            mockForm.querySelector('#categoryName').remove();
            mockForm.querySelector('#categoryId').remove();
            mockForm.querySelector('#categoryItemLimit').remove();
            
            expect(() => clearForm(mockManager)).not.toThrow();
        });

        it('handles missing manager gracefully', () => {
            expect(() => clearForm(null)).not.toThrow();
        });

        it('handles completely missing form gracefully', () => {
            const managerWithoutForm = { ...mockManager, form: null };
            expect(() => clearForm(managerWithoutForm)).not.toThrow();
        });
    });
});