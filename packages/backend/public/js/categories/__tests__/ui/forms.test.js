/**
 * @jest-environment jsdom
 */

import { createFormLayout, updateFormState, clearForm } from '../../ui/forms.js';

describe('Form UI', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="formContainer"></div>
        `;
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('createFormLayout', () => {
        test('creates form with correct structure', () => {
            const form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
            
            expect(form.id).toBe('categoryForm');
            expect(form.tagName).toBe('FORM');
            expect(form.classList.contains('form')).toBe(true);
            expect(form.getAttribute('aria-label')).toBe('Category management form');
        });

        test('creates required hidden inputs', () => {
            const form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
            
            const idInput = form.querySelector('#categoryId');
            expect(idInput).not.toBeNull();
            expect(idInput.type).toBe('hidden');
        });

        test('creates name input with required attributes', () => {
            const form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
            
            const nameGroup = form.querySelector('.form__group');
            const nameLabel = nameGroup.querySelector('label');
            const nameInput = form.querySelector('#categoryName');

            expect(nameLabel.htmlFor).toBe('categoryName');
            expect(nameLabel.classList.contains('form__label--required')).toBe(true);
            expect(nameInput.required).toBe(true);
            expect(nameInput.getAttribute('aria-required')).toBe('true');
            expect(nameInput.getAttribute('aria-invalid')).toBe('false');
            expect(nameInput.maxLength).toBe(36);
        });

        test('creates category item limit select', () => {
            const form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
            
            const limitGroup = form.querySelectorAll('.form__group')[1];
            const limitLabel = limitGroup.querySelector('label');
            const limitSelect = form.querySelector('#categoryItemLimit');

            expect(limitLabel.htmlFor).toBe('categoryItemLimit');
            expect(limitSelect.options[0].value).toBe('0');
            expect(limitSelect.options[0].text).toBe('No Limit');
        });

        test('creates action buttons', () => {
            const form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
            
            const btnGroup = form.querySelector('.form__buttons');
            const submitBtn = btnGroup.querySelector('button[type="submit"]');
            const resetBtn = btnGroup.querySelector('button[type="reset"]');

            expect(submitBtn.textContent).toBe('Add Category');
            expect(submitBtn.getAttribute('aria-label')).toBe('Add category');
            expect(resetBtn.textContent).toBe('Reset');
            expect(resetBtn.getAttribute('aria-label')).toBe('Reset form');
            expect(resetBtn.id).toBe('resetForm');
        });

        test('reuses existing form without modifications', () => {
            const existingForm = document.createElement('form');
            existingForm.id = 'categoryForm';
            existingForm.innerHTML = '<input type="text" value="test">';
            document.getElementById('formContainer').appendChild(existingForm);

            const form = createFormLayout();
            expect(form).toBe(existingForm);
            expect(form.innerHTML).toBe('<input type="text" value="test">');
        });
    });

    describe('updateFormState', () => {
        let form;

        beforeEach(() => {
            form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
        });

        test('handles missing form gracefully', () => {
            document.body.innerHTML = '';
            updateFormState(true);
            // Should not throw error
        });

        test('handles missing submit button gracefully', () => {
            const formWithoutButton = document.createElement('form');
            formWithoutButton.id = 'categoryForm';
            document.body.innerHTML = '';
            document.body.appendChild(formWithoutButton);
            
            updateFormState(true);
            // Should not throw error
        });

        test('updates for edit mode', () => {
            updateFormState(true);
            const submitBtn = form.querySelector('button[type="submit"]');
            expect(submitBtn.textContent).toBe('Update Category');
            expect(submitBtn.getAttribute('aria-label')).toBe('Update category');
        });

        test('updates for add mode', () => {
            // First set to edit mode
            updateFormState(true);
            // Then back to add mode
            updateFormState(false);
            
            const submitBtn = form.querySelector('button[type="submit"]');
            expect(submitBtn.textContent).toBe('Add Category');
            expect(submitBtn.getAttribute('aria-label')).toBe('Add category');
        });

        test('handles skipReset parameter correctly', () => {
            const nameInput = form.querySelector('#categoryName');
            nameInput.value = 'Test';
            
            updateFormState(false, true);
            expect(nameInput.value).toBe('Test'); // Value should remain

            updateFormState(false, false);
            expect(nameInput.value).toBe(''); // Value should be cleared
        });
    });

    describe('clearForm', () => {
        let form;
        let nameInput;
        let idInput;
        let itemLimit;

        beforeEach(() => {
            form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
            nameInput = form.querySelector('#categoryName');
            idInput = form.querySelector('#categoryId');
            itemLimit = form.querySelector('#categoryItemLimit');

            // Set up form with data
            nameInput.value = 'Test Category';
            idInput.value = '1';
            itemLimit.value = '5';
            nameInput.setAttribute('aria-invalid', 'true');
        });

        test('resets all form fields', () => {
            clearForm();
            expect(nameInput.value).toBe('');
            expect(idInput.value).toBe('');
            expect(itemLimit.value).toBe('0');
            expect(nameInput.getAttribute('aria-invalid')).toBe('false');
        });

        test('handles missing form elements gracefully', () => {
            document.body.innerHTML = `
                <form id="categoryForm">
                    <input type="text" id="categoryName" value="test" />
                </form>
            `;
            
            clearForm();
            const remainingInput = document.querySelector('#categoryName');
            expect(remainingInput.value).toBe('');
        });

        test('handles completely missing form gracefully', () => {
            document.body.innerHTML = '';
            clearForm();
            // Should not throw error
        });

        test('reverts to add mode and skips reset', () => {
            // First set to edit mode
            updateFormState(true);
            
            // Mock updateFormState to verify skipReset
            const mockUpdateFormState = jest.spyOn(require('../../ui/forms.js'), 'updateFormState');
            
            clearForm();
            
            expect(mockUpdateFormState).toHaveBeenCalledWith(false, true);
            mockUpdateFormState.mockRestore();
        });

        test('resets aria states', () => {
            nameInput.setAttribute('aria-invalid', 'true');
            clearForm();
            expect(nameInput.getAttribute('aria-invalid')).toBe('false');
        });
    });
});