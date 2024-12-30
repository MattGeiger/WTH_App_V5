/**
 * @jest-environment jsdom
 */

import { createFormLayout, updateFormState, clearForm } from '../../ui/forms.js';

describe('Form UI', () => {
    let container;

    beforeEach(() => {
        // Setup DOM container
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        document.body.removeChild(container);
        jest.clearAllMocks();
    });

    describe('createFormLayout', () => {
        test('creates form with correct structure', () => {
            const form = createFormLayout();
            
            expect(form.tagName).toBe('FORM');
            expect(form.id).toBe('categoryForm');
            expect(form.className).toBe('form');
        });

        test('creates hidden input fields', () => {
            const form = createFormLayout();
            const idInput = form.querySelector('#categoryId');
            
            expect(idInput).not.toBeNull();
            expect(idInput.type).toBe('hidden');
            expect(idInput.name).toBe('categoryId');
        });

        test('creates name input group', () => {
            const form = createFormLayout();
            const nameGroup = form.querySelector('.form__group');
            const nameLabel = form.querySelector('label[for="categoryName"]');
            const nameInput = form.querySelector('#categoryName');
            
            expect(nameGroup).not.toBeNull();
            expect(nameLabel).not.toBeNull();
            expect(nameLabel.textContent).toBe('Category Name');
            expect(nameLabel.classList.contains('form__label--required')).toBe(true);
            
            expect(nameInput).not.toBeNull();
            expect(nameInput.type).toBe('text');
            expect(nameInput.required).toBe(true);
            expect(nameInput.placeholder).toBe('Enter category name');
            expect(nameInput.minLength).toBe(3);
            expect(nameInput.maxLength).toBe(36);
        });

        test('creates item limit group', () => {
            const form = createFormLayout();
            const limitGroup = form.querySelectorAll('.form__group')[1];
            const limitLabel = form.querySelector('label[for="categoryItemLimit"]');
            const limitSelect = form.querySelector('#categoryItemLimit');
            
            expect(limitGroup).not.toBeNull();
            expect(limitLabel).not.toBeNull();
            expect(limitLabel.textContent).toBe('Item Limit');
            
            expect(limitSelect).not.toBeNull();
            expect(limitSelect.tagName).toBe('SELECT');
        });

        test('creates button section', () => {
            const form = createFormLayout();
            const buttonSection = form.querySelector('.form__section--buttons');
            const submitBtn = form.querySelector('button[type="submit"]');
            const resetBtn = form.querySelector('#resetForm');
            
            expect(buttonSection).not.toBeNull();
            expect(submitBtn).not.toBeNull();
            expect(submitBtn.textContent).toBe('Add Category');
            expect(resetBtn).not.toBeNull();
            expect(resetBtn.textContent).toBe('Reset');
        });

        test('reuses existing form if present', () => {
            const existingForm = document.createElement('form');
            existingForm.id = 'categoryForm';
            container.appendChild(existingForm);

            createFormLayout();
            const forms = document.querySelectorAll('#categoryForm');
            expect(forms).toHaveLength(1);
        });
    });

    describe('updateFormState', () => {
        let form;

        beforeEach(() => {
            form = createFormLayout();
        });

        test('updates submit button text for edit mode', () => {
            updateFormState(form, true);
            const submitBtn = form.querySelector('button[type="submit"]');
            
            expect(submitBtn.textContent).toBe('Update Category');
            expect(form.classList.contains('form--editing')).toBe(true);
        });

        test('updates submit button text for add mode', () => {
            updateFormState(form, false);
            const submitBtn = form.querySelector('button[type="submit"]');
            
            expect(submitBtn.textContent).toBe('Add Category');
            expect(form.classList.contains('form--editing')).toBe(false);
        });
    });

    describe('clearForm', () => {
        let form;

        beforeEach(() => {
            form = createFormLayout();
            // Set some initial values
            form.querySelector('#categoryId').value = '1';
            form.querySelector('#categoryName').value = 'Test Category';
            form.querySelector('#categoryItemLimit').value = '5';
            updateFormState(form, true);
        });

        test('resets all form fields', () => {
            clearForm(form);
            
            expect(form.querySelector('#categoryId').value).toBe('');
            expect(form.querySelector('#categoryName').value).toBe('');
            expect(form.querySelector('#categoryItemLimit').value).toBe('');
        });

        test('resets form state to add mode', () => {
            clearForm(form);
            
            const submitBtn = form.querySelector('button[type="submit"]');
            expect(submitBtn.textContent).toBe('Add Category');
            expect(form.classList.contains('form--editing')).toBe(false);
        });
    });

    describe('Accessibility', () => {
        test('form controls have proper labels', () => {
            const form = createFormLayout();
            const labels = form.querySelectorAll('label');
            
            labels.forEach(label => {
                const control = form.querySelector(`#${label.htmlFor}`);
                expect(control).not.toBeNull();
            });
        });

        test('required fields are properly marked', () => {
            const form = createFormLayout();
            const nameLabel = form.querySelector('label[for="categoryName"]');
            const nameInput = form.querySelector('#categoryName');
            
            expect(nameLabel.classList.contains('form__label--required')).toBe(true);
            expect(nameInput.required).toBe(true);
            expect(nameInput.getAttribute('aria-required')).toBe('true');
        });

        test('input groups have proper structure', () => {
            const form = createFormLayout();
            const groups = form.querySelectorAll('.form__group');
            
            groups.forEach(group => {
                const label = group.querySelector('label');
                const input = group.querySelector('input, select');
                
                expect(label).not.toBeNull();
                expect(input).not.toBeNull();
                expect(input.id).toBe(label.htmlFor);
            });
        });

        test('buttons have clear purposes', () => {
            const form = createFormLayout();
            const submitBtn = form.querySelector('button[type="submit"]');
            const resetBtn = form.querySelector('#resetForm');
            
            expect(submitBtn.getAttribute('aria-label')).toBe('Add category');
            expect(resetBtn.getAttribute('aria-label')).toBe('Reset form');
        });

        test('form has proper validation attributes', () => {
            const form = createFormLayout();
            const nameInput = form.querySelector('#categoryName');
            
            expect(nameInput.minLength).toBe(3);
            expect(nameInput.maxLength).toBe(36);
            expect(nameInput.required).toBe(true);
            expect(nameInput.getAttribute('aria-invalid')).toBe('false');
        });
    });
});