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

        test('creates item limit select', () => {
            const form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
            
            const limitGroup = form.querySelectorAll('.form__group')[1];
            const limitLabel = limitGroup.querySelector('label');
            const limitSelect = form.querySelector('#itemLimit');

            expect(limitLabel.htmlFor).toBe('itemLimit');
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
        });

        test('reuses existing form', () => {
            const existingForm = document.createElement('form');
            existingForm.id = 'categoryForm';
            document.getElementById('formContainer').appendChild(existingForm);

            const form = createFormLayout();
            expect(form).toBe(existingForm);
        });
    });

    describe('updateFormState', () => {
        let form;

        beforeEach(() => {
            form = createFormLayout();
            document.getElementById('formContainer').appendChild(form);
        });

        test('updates for edit mode', () => {
            updateFormState(true);
            const submitBtn = form.querySelector('button[type="submit"]');
            expect(submitBtn.textContent).toBe('Update Category');
            expect(submitBtn.getAttribute('aria-label')).toBe('Update category');
        });

        test('updates for add mode', () => {
            updateFormState(false);
            const submitBtn = form.querySelector('button[type="submit"]');
            expect(submitBtn.textContent).toBe('Add Category');
            expect(submitBtn.getAttribute('aria-label')).toBe('Add category');
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
            itemLimit = form.querySelector('#itemLimit');

            // Set up form with data
            nameInput.value = 'Test Category';
            idInput.value = '1';
            itemLimit.value = '5';
        });

        test('resets all form fields', () => {
            clearForm();
            expect(nameInput.value).toBe('');
            expect(idInput.value).toBe('');
            expect(itemLimit.value).toBe('0');
        });

        test('reverts to add mode', () => {
            clearForm();
            const submitBtn = form.querySelector('button[type="submit"]');
            expect(submitBtn.textContent).toBe('Add Category');
            expect(submitBtn.getAttribute('aria-label')).toBe('Add category');
        });
    });
});